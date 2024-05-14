const megadb = require("megadb");
const pfDB = new megadb.crearDB("prefix");
module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message, client, interaction, guild) {
    const serverId = message.guild.id;
    const nwprfx = (await pfDB.get(`PREFIX.${serverId}.prfx`)) || "+";

    const prefix = nwprfx;
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const cmd =
      client.prefixs.get(command) ||
      client.prefixs.find(
        (cmd) => command.aliases && cmd.aliases.includes(command)
      );

    if (!cmd) return;
    cmd.execute(message, args);
  },
};
