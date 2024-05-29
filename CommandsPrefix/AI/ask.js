const { EmbedBuilder } = require("discord.js");
const OpenAi = require("openai");
const openaiSchema = require("../../Schemas/openaischema");
const crypto = require("crypto");
const config = require("../../config.json");
const { ApexChat } = require("apexify.js");

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
  name: "ask",
  async execute(message, args) {
    const getArgValue = (args, key) => {
      const index = args.indexOf(key);
      if (index === -1) return null;
      const nextIndex = args.findIndex(
        (arg, i) => i > index && arg.includes(":")
      );
      return args
        .slice(index + 1, nextIndex !== -1 ? nextIndex : args.length)
        .join(" ");
    };

    const model = getArgValue(args, "model:");
    const question = getArgValue(args, "question:");

    if (!model || !question) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("**> Error**")
        .setDescription(
          "❌ / Please provide both a model using 'model:' and a question using 'question:'."
        )
        .setAuthor({
          name: message.client.user.username,
          iconURL: message.client.user.displayAvatarURL(),
        })
        .setTimestamp();
      return message.reply({ embeds: [errorEmbed] });
    }
    const loadingEmbed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("**> Loading...**")
      .setDescription("⏳ / Wait a moment while I process the question.")
      .setAuthor({
        name: message.client.user.username,
        iconURL: message.client.user.displayAvatarURL(),
      })
      .setTimestamp();
    const loading = await message.reply({ embeds: [loadingEmbed] });

    if (
      model === "gemini" ||
      model === "v3-32k" ||
      model === "turbo-16k" ||
      model === "turbo" ||
      model === "v3"
    ) {
      const response = await ApexChat(model, question);
      const responseEmbed = new EmbedBuilder()
        .setDescription(
          `This was the ${model} response: \n \`\`\`${response}\`\`\``
        )
        .setAuthor({
          name: message.client.user.username,
          iconURL: message.client.user.displayAvatarURL(),
        })
        .setTitle("**> AI Response**")
        .setColor("Blue")
        .setTimestamp()
        .setFooter({
          text: `${message.author.username} asked ${question}`,
          iconURL: message.author.displayAvatarURL(),
        });
      await loading.edit({ embeds: [responseEmbed] });
    } else {
      const apiKey = await openaiSchema.findOne({
        UserId: message.author.id,
      });
      if (!apiKey) {
        const noApiKey = new EmbedBuilder()
          .setColor("Red")
          .setTitle("**> You need an API Key!**")
          .setDescription(
            "❌ / You need to setup your OpenAI API key to use this command, you can do it using `/setup openai`."
          )
          .setAuthor({
            name: message.client.user.username,
            iconURL: message.client.user.displayAvatarURL(),
          })
          .setTimestamp();
        return await loading.edit({ embeds: [noApiKey] });
      }
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
      const username = message.author.username
        .replace(/\s+/g, "_")
        .replace(/[^\w\s]/gi, "");
      const response = await retryWithExponentialBackoff(async () => {
        return await openai.chat.completions.create({
          model: model,
          messages: [
            {
              role: "system",
              content: "You are a helpful and friendly chatbot.",
            },
            {
              role: "user",
              name: username,
              content: question,
            },
          ],
        });
      });
      if (!response) {
        const correctApiKey = new EmbedBuilder()
          .setColor("Red")
          .setTitle("**> Invalid API Key!**")
          .setDescription(
            `❌ / An error ocurred, make sure the OpenAI API key isn't invalid or the api key have enough quota.`
          )
          .setAuthor({
            name: message.client.user.username,
            iconURL: message.client.user.displayAvatarURL(),
          })
          .setTimestamp();
        await loading.edit({ embeds: [correctApiKey] });
      } else {
        const responseEmbed = new EmbedBuilder()
          .setDescription(
            `This was the ${model} response: \n \`\`\`${response.choices[0].message.content}\`\`\``
          )
          .setAuthor({
            name: message.client.user.username,
            iconURL: message.client.user.displayAvatarURL(),
          })
          .setTitle("**> AI Response**")
          .setColor("Blue")
          .setTimestamp()
          .setFooter({
            text: `${message.author.username} asked ${question}`,
            iconURL: message.author.displayAvatarURL(),
          });
        await loading.edit({ embeds: [responseEmbed] });
      }
    }
  },
};
