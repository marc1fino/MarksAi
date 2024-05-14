const { EmbedBuilder } = require("discord.js");
const ms = require("ms");
module.exports = {
  data: {
    name: `pingbutton`,
  },
  async execute(interaction, client) {
    const pinged = new EmbedBuilder()
      .setTitle("Client Ping")
      .setColor("White")
      .setDescription(
        `The Client ping is **${Math.round(
          client.ws.ping
        )} ms** \n 📻 Last ping calculated was **${ms(
          Date.now() - client.ws.shards.first().lastPingTimestamp,
          { long: true }
        )}** ago`
      )
      .setTimestamp()
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setAuthor({
        name: `${client.user.username}`,
        iconURL: `${client.user.displayAvatarURL({
          dynamic: true,
          size: 1024,
        })}`,
      })
      .setFooter({
        text: `${interaction.user.username}`,
        iconURL:
          interaction.user.displayAvatarURL({ dynamic: true }) ||
          client.user.displayAvatarURL({ dynamic: true }),
      });

    interaction.reply({ embeds: [pinged] });
  },
};
