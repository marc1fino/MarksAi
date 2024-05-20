const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
const { Guilds, GuildMembers, GuildMessages, MessageContent } =
  GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

const client = new Client({
  intents: [Guilds, GuildMembers, GuildMessages, MessageContent],
  partials: [User, Message, GuildMember, ThreadMember],
});

const { loadEvents } = require("./Handlers/eventHandler");
const { loadButtons } = require("./Handlers/buttonHandler");

client.config = require("./config.json");
client.events = new Collection();
client.commands = new Collection();
client.buttons = new Collection();
client.prefixs = new Collection();

client.on("guildCreate", (guild) => {
  const topChannel = guild.channels.cache
    .filter((c) => c.type === ChannelType.GuildText)
    .sort((a, b) => a.rawPosition - b.rawPosition || a.id - b.id)
    .first();

  try {
    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("**> Thank you for adding MarksAi in your server!**")
      .addFields({
        name: `🔧 ┇ How to configure?`,
        value: `\n The default prefix = \`+\` \n To see bot commands: </help:1240005680929439784> or \`+help\``,
      })
      .addFields({
        name: `📢 ┇ Need help?`,
        value: `\n You can join the [[Support server]](https://discord.gg/ZRP8W23Q) `,
      }) // <-- Aca va el link del servidor de tu bot
      .addFields({
        name: `🔌 ┇ What are the AI commands?`,
        value: `\n See the complete list of AI commands in </help:1240005680929439784> or \`+help\``,
      })
      .addFields({
        name: `🤖 ┇ Invite the bot!`,
        value: `\n [[Click here]](https://discord.com/oauth2/authorize?client_id=1238487304553762889&permissions=8&scope=bot%20applications.commands)`,
      }) // <-- Aca va el link de la invitacion de tu bot
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();
    topChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error(error);
  }
});

loadEvents(client);
loadButtons(client);

require(`./Handlers/anti-crash`)(client);
client.login(client.config.token);
