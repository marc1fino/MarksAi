const { loadCommands } = require("../../Handlers/commandHandler");
const { loadPrefixs } = require("../../Handlers/prefixHandler");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`${client.user.username} se ha iniciado con éxito 🌐`);
    loadCommands(client);
    loadPrefixs(client);
  },
};
