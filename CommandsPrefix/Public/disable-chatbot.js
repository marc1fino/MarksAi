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
  name: "disable-chatbot",

  async execute(message, args) {
    const permission = new EmbedBuilder().setDescription(
      `❌ You need the \`ManageChannels\` permission to disable the chatbot system.`
    );
    const succesful = new EmbedBuilder().setDescription(
      `✅ The chatbot system has been disabled correctly.`
    );
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)
    )
      return await message.reply({
        embeds: [permission],
        ephemeral: true,
      });

    try {
      await cbSchema.deleteMany({ Guild: message.guild.id });
      await message.reply({
        embeds: [succesful],
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
  },
};
