const { EmbedBuilder, Message } = require("discord.js");
const megadb = require("megadb");
const infodb = new megadb.crearDB("username");
const urldb = new megadb.crearDB("avatarurl");
const userlistdb = new megadb.crearDB("userlist");
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

    const guildId = message.guildId;
    let username = "Unknown User";
    let avatarURL = message.client.user.displayAvatarURL({ dynamic: true });

    try {
      const userList = await userlistdb.get(`USERLIST.${guildId}`);
      if (userList && userList.length > 0) {
        const userId = userList[userList.length - 1]; // Obtener el ID del usuario más reciente
        username = await infodb.get(`USERNAME.${guildId}.${userId}.username`);
        avatarURL = await urldb.get(`AVATARURL.${guildId}.${userId}.avatarURL`);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
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
        text: `${username}`,
        iconURL: avatarURL,
      });

    message.reply({ embeds: [pinged] });
  },
};
