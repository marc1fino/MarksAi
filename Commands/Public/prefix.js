const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  PermissionsBitField,
} = require("discord.js");
const megadb = require("megadb");
const pfDB = new megadb.crearDB("prefix");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-prefix")
    .setDescription("❓ / Set server prefix")

    .addStringOption((option) =>
      option
        .setName("new_prefix")
        .setDescription("🆕 / New prefix that will have the server")
        .setRequired(true)
    ),

  /**
   *
   * @param { ChatInputCommandInteraction } interaction
   */

  async execute(interaction, guild, client) {
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
  },
};
