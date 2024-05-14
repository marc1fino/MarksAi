const {
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: "ping",
  /**
   *
   * @param {Message} message
   */
  async execute(message, args) {
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prefixpingbutton")
        .setLabel(`🌐 Click to return client ping`)
        .setStyle(ButtonStyle.Primary)
    );
    message.reply({ components: [button] });
  },
};
