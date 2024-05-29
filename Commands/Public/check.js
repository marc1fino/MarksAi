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
    .setName("check")
    .setDescription("🤏 / Check client functions")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
      options
        .setName(`personality`)
        .setDescription("🎅 / Check an user's custom personalities")
        .addUserOption((options) =>
          options
            .setName("user")
            .setDescription("👤 / Select a user to check personalities")
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
      case "personality": {
        const userId = interaction.options.getUser("user");
        const userPersonalities = await getUserPersonalities(userId.id);

        if (userPersonalities.length === 0) {
          const noPersonalitiesEmbed = new EmbedBuilder().setDescription(
            "❌ / This user doesn't have any personalities available."
          );
          return await interaction.reply({
            embeds: [noPersonalitiesEmbed],
            ephemeral: true,
          });
        }

        const personalitiesDescription = userPersonalities
          .map((p) => {
            return `**Name:** ${p.name}\n**Based Model:** ${p.based_model}\n**Prompt:** ${p.prompt}`;
          })
          .join("\n\n");

        const personalitiesEmbed = new EmbedBuilder()
          .setTitle(`${userId.username}'s Personalities`)
          .setDescription(personalitiesDescription)
          .setThumbnail(userId.displayAvatarURL())
          .setAuthor({
            name: interaction.client.user.username,
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setFooter({
            text: `${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setColor("BLUE");

        await interaction.reply({
          embeds: [personalitiesEmbed],
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
