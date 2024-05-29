const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  Client,
  PermissionsBitField,
  EmbedBuilder,
  ChannelType,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const ms = require("ms");
const megadb = require("megadb");
const pfDB = new megadb.crearDB("prefix");
const cbSchema = require("../../Schemas/cbschema");
const geminiSchema = require("../../Schemas/geminischema");
const personalitySchema = require("../../Schemas/personalityschema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("disable")
    .setDescription("🛑 / Disable client functions")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
      options.setName(`chatbot`).setDescription("🧩 / Disable chatbot commands")
    )
    .addSubcommand((options) =>
      options
        .setName(`personality`)
        .setDescription("🎅 / Disable 1 custom personality")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("🧔 / Select a personality to disable")
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

      case "personality": {
        const userId = interaction.user.id;
        const userPersonalities = await getUserPersonalities(userId);

        if (userPersonalities.length === 0) {
          const noPersonalitiesEmbed = new EmbedBuilder().setDescription(
            "❌ / You don't have any personalities available to disable."
          );
          return await interaction.reply({
            embeds: [noPersonalitiesEmbed],
            ephemeral: true,
          });
        }

        const personalityName = interaction.options.getString("name");

        if (!userPersonalities.some((p) => p.name === personalityName)) {
          const invalidPersonalityEmbed = new EmbedBuilder().setDescription(
            "❌ / The selected personality is not valid."
          );
          return await interaction.reply({
            embeds: [invalidPersonalityEmbed],
            ephemeral: true,
          });
        }

        await personalitySchema.updateOne(
          { UserId: interaction.user.id },
          { $pull: { Personalities: { name: personalityName } } }
        );
        const disabledPersonalityEmbed = new EmbedBuilder().setDescription(
          `✅ / The personality ${personalityName} has been disabled correctly.`
        );
        await interaction.reply({
          embeds: [disabledPersonalityEmbed],
          ephemeral: true,
        });
        break;
      }
    }
  },
};

/**
 * Función para obtener las personalidades del usuario
 * @param {String} userId
 * @returns {Array} Lista de personalidades
 */
async function getUserPersonalities(userId) {
  try {
    const user = await personalitySchema.findOne({ UserId: userId });
    return user ? user.Personalities : [];
  } catch (error) {
    console.error("Error al obtener personalidades:", error);
    return [];
  }
}
