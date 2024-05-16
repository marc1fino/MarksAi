const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  Client,
} = require("discord.js");

const { loadCommands } = require("../../Handlers/commandHandler");
const { loadEvents } = require("../../Handlers/eventHandler");
const { loadButtons } = require("../../Handlers/buttonHandler");
const { loadPrefixs } = require("../../Handlers/prefixHandler");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("(💻) / Reload my commands and events")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
      options.setName(`events`).setDescription("(💻) / Reload my events")
    )
    .addSubcommand((options) =>
      options.setName(`commands`).setDescription("(💻) / Reload my commands")
    )
    .addSubcommand((options) =>
      options.setName(`buttons`).setDescription("(💻) / Reload my buttons")
    )
    .addSubcommand((options) =>
      options
        .setName(`prefixs`)
        .setDescription("(💻) / Reload my prefix commands")
    )
    .addSubcommand((options) =>
      options.setName(`all`).setDescription("(💻) / Reload me")
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */

  execute(interaction, client) {
    const subCommand = interaction.options.getSubcommand();

    switch (subCommand) {
      case "events":
        {
          for (const [key, value] of client.events)
            client.removeListener(`${key}`, value, true);
          loadEvents(client);
          interaction.reply({
            content: `✅ / ¡Eventos Recargados con Éxito!`,
            ephemeral: true,
          });
        }
        break;
      case "commands":
        {
          loadCommands(client);
          interaction.reply({
            content: `✅ / ¡Comandos Recargados con Éxito!`,
            ephemeral: true,
          });
        }
        break;
      case "buttons":
        {
          loadButtons(client);
          interaction.reply({
            content: `✅ / ¡Botones Recargados con Éxito!`,
            ephemeral: true,
          });
        }
        break;
      case "prefixs":
        {
          loadPrefixs(client);
          interaction.reply({
            content: `✅ / ¡Comandos de Prefix Recargados con Éxito!`,
            ephemeral: true,
          });
        }
        break;
      case "all":
        {
          loadCommands(client);
          for (const [key, value] of client.events)
            client.removeListener(`${key}`, value, true);
          loadEvents(client);
          loadButtons(client);
          loadPrefixs(client);
          interaction.reply({
            content: `✅ / ¡Bot Recargado Con Éxito!`,
            ephemeral: true,
          });
        }
        break;
    }
  },
};
