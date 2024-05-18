const {
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const megadb = require("megadb");
const infodb = new megadb.crearDB("username");
const urldb = new megadb.crearDB("avatarurl");
const userlistdb = new megadb.crearDB("userlist");

module.exports = {
  name: "ping",
  /**
   *
   * @param {Message} message
   */
  async execute(message, args) {
    console.log(message);
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prefixpingbutton")
        .setLabel(`🌐 Click to return client ping`)
        .setStyle(ButtonStyle.Primary)
    );
    message.reply({ components: [button] });

    const userId = message.author.id;

    await infodb.set(
      `USERNAME.${message.guildId}.${userId}.username`,
      message.author.username
    );
    await urldb.set(
      `AVATARURL.${message.guildId}.${userId}.avatarURL`,
      message.author.displayAvatarURL()
    );

    // Agregar el ID del usuario a la lista de usuarios
    let userList = (await userlistdb.get(`USERLIST.${message.guildId}`)) || [];
    if (!userList.includes(userId)) {
      userList.push(userId);
      await userlistdb.set(`USERLIST.${message.guildId}`, userList);
    }
  },
};
