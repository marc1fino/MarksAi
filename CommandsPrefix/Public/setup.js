const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  Client,
  PermissionsBitField,
  EmbedBuilder,
  ChannelType,
  Message,
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
  name: "setup",
  async execute(message, args) {
    const subcommand = args[0];

    if (
      !subcommand ||
      !["chatbot", "openai", "gemini", "prefix"].includes(subcommand)
    ) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("**> Error**")
        .setDescription(
          "❌ / Please choose a valid setup option: 'chatbot', 'openai', 'prefix' or 'gemini'."
        )
        .setAuthor({
          name: message.client.user.username,
          iconURL: message.client.user.displayAvatarURL(),
        })
        .setTimestamp();
      return message.reply({ embeds: [errorEmbed] });
    }
    switch (subcommand) {
      case "chatbot": {
        const notenespermiso = new EmbedBuilder().setDescription(
          `❌ You need the \`ManageChannels\` permision to setup the chatbot.`
        );
        if (
          !message.member.permissions.has(
            PermissionsBitField.Flags.ManageChannels
          )
        )
          return await message.reply({
            embeds: [notenespermiso],
          });

        const canalIndex = args.indexOf("channel:");
        const modelIndex = args.indexOf("model:");
        const imageModelIndex = args.indexOf("image_model:");

        if (canalIndex === -1 || modelIndex === -1 || imageModelIndex === -1) {
          const errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("**> Error**")
            .setDescription(
              "❌ / Please provide a channel using 'canal:', a model using 'model:' and an image model using 'image_model:'."
            )
            .setAuthor({
              name: message.client.user.username,
              iconURL: message.client.user.displayAvatarURL(),
            })
            .setTimestamp();
          return message.reply({ embeds: [errorEmbed] });
        }

        const canal = message.mentions.channels.first();

        if (!canal) {
          const errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("**> Error**")
            .setDescription(
              "❌ / Please provide a valid channel using 'channel:'"
            )
            .setAuthor({
              name: message.client.user.username,
              iconURL: message.client.user.displayAvatarURL(),
            })
            .setTimestamp();
          return message.reply({ embeds: [errorEmbed] });
        }
        const model = args.slice(modelIndex + 1, imageModelIndex).join(" ");
        const image_model = args
          .slice(imageModelIndex + 1, args.length)
          .join(" ");
        const image_enhancer = args.includes("image_enhancer:")
          ? args[args.indexOf("image_enhancer:") + 1]
          : "";
        const image_seed = args.includes("image_seed:")
          ? args[args.indexOf("image_seed:") + 1]
          : "";
        const image_steps = args.includes("image_steps:")
          ? args[args.indexOf("image_steps:") + 1]
          : "";
        const image_sampler = args.includes("image_sampler:")
          ? args[args.indexOf("image_sampler:") + 1]
          : "";
        const image_style = args.includes("image_style:")
          ? args[args.indexOf("image_style:") + 1]
          : "";
        const negative_prompt = args.includes("negative_prompt:")
          ? args.slice(args.indexOf("negative_prompt:") + 1).join(" ")
          : "";
        const data = await cbSchema.findOne({ Guild: message.guild.id });
        const openaiapi_key = await openaiSchema.findOne({
          UserId: message.author.id,
        });
        const geminiapi_key = geminiSchema.findOne({
          UserId: message.author.id,
        });
        if (!openaiapi_key && (model === "gpt-4-turbo" || model === "gpt-4o")) {
          const noApiKey = new EmbedBuilder().setDescription(
            `❌ You need to setup your OpenAI API key first, use the command \`setup openai\`.`
          );
          return await message.reply({
            embeds: [noApiKey],
          });
        }
        if (
          (image_model === "dall-e-3" || image_model === "dall-e-2") &&
          !(model === "gpt-4-turbo" || model === "gpt-4o")
        ) {
          const noMatch = new EmbedBuilder().setDescription(
            `❌ The image model "dall-e-3" and the image model "dall-e-2" are only available for the models "gpt-3.5-turbo", "gpt-4-turbo", "gpt-4", "gpt-4o" (OpenAI based models).`
          );
          return await message.reply({
            embeds: [noMatch],
          });
        }
        if (
          (!geminiapi_key && model === "gemini-pro") ||
          model === "gemini-flash"
        ) {
          const noApiKey = new EmbedBuilder().setDescription(
            `❌ You need to setup your Gemini API key first to use this models, execute the command \`setup gemini\`.`
          );
          return await message.reply({
            embeds: [noApiKey],
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
            return await message.reply({
              embeds: [exists],
            });
          } else {
            return await message.reply({
              embeds: [otherChannel],
            });
          }
        }

        await cbSchema.create({
          Guild: message.guild.id,
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
        if (message.channel.id === canal.id) {
          await message.reply({
            embeds: [tsuccesful],
          });
        } else {
          await message.reply({
            embeds: [succesful],
            ephemeral: true,
          });
        }
        break;
      }
      case "openai": {
        const apiKeyIndex = args.indexOf("api_key:");
        if (apiKeyIndex === -1) {
          const errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("**> Error**")
            .setDescription("❌ / Please provide an API key using 'api_key:'.")
            .setAuthor({
              name: message.client.user.username,
              iconURL: message.client.user.displayAvatarURL(),
            })
            .setTimestamp();
          return message.reply({ embeds: [errorEmbed] });
        }
        const apiKey = args.slice(apiKeyIndex + 1).join(" ");
        const encryptedApiKey = encrypt(apiKey);
        const data = openaiSchema.findOne({
          UserId: message.author.id,
        });
        if (data) {
          await openaiSchema.deleteMany({ UserId: message.author.id });
        }

        await openaiSchema.create({
          UserId: message.author.id,
          ApiKey: encryptedApiKey,
        });

        const successEmbed = new EmbedBuilder().setDescription(
          `✅ Your OpenAI API key has been securely stored.`
        );
        await message.reply({
          embeds: [successEmbed],
        });
        break;
      }
      case "gemini": {
        const apiKeyIndex = args.indexOf("api_key:");
        if (apiKeyIndex === -1) {
          const errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("**> Error**")
            .setDescription("❌ / Please provide an API key using 'api_key:'.")
            .setAuthor({
              name: message.client.user.username,
              iconURL: message.client.user.displayAvatarURL(),
            })
            .setTimestamp();
          return message.reply({ embeds: [errorEmbed] });
        }
        const apiKey = args.slice(apiKeyIndex + 1).join(" ");
        const encryptedApiKey = encrypt(apiKey);
        const data = geminiSchema.findOne({
          UserId: message.author.id,
        });
        if (data) {
          await geminiSchema.deleteMany({ UserId: message.author.id });
        }
        await geminiSchema.create({
          UserId: message.author.id,
          ApiKey: encryptedApiKey,
        });
        const successEmbed = new EmbedBuilder().setDescription(
          `✅ Your Gemini API key has been securely stored.`
        );
        await message.reply({
          embeds: [successEmbed],
        });
        break;
      }
      case "prefix": {
        if (
          !message.member.permissions.has(
            PermissionsBitField.Flags.Administrator
          )
        ) {
          const notenespermiso = new EmbedBuilder().setDescription(
            `❌ You need the \`Administrator\` permision to change the client prefix.`
          );
          return await message.reply({
            embeds: [notenespermiso],
          });
        }

        const prfxIndex = args.indexOf("prefix:");
        if (prfxIndex === -1) {
          const errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("**> Error**")
            .setDescription("❌ / Please provide a prefix using 'prefix:'.")
            .setAuthor({
              name: message.client.user.username,
              iconURL: message.client.user.displayAvatarURL(),
            })
            .setTimestamp();
          return message.reply({ embeds: [errorEmbed] });
        }
        const prfx = args.slice(prfxIndex + 1).join(" ");
        if (!prfx) {
          const errorEmbed = new EmbedBuilder()
            .setAuthor({
              name: message.client.user.username,
              iconURL: message.client.user.displayAvatarURL({ dynamic: true }),
            })
            .setColor("Red")
            .setTitle("> ❌ You need to specify a prefix to change")
            .setDescription("Please specify a prefix to change")
            .setFooter({
              text: message.author.username,
              iconURL: message.author.displayAvatarURL({ dynamic: true }),
            });

          return message.reply({
            embeds: [errorEmbed],
          });
        }
        const serverId = message.guild.id;

        await pfDB.set(`PREFIX.${serverId}_create_newPrefix`, Date.now());

        const load = new EmbedBuilder()
          .setDescription(
            `
        ⌛ Changing client profile...
        `
          )
          .setFooter({
            text: message.guild.name,
            iconURL:
              message.guild.iconURL({ dynamic: true }) ||
              message.client.user.displayAvatarURL({ dynamic: true }),
          })
          .setColor("Blue");

        const sentMessage = await message.reply({
          embeds: [load],
        });

        setTimeout(async () => {
          await pfDB.set(`PREFIX.${serverId}.prfx`, prfx);

          const updatedEmbed = new EmbedBuilder()
            .setDescription(
              `
            ✅ Prefix changed successfully to **${prfx}**
          `
            )
            .setFooter({
              text: message.guild.name,
              iconURL:
                message.guild.iconURL({ dynamic: true }) ||
                message.client.user.displayAvatarURL({ dynamic: true }),
            })
            .setAuthor({
              name: `${message.author.username}`,
              iconURL:
                `${message.author.displayAvatarURL({
                  dynamic: true,
                  size: 1024,
                })}` || message.client.user.displayAvatarURL({ dynamic: true }),
            })
            .setColor("Green");

          // Edita el mensaje enviado anteriormente con el nuevo embed
          await sentMessage.edit({ embeds: [updatedEmbed] });
        }, 7000);
        break;
      }
    }
  },
};
