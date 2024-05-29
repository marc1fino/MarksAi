const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} = require("discord.js");
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
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("💬 / Ask a question to the AI")
    .addStringOption((option) =>
      option
        .setName("model")
        .setDescription("🚗 / The AI model you want to ask the question")
        .setRequired(true)
        .addChoices(
          { name: "gpt-3.5-turbo", value: "turbo" },
          { name: "gpt-4-turbo", value: "gpt-4-turbo" },
          { name: "gpt-4", value: "v3" },
          { name: "gpt-4o", value: "gpt-4o" },
          { name: "gemini", value: "gemini" },
          { name: "gpt-3.5-turbo-16k", value: "turbo-16k" },
          { name: "gpt-4-32k", value: "v3-32k" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("📝 / The question you want to ask the AI")
        .setRequired(true)
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */

  async execute(interaction) {
    const model = interaction.options.getString("model");
    const question = interaction.options.getString("question");
    const loadingEmbed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("**> Loading...**")
      .setDescription("⏳ / Wait a moment while I process the question...")
      .setAuthor({
        name: interaction.client.user.username,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();
    await interaction.reply({ embeds: [loadingEmbed] });
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
          name: interaction.client.user.username,
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTitle("**> AI Response**")
        .setColor("Blue")
        .setTimestamp()
        .setFooter({
          text: `${interaction.user.username} asked ${question}`,
          iconURL: interaction.user.displayAvatarURL(),
        });
      await interaction.editReply({ embeds: [responseEmbed] });
    } else {
      const apiKey = await openaiSchema.findOne({
        UserId: interaction.user.id,
      });
      if (!apiKey) {
        const noApiKey = new EmbedBuilder()
          .setColor("Red")
          .setTitle("**> You need an API Key!**")
          .setDescription(
            "❌ / You need to setup your OpenAI API key to use this command, you can do it using `/setup openai`."
          )
          .setAuthor({
            name: interaction.client.user.username,
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setTimestamp();
        return await interaction.editReply({ embeds: [noApiKey] });
      }
      try {
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
        const username = interaction.user.username
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
              name: interaction.client.user.username,
              iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setTimestamp();
          await interaction.editReply({ embeds: [correctApiKey] });
        } else {
          const responseEmbed = new EmbedBuilder()
            .setDescription(
              `This was the ${model} response: \n \`\`\`${response.choices[0].message.content}\`\`\``
            )
            .setAuthor({
              name: interaction.client.user.username,
              iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setTitle("**> AI Response**")
            .setColor("Blue")
            .setTimestamp()
            .setFooter({
              text: `${interaction.user.username} asked ${question}`,
              iconURL: interaction.user.displayAvatarURL(),
            });
          await interaction.editReply({ embeds: [responseEmbed] });
        }
      } catch (error) {
        console.error(error);
        const errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("**> OpenAI Error!**")
          .setDescription(
            `❌ / An error occurred. Make sure the OpenAI API key is not invalid, has enough quota, and the prompt is allowed.`
          )
          .setFooter({
            text: interaction.client.user.username,
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setTimestamp();
        return await interaction.editReply({ embeds: [errorEmbed] });
      }
    }
  },
};
