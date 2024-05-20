const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  Client,
  PermissionsBitField,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");
const ms = require("ms");
const megadb = require("megadb");
const pfDB = new megadb.crearDB("prefix");
const cbSchema = require("../../Schemas/cbschema");
const openaiSchema = require("../../Schemas/openaischema");
const geminiSchema = require("../../Schemas/geminischema");
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
    .setName("setup")
    .setDescription("🔧 / Setup client")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
      options
        .setName(`chatbot`)
        .setDescription("🧩 / Setup chatbot commands")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("📩 / Channel to send the chatbot commands")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption((option) =>
          option
            .setName("model")
            .setDescription(
              "🤖 / Select the OpenAI Model that will use the bot."
            )
            .setRequired(true)
            .addChoices(
              { name: "gpt-3.5-turbo", value: "gpt-3.5-turbo" },
              { name: "gpt-4-turbo", value: "gpt-4-turbo" },
              { name: "gpt-4", value: "gpt-4" },
              { name: "gpt-4o", value: "gpt-4o" },
              { name: "gemini", value: "gemini" },
              { name: "gemini-pro", value: "gemini-pro" },
              { name: "gemini-flash", value: "gemini-flash" },
              { name: "facebook-ai", value: "facebook-ai" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("image-model")
            .setDescription(
              "🟨 / Select the Image Model that will use the bot."
            )
            .setRequired(true)
            .addChoices(
              { name: "dall-e-3", value: "dall-e-3" },
              { name: "dall-e-2", value: "dall-e-2" },
              { name: "v1", value: "v1" },
              { name: "v2", value: "v2" },
              { name: "v2-beta", value: "v2-beta" },
              { name: "v3", value: "v3" },
              { name: "lexica", value: "lexica" },
              { name: "prodia", value: "prodia" },
              { name: "animefly", value: "animefly" },
              { name: "raava", value: "raava" },
              { name: "shonin", value: "shonin" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("image-enhancer")
            .setDescription(
              "🧙‍♂️ / Select the image enhancer that will use the bot to generate images. (Other API models)"
            )
            .setRequired(false)
            .addChoices(
              { name: "ERSGAN_4x", value: "ERSGAN_4x" },
              { name: "R-ERSGAN 4x+", value: "R-ERSGAN 4x+" },
              { name: "R-ERSGAN 4x+ Anime6B", value: "R-ERSGAN 4x+ Anime6B" },
              { name: "lanczos", value: "lanczos" },
              { name: "Nearest", value: "Nearest" },
              { name: "LDSR", value: "LDSR" },
              { name: "ScuNET GAN", value: "ScuNET GAN" },
              { name: "ScuNET PSNR", value: "ScuNET PSNR" },
              { name: "SwinlR 4x", value: "SwinlR 4x" }
            )
        )
    )
    .addSubcommand((options) =>
      options
        .setName(`prefix`)
        .setDescription("🔰 / Setup guild prefix")
        .addStringOption((option) =>
          option
            .setName("new_prefix")
            .setDescription("🆕 / New prefix that will have the server")
            .setRequired(true)
        )
    )
    .addSubcommand((options) =>
      options
        .setName(`openai`)
        .setDescription("🔑 / Setup your OpenAI API key")
        .addStringOption((option) =>
          option
            .setName("api_k")
            .setDescription(
              "🔷 / Your OpenAI API key that will use the OpenAI based models"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((options) =>
      options
        .setName(`gemini`)
        .setDescription("🔐 / Setup your Gemini API key")
        .addStringOption((option) =>
          option
            .setName("api_key")
            .setDescription(
              "🟣 / Your Gemini API key that will use the Gemini paid based models"
            )
            .setRequired(true)
        )
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */

  async execute(interaction, client) {
    const subCommand = interaction.options.getSubcommand();

    switch (subCommand) {
      case "prefix":
        {
          if (
            !interaction.member.permissions.has(
              PermissionsBitField.Flags.Administrator
            )
          ) {
            const notenespermiso = new EmbedBuilder().setDescription(
              `❌ You need the \`Administrator\` permision to change the client prefix.`
            );
            return await interaction.reply({
              embeds: [notenespermiso],
              ephemeral: true,
            });
          }

          const prfx = interaction.options.getString("new_prefix");
          const serverId = interaction.guild.id;
          await pfDB.set(`PREFIX.${serverId}_create_newPrefix`, Date.now());

          const load = new EmbedBuilder()
            .setDescription(
              `
        ⌛ Changing client profile...
        `
            )
            .setFooter({
              text: interaction.guild.name,
              iconURL:
                interaction.guild.iconURL({ dynamic: true }) ||
                client.user.displayAvatarURL({ dynamic: true }),
            })
            .setColor("Blue");
          interaction.reply({ embeds: [load] });

          setTimeout(() => {
            await = pfDB.set(`PREFIX.${serverId}.prfx`, prfx);

            const aña = new EmbedBuilder()
              .setDescription(
                `
            ✅ Prefix changed succesfully to **${prfx}**`
              )
              .setFooter({
                text: interaction.guild.name,
                iconURL:
                  interaction.guild.iconURL({ dynamic: true }) ||
                  client.user.displayAvatarURL({ dynamic: true }),
              })
              .setAuthor({
                name: `${interaction.user.username}`,
                iconURL:
                  `${interaction.user.displayAvatarURL({
                    dynamic: true,
                    size: 1024,
                  })}` || client.user.displayAvatarURL({ dynamic: true }),
              })
              .setColor("Green");
            interaction.editReply({ embeds: [aña] });
          }, 7000);
        }
        break;
      case "chatbot": {
        const notenespermiso = new EmbedBuilder().setDescription(
          `❌ You need the \`ManageChannels\` permision to setup the chatbot.`
        );
        if (
          !interaction.member.permissions.has(
            PermissionsBitField.Flags.ManageChannels
          )
        )
          return await interaction.reply({
            embeds: [notenespermiso],
            ephemeral: true,
          });

        const canal = interaction.options.getChannel("channel");
        const model = interaction.options.getString("model");
        const image_enhancer = interaction.options.getString("image-enhancer");
        const image_model = interaction.options.getString("image-model");
        const openaiapi_key = openaiSchema.findOne({
          UserId: interaction.user.id,
        });
        const geminiapi_key = geminiSchema.findOne({
          UserId: interaction.user.id,
        });
        const data = await cbSchema.findOne({ Guild: interaction.guild.id });
        if (
          !openaiapi_key &&
          (model === "gpt-3.5-turbo" ||
            model === "gpt-4-turbo" ||
            model === "gpt-4" ||
            model === "gpt-4o")
        ) {
          const noApiKey = new EmbedBuilder().setDescription(
            `❌ You need to setup your OpenAI API key first, use the command \`setup openai\`.`
          );
          return await interaction.reply({
            embeds: [noApiKey],
            ephemeral: true,
          });
        }
        if (
          (image_model === "dall-e-3" || image_model === "dall-e-2") &&
          !(
            model === "gpt-3.5-turbo" ||
            model === "gpt-4-turbo" ||
            model === "gpt-4" ||
            model === "gpt-4o"
          )
        ) {
          const noMatch = new EmbedBuilder().setDescription(
            `❌ The image model "dall-e-3" and the image model "dall-e-2" are only available for the models "gpt-3.5-turbo", "gpt-4-turbo", "gpt-4", "gpt-4o" (OpenAI based models).`
          );
          return await interaction.reply({
            embeds: [noMatch],
            ephemeral: true,
          });
        }
        if (
          (!geminiapi_key && model === "gemini-pro") ||
          model === "gemini-flash"
        ) {
          const noApiKey = new EmbedBuilder().setDescription(
            `❌ You need to setup your Gemini API key first to use this models, execute the command \`setup gemini\`.`
          );
          return await interaction.reply({
            embeds: [noApiKey],
            ephemeral: true,
          });
        }
        if (data) {
          const exists = new EmbedBuilder().setDescription(
            `❌ You already have a chatbot system in this channel, to reset it use the command  \`disable chatbot\`.`
          );
          const otherChannel = new EmbedBuilder().setDescription(
            `❌ You already have a chatbot system in another channel, to change it use the command  \`disable chatbot\` and then \`setup chatbot\`.`
          );
          if (data.Channel === canal.id) {
            return await interaction.reply({
              embeds: [exists],
              ephemeral: true,
            });
          } else {
            return await interaction.reply({
              embeds: [otherChannel],
              ephemeral: true,
            });
          }
        }

        await cbSchema.create({
          Guild: interaction.guild.id,
          Channel: canal.id,
          Model: model,
          ImageModel: image_model,
          ImageEnhancer: image_enhancer,
        });
        const succesful = new EmbedBuilder().setDescription(
          `✅ The chatbot system has been set up correctly in ${canal}.`
        );
        const tsuccesful = new EmbedBuilder().setDescription(
          `✅ The chatbot system has been set up correctly in this channel.`
        );
        if (interaction.channelId === canal.id) {
          await interaction.reply({
            embeds: [tsuccesful],
          });
        } else {
          await interaction.reply({
            embeds: [succesful],
            ephemeral: true,
          });
        }
        break;
      }
      case "openai": {
        const apiKey = interaction.options.getString("api_k");
        const encryptedApiKey = encrypt(apiKey);
        const data = openaiSchema.findOne({
          UserId: interaction.user.id,
        });

        if (data) {
          await openaiSchema.deleteMany({ UserId: interaction.user.id });
        }

        await openaiSchema.create({
          UserId: interaction.user.id,
          ApiKey: encryptedApiKey,
        });

        const successEmbed = new EmbedBuilder().setDescription(
          `✅ Your OpenAI API key has been securely stored.`
        );
        await interaction.reply({
          embeds: [successEmbed],
          ephemeral: true,
        });
        break;
      }
      case "gemini": {
        const apiKey = interaction.options.getString("api_key");
        const encryptedApiKey = encrypt(apiKey);
        const data = geminiSchema.findOne({
          UserId: interaction.user.id,
        });

        if (data) {
          await geminiSchema.deleteMany({ UserId: interaction.user.id });
        }
        await geminiSchema.create({
          UserId: interaction.user.id,
          ApiKey: encryptedApiKey,
        });
        const successEmbed = new EmbedBuilder().setDescription(
          `✅ Your Gemini API key has been securely stored.`
        );
        await interaction.reply({
          embeds: [successEmbed],
          ephemeral: true,
        });
        break;
      }
    }
  },
};
