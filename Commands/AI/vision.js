const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const OpenAi = require("openai");
const openaiSchema = require("../../Schemas/openaischema");
const crypto = require("crypto");
const config = require("../../config.json");

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
    .setName("vision")
    .setDescription("👀 / Read images using AI")
    .addAttachmentOption((image) =>
      image
        .setName("image")
        .setDescription("🖼️ / The image you want to read")
        .setRequired(true)
    )
    .addStringOption((query) =>
      query
        .setName("prompt")
        .setDescription("🧻 / What you want to read from the image")
        .setRequired(true)
    )
    .addStringOption((query) =>
      query
        .setName("model")
        .setDescription("🤖 / What model you want to use to read the image")
        .addChoices(
          { name: "gpt-4-turbo", value: "gpt-4-turbo" },
          { name: "gpt-4o", value: "gpt-4o" }
        )
        .setRequired(true)
    )
    .addBooleanOption((boolean) =>
      boolean
        .setName("json")
        .setDescription("🗜️ / Send the response in json file")
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */

  async execute(interaction) {
    const image = interaction.options.getAttachment("image");
    const prompt = interaction.options.getString("prompt");
    const json = interaction.options.getBoolean("json");
    const model1 = interaction.options.getString("model");

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
      const response = await retryWithExponentialBackoff(async () => {
        return await openai.chat.completions.create({
          model: json ? "gpt-4-vision-preview" : model1,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: json
                    ? prompt +
                      " " +
                      "Return JSON document with data. Only return JSON not other text"
                    : prompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: image.url,
                  },
                },
              ],
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
        return await interaction.editReply({ embeds: [correctApiKey] });
      }
      const fs = require("fs");

      if (!json) {
        const visionEmbed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("> Vision Result!")
          .setDescription(`${response.choices[0].message.content}`)
          .setAuthor({
            name: interaction.client.user.username,
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setFooter({
            text: `${interaction.user.username} asked ${prompt}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp()
          .setImage(image.url);
        await interaction.editReply({ embeds: [visionEmbed] });
      } else {
        // Extraer datos JSON de la respuesta y eliminar el formato Markdown
        let jsonString = response.choices[0].message.content
          .replace("```json\n", "")
          .replace("\n```", "");

        // Analizar la cadena en un objeto JSON
        let jsonData;
        try {
          jsonData = JSON.parse(jsonString);
        } catch (error) {
          console.error("Failed to parse JSON:", error);
          const errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("**> JSON Parsing Error!**")
            .setDescription("❌ / The response is not a valid JSON.")
            .setAuthor({
              name: interaction.client.user.username,
              iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setTimestamp();
          return await interaction.editReply({ embeds: [errorEmbed] });
        }

        // Generar un nombre de archivo único
        const uniqueFileName = `response_${crypto.randomUUID()}.json`;

        // Guardar los datos JSON en un archivo con el formato adecuado
        fs.writeFileSync(uniqueFileName, JSON.stringify(jsonData, null, 2));

        // Crear un embed para informar que el archivo se ha guardado con éxito
        const responseEmbed = new EmbedBuilder()
          .setDescription(
            `The file has been saved successfully: \`${uniqueFileName}\``
          )
          .setAuthor({
            name: interaction.client.user.username,
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setTitle("**> AI Response**")
          .setColor("Blue")
          .setTimestamp()
          .setImage(image.url)
          .setFooter({
            text: `${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          });

        // Enviar el archivo al usuario y luego eliminarlo del servidor
        await interaction.editReply({
          embeds: [responseEmbed],
          files: [{ attachment: uniqueFileName, name: uniqueFileName }],
        });
        fs.unlinkSync(uniqueFileName); // Eliminar el archivo después de enviarlo
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
  },
};
