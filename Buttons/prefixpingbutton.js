const { EmbedBuilder, Message, Args } = require("discord.js");
const ms = require("ms");
module.exports = {
  data: {
    name: `prefixpingbutton`,
  },
  /**
   *
   * @param {Message} message
   */
  async execute(message, args) {
    console.log(message);
    const originalAuthor = message.interaction
      ? message.interaction.user
      : message.author;
    if (!originalAuthor) {
      console.error("No se pudo determinar el autor original del mensaje.");
      return;
    }
    const pinged = new EmbedBuilder()
      .setTitle("Client Ping")
      .setColor("White")
      .setDescription(
        `The Client ping is **${Math.round(
          message.client.ws.ping
        )} ms** \n 📻 Last ping calculated was **${ms(
          Date.now() - message.client.ws.shards.first().lastPingTimestamp,
          { long: true }
        )}** ago`
      )
      .setTimestamp()
      .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true }))
      .setAuthor({
        name: `${message.client.user.username}`,
        iconURL: `${message.client.user.displayAvatarURL({
          dynamic: true,
          size: 1024,
        })}`,
      })
      .setFooter({
        text: `${originalAuthor.username}`,
        iconURL:
          originalAuthor.displayAvatarURL({ dynamic: true }) ||
          message.client.user.displayAvatarURL({ dynamic: true }),
      });

    message.reply({ embeds: [pinged] });
  },
};
