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
const geminiSchema = require("../../Schemas/geminischema");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("disable")
    .setDescription("🛑 / Disable client functions")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
      options.setName(`chatbot`).setDescription("🧩 / Disable chatbot commands")
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */

  async execute(interaction, client) {
    const subCommand = interaction.options.getSubcommand();

    switch (subCommand) {
      case "chatbot":
        {
          const permission = new EmbedBuilder().setDescription(
            `❌ You need the \`ManageChannels\` permission to disable the chatbot system.`
          );
          const succesful = new EmbedBuilder().setDescription(
            `✅ The chatbot system has been disabled correctly.`
          );
          if (
            !interaction.member.permissions.has(
              PermissionsBitField.Flags.ManageChannels
            )
          )
            return await interaction.reply({
              embeds: [permission],
              ephemeral: true,
            });
          try {
            await cbSchema.deleteMany({ Guild: interaction.guild.id });
            await interaction.reply({
              embeds: [succesful],
              ephemeral: true,
            });
          } catch (error) {
            console.error(error);
          }
        }
        break;
    }
  },
};
