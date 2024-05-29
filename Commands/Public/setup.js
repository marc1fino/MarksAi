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
const Personality = require("../../Schemas/personalityschema");
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
            .setDescription("🤖 / Select the Text Model that will use the bot.")
            .setRequired(true)
            .addChoices(
              { name: "gpt-3.5-turbo", value: "turbo" },
              { name: "gpt-3.5-turbo-16k", value: "turbo-16k" },
              { name: "gpt-4-turbo", value: "gpt-4-turbo" },
              { name: "gpt-4", value: "v3" },
              { name: "gpt-4-32k", value: "v3-32k" },
              { name: "gpt-4o", value: "gpt-4o" },
              { name: "gemini", value: "gemini" },
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
              { name: "raava", value: "raava" },
              { name: "shonin", value: "shonin" },
              {
                name: "animagineXLV3_v30.safetensors[75f2f05b]",
                value: "animagineXLV3_v30.safetensors[75f2f05b]",
              },
              {
                name: "dreamshaperXL10_alpha2.safetensors[c8afe2ef]",
                value: "dreamshaperXL10_alpha2.safetensors[c8afe2ef]",
              },
              {
                name: "dynavisionXL_0411.safetensors[c39cc051]",
                value: "dynavisionXL_0411.safetensors[c39cc051]",
              },
              {
                name: "juggernautXL_v45.safetensors[e75f5471]",
                value: "juggernautXL_v45.safetensors[e75f5471]",
              },
              {
                name: "realismEngineSDXL_v10.safetensors[af771c3f]",
                value: "realismEngineSDXL_v10.safetensors[af771c3f]",
              },
              {
                name: "realvisxlV40.safetensors[f7fdcb51]",
                value: "realvisxlV40.safetensors[f7fdcb51]",
              },
              {
                name: "sd_xl_base_1.0_inpainting_0.1.safetensors[5679a81a]",
                value: "sd_xl_base_1.0_inpainting_0.1.safetensors[5679a81a]",
              },
              {
                name: "3Guofeng3_v34.safetensors[50f420de]",
                value: "3Guofeng3_v34.safetensors[50f420de]",
              },
              {
                name: "absolutereality_V16.safetensors[37db0fc3]",
                value: "absolutereality_V16.safetensors[37db0fc3]",
              },
              {
                name: "amIReal_V41.safetensors[0a8a2e61]",
                value: "amIReal_V41.safetensors[0a8a2e61]",
              },
              {
                name: "analog-diffusion-1.0.ckpt[9ca13f02]",
                value: "analog-diffusion-1.0.ckpt[9ca13f02]",
              },
              {
                name: "anythingv3_0-pruned.ckpt[2700c435]",
                value: "anythingv3_0-pruned.ckpt[2700c435]",
              },
              {
                name: "anything-v4.5-pruned.ckpt[65745d25]",
                value: "anything-v4.5-pruned.ckpt[65745d25]",
              },
              {
                name: "anythingV5_PrtRE.safetensors[893e49b9]",
                value: "anythingV5_PrtRE.safetensors[893e49b9]",
              },
              {
                name: "AOM3A3_orangemixs.safetensors[9600da17]",
                value: "AOM3A3_orangemixs.safetensors[9600da17]",
              }
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
        .addStringOption((option) =>
          option
            .setName("negative-prompt")
            .setDescription(
              "🔴 / The negative prompt to use for generating the image"
            )
        )
        .addIntegerOption((option) =>
          option
            .setName("seed")
            .setDescription("🔱 / The seed to use for generating the image")
            .setMinValue(0)
            .setMaxValue(10000000000)
        )
        .addIntegerOption((option) =>
          option
            .setName("steps")
            .setDescription("👞 / The steps to use for generating the image")
            .setMinValue(0)
            .setMaxValue(100)
        )
        .addStringOption((option) =>
          option
            .setName("image-style")
            .setDescription(
              "🎨 / The image style to use for generating the image"
            )
            .addChoices(
              { name: "3d-model", value: "3d-model" },
              { name: "analog-film", value: "analog-film" },
              { name: "animefly", value: "animefly" },
              { name: "cinematic", value: "cinematic" },
              { name: "comic-book", value: "comic-book" },
              { name: "digital-art", value: "digital-art" },
              { name: "enhance", value: "enhance" },
              { name: "isometric", value: "isometric" },
              { name: "fantasy-art", value: "fantasy-art" },
              { name: "line-art", value: "line-art" },
              { name: "low-poly", value: "low-poly" },
              { name: "neon-punk", value: "neon-punk" },
              { name: "origami", value: "origami" },
              { name: "photographic", value: "photographic" },
              { name: "pixel-art", value: "pixel-art" },
              { name: "texture", value: "texture" },
              { name: "craft-clay", value: "craft-clay" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("sampler")
            .setDescription("💫 / The sampler to use for generating the image")
            .addChoices(
              { name: "DPM++ 2M Karras", value: "DPM++ 2M Karras" },
              { name: "DPM++ SDE Karras", value: "DPM++ SDE Karras" },
              {
                name: "DPM++ 2M SDE Exponential",
                value: "DPM++ 2M SDE Exponential",
              },
              { name: "DPM++ 2M SDE Karras", value: "DPM++ 2M SDE Karras" },
              { name: "Euler a", value: "Euler a" },
              { name: "Euler", value: "Euler" },
              { name: "LMS", value: "LMS" },
              { name: "Heun", value: "Heun" },
              { name: "DPM2", value: "DPM2" },
              { name: "DPM2 a", value: "DPM2 a" },
              {
                name: "DPM++ 2M SDE Heun Karras",
                value: "DPM++ 2M SDE Heun Karras",
              },
              {
                name: "DPM++ 2M SDE Heun Exponential",
                value: "DPM++ 2M SDE Heun Exponential",
              },
              { name: "DPM++ 3M SDE", value: "DPM++ 3M SDE" },
              { name: "DPM++ 3M SDE Karras", value: "DPM++ 3M SDE Karras" },
              {
                name: "DPM++ 3M SDE Exponential",
                value: "DPM++ 3M SDE Exponential",
              },
              { name: "DPM fast", value: "DPM fast" },
              { name: "DPM adaptive", value: "DPM adaptive" },
              { name: "LMS Karras", value: "LMS Karras" },
              { name: "DPM2 Karras", value: "DPM2 Karras" },
              { name: "DPM2 a Karras", value: "DPM2 a Karras" },
              { name: "DPM++ 2S a Karras", value: "DPM++ 2S a Karras" },
              { name: "Restart", value: "Restart" },
              { name: "DDIM", value: "DDIM" },
              { name: "PLMS", value: "PLMS" },
              { name: "UniPC", value: "UniPC" }
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
    )
    .addSubcommand((options) =>
      options
        .setName(`personality`)
        .setDescription("🎅 / Setup your custom personality AI")
        .addStringOption((option) =>
          option
            .setName("based_model")
            .setDescription(
              "📳 / The based model that will use the personality AI"
            )
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
            .setName("prompt")
            .setDescription("🕴 / How will the custom personality work")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("🅰 / The name of the custom personality")
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
        const image_seed = interaction.options.getString("image-seed");
        const image_steps = interaction.options.getString("image-steps");
        const image_sampler = interaction.options.getString("image-sampler");
        const image_style = interaction.options.getString("image-style");
        const negative_prompt =
          interaction.options.getString("negative-prompt");
        const openaiapi_key = openaiSchema.findOne({
          UserId: interaction.user.id,
        });
        const geminiapi_key = geminiSchema.findOne({
          UserId: interaction.user.id,
        });
        const data = await cbSchema.findOne({ Guild: interaction.guild.id });
        if (!openaiapi_key && (model === "gpt-4-turbo" || model === "gpt-4o")) {
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
          !(model === "gpt-4-turbo" || model === "gpt-4o")
        ) {
          const noMatch = new EmbedBuilder().setDescription(
            `❌ The image model "dall-e-3" and the image model "dall-e-2" are only available for the models "gpt-4-turbo" and "gpt-4o" (OpenAI based models).`
          );
          return await interaction.reply({
            embeds: [noMatch],
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
          ImageSeed: image_seed,
          ImageSteps: image_steps,
          ImageSampler: image_sampler,
          NegativePrompt: negative_prompt,
          ImageStyle: image_style,
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
      case "personality": {
        const based_model = interaction.options.getString("based_model");
        const prompt = interaction.options.getString("prompt");
        const name = interaction.options.getString("name");

        let user = await Personality.findOne({ UserId: interaction.user.id });

        if (user) {
          // Si el usuario existe, agrega una nueva personalidad al array
          user.Personalities.push({
            name: name,
            value: prompt,
          });
          await user.save();
        } else {
          // Si el usuario no existe, crea un nuevo documento
          user = new Personality({
            UserId: interaction.user.id,
            Personalities: [{ name: name, value: prompt }],
            BasedModel: based_model,
          });
          await user.save();
        }

        const successEmbed = new EmbedBuilder().setDescription(
          `✅ Your custom personality has been set up correctly.`
        );
        await interaction.reply({
          embeds: [successEmbed],
          ephemeral: true,
        });
      }
    }
  },
};
