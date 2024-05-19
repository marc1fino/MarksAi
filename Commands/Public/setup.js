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
module.exports = {
  developer: true,
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
            .setName("api_key")
            .setDescription(
              "🔭 / The OpenAI API key that will be used to generate responses."
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("model")
            .setDescription(
              "🤖 / Select the OpenAI Model that will use the bot."
            )
            .setRequired(true)
            .addChoices(
              { name: "text-davinci-003", value: "text-davinci-003" },
              { name: "text-curie-001", value: "text-curie-001" },
              { name: "text-babbage-001", value: "text-babbage-001" },
              { name: "text-ada-001", value: "text-ada-001" },
              { name: "gpt-4", value: "gpt-4" }
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
        const api_key = interaction.options.getString("api_key");
        const data = await cbSchema.findOne({ Guild: interaction.guild.id });

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
          ApiKey: api_key,
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
    }
  },
};
