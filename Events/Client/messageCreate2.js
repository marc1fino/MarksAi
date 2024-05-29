const megadb = require("megadb");
const pfDB = new megadb.crearDB("prefix");
const OpenAi = require("openai");
const cbSchema = require("../../Schemas/cbschema");
const { EmbedBuilder } = require("discord.js");
const openaiSchema = require("../../Schemas/openaischema");
const crypto = require("crypto");
const config = require("../../config.json");
const translate = require("translate-google");

const algorithm = "aes-256-cbc";
const secretKey = config.secret;
const iv = crypto.randomBytes(16);

// Función para cifrar
function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// Función para descifrar
function decrypt(text) {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message, client, interaction, guild) {
    const ignore_prefix =
      (await pfDB.get(`PREFIX.${message.guild.id}.prfx`)) || "+";
    const Aidata = await cbSchema.findOne({ Guild: message.guild.id });
    const apiKey = await openaiSchema.findOne({ UserId: message.author.id });
    const correctApiKey = new EmbedBuilder()
      .setColor("Red")
      .setTitle("**> Invalid API Key!**")
      .setDescription(
        `❌ / An error ocurred, make sure the OpenAI API key isn't invalid or the api key have enough quota.`
      )
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();
    const errorEmbed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("**> OpenAI Error!**")
      .setDescription(
        `❌ / An error occurred. Make sure the OpenAI API key is not invalid, has enough quota, and the prompt is allowed.`
      )
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();
    if (!Aidata || !apiKey) return;

    if (message.channel.id !== Aidata.Channel) return;
    if (message.author.bot) return;
    if (
      message.content.startsWith(ignore_prefix) &&
      !message.mentions.users.has(client.user.id)
    )
      return;
    if (Aidata.Model === "gpt-4-turbo" || Aidata.Model === "gpt-4o") {
      const retryWithExponentialBackoff = async (
        fn,
        retries = 5,
        delay = 1000
      ) => {
        try {
          return await fn();
        } catch (error) {
          if (retries === 0) throw error;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return retryWithExponentialBackoff(fn, retries - 1, delay * 2);
        }
      };

      const openai = new OpenAi({
        apiKey: decrypt(apiKey.ApiKey),
      });
      try {
        await translate(message.content, {
          to: "en",
        }).then(async (res) => {
          const translatedText = res;

          if (
            translatedText.toLowerCase().startsWith("imagine") ||
            translatedText.toLowerCase().startsWith("create") ||
            translatedText.toLowerCase().startsWith("draw") ||
            translatedText.toLowerCase().startsWith("generate") ||
            translatedText.toLowerCase().startsWith("paint") ||
            translatedText.toLowerCase().startsWith("sketch") ||
            translatedText.toLowerCase().startsWith("design") ||
            translatedText.toLowerCase().startsWith("illustrate")
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
            let prevMessages = await message.channel.messages.fetch({
              limit: 10,
            });
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
            clearInterval(sendTypingInterval);
            const response = await retryWithExponentialBackoff(() =>
              openai.chat.completions.create({
                model: Aidata.Model,
                messages: conversation,
                max_tokens: 100,
              })
            );

            if (!response) {
              message.reply({ embeds: [correctApiKey] });
              return;
            }
            const responseMessage = response.choices[0].message.content;
            const chunkSizeLimit = 2000;

            for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
              const chunk = responseMessage.substring(i, i + chunkSizeLimit);
              await message.reply({ content: chunk });
            }
          }
        });
      } catch (error) {
        console.error(error);
        message.reply({ embeds: [errorEmbed] });
        return;
      }
    }
  },
};
