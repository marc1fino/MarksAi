const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Message,
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
  name: "vision",
  /**
   * @param {Message} message
   * @param {String[]} args
   */
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

    const prompt = getArgValue(args, "prompt:");
    const model1 = getArgValue(args, "model:");
    const json = getArgValue(args, "json:");

    console.log("Model:", model1); // Verifica el valor de model1
    console.log("Prompt:", prompt); // Verifica el valor de prompt
    console.log("JSON:", json); // Verifica el valor de json

    if (!prompt || !model1) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("**> Error**")
        .setDescription(
          "❌ / Please provide an image using 'image:', a prompt using 'prompt:', and a model using 'model:'."
        )
        .setAuthor({
          name: message.client.user.username,
          iconURL: message.client.user.displayAvatarURL(),
        })
        .setTimestamp();
      return message.reply({ embeds: [errorEmbed] });
    }

    const image = message.attachments.first();
    if (!image) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("**> Error**")
        .setDescription("❌ / Please provide a valid image")
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
      .setDescription("⏳ / Wait a moment while I process the question...")
      .setAuthor({
        name: message.client.user.username,
        iconURL: message.client.user.displayAvatarURL(),
      })
      .setTimestamp();
    const first = await message.reply({ embeds: [loadingEmbed] });

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
      return await first.edit({ embeds: [noApiKey] });
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
          model: model1,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text:
                    json && json !== "False"
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
            name: message.client.user.username,
            iconURL: message.client.user.displayAvatarURL(),
          })
          .setTimestamp();
        return await first.edit({ embeds: [correctApiKey] });
      }
      const fs = require("fs");

      if (!json || json === "False") {
        const visionEmbed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("> Vision Result!")
          .setDescription(`${response.choices[0].message.content}`)
          .setAuthor({
            name: message.client.user.username,
            iconURL: message.client.user.displayAvatarURL(),
          })
          .setFooter({
            text: `${message.author.username} asked ${prompt}`,
            iconURL: message.author.displayAvatarURL(),
          })
          .setTimestamp()
          .setImage(image.url);
        await first.edit({ embeds: [visionEmbed] });
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
              name: message.client.user.username,
              iconURL: message.client.user.displayAvatarURL(),
            })
            .setTimestamp();
          return await first.edit({ embeds: [errorEmbed] });
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
            name: message.client.user.username,
            iconURL: message.client.user.displayAvatarURL(),
          })
          .setTitle("**> AI Response**")
          .setColor("Blue")
          .setTimestamp()
          .setImage(image.url)
          .setFooter({
            text: `${message.author.username}`,
            iconURL: message.author.displayAvatarURL(),
          });

        // Enviar el archivo al usuario y luego eliminarlo del servidor
        await first.edit({
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
          text: message.client.user.username,
          iconURL: message.client.user.displayAvatarURL(),
        })
        .setTimestamp();
      return await first.edit({ embeds: [errorEmbed] });
    }
  },
};
