const megadb = require("megadb");
const pfDB = new megadb.crearDB("prefix");
const OpenAi = require("openai");
const cbSchema = require("../../Schemas/cbschema");
const { EmbedBuilder } = require("discord.js");
module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message, client, interaction, guild) {
    const ignore_prefix =
      (await pfDB.get(`PREFIX.${message.guild.id}.prfx`)) || "+";
    const Aidata = await cbSchema.findOne({ Guild: message.guild.id });
    const apiKeyExists = await cbSchema.exists({
      ApiKey: { $exists: true, $ne: null },
    });
    const correctApiKey = new EmbedBuilder()
      .setColor("Red")
      .setTitle("**> Invalid API Key!**")
      .setDescription(
        `❌ / An error ocurred, make sure the OpenAI API key isn't invalid.`
      )
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();

    if (!Aidata || !apiKeyExists) return;

    const openai = new OpenAi({ apiKey: Aidata.ApiKey });

    if (message.channel.id !== Aidata.Channel) return;
    if (message.author.bot) return;
    if (
      message.content.startsWith(ignore_prefix) &&
      !message.mentions.users.has(client.user.id)
    )
      return;

    const retryWithExponentialBackoff = async (
      fn,
      retries = 5,
      delay = 1000
    ) => {
      try {
        return await fn();
      } catch (error) {
        if (retries === 0 || error.response.status !== 429) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return retryWithExponentialBackoff(fn, retries - 1, delay * 2);
      }
    };

    try {
      if (
        message.content.toLowerCase().startsWith("imagine") ||
        message.content.toLowerCase().startsWith("create") ||
        message.content.toLowerCase().startsWith("generate")
      ) {
        const sendTypingInterval = setInterval(() => {
          message.channel.sendTyping();
        }, 5000);
        const response = await retryWithExponentialBackoff(() =>
          openai.images.generate({
            prompt: message.content,
            model: Aidata.ImageModel,
            quality: "standard",
            n: 1,
          })
        );
        clearInterval(sendTypingInterval);
        const image_url = response.data[0].url;
        message.reply({ content: image_url });
      } else {
        const sendTypingInterval = setInterval(() => {
          message.channel.sendTyping();
        }, 5000);

        let conversation = [];
        conversation.push({
          role: "system",
          content: "You are a helpful and friendly chatbot.",
        });
        let prevMessages = await message.channel.messages.fetch({ limit: 10 });
        prevMessages.reverse();

        prevMessages.forEach((msg) => {
          if (msg.author.bot && msg.author.id !== client.user.id) return;
          if (msg.content.startsWith(ignore_prefix)) return;

          const username = msg.author.username
            .replace(/\s+/g, "_")
            .replace(/[^\w\s]/gi, "");

          if (msg.author.id === client.user.id) {
            conversation.push({
              role: "assistant",
              name: username,
              content: msg.content,
            });
            return;
          }
          conversation.push({
            role: "user",
            name: username,
            content: msg.content,
          });
        });

        const response = await retryWithExponentialBackoff(() =>
          openai.chat.completions.create({
            model: Aidata.Model,
            messages: conversation,
            max_tokens: 100,
          })
        );
        clearInterval(sendTypingInterval);

        const responseMessage = response.choices[0].message.content;
        const chunkSizeLimit = 2000;

        for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
          const chunk = responseMessage.substring(i, i + chunkSizeLimit);
          await message.reply({ content: chunk });
        }
      }
    } catch (error) {
      console.error(`OpenAI Error:\n`, error);
    }
  },
};
