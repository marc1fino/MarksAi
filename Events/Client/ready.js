const { loadCommands } = require("../../Handlers/commandHandler");
const { loadPrefixs } = require("../../Handlers/prefixHandler");
const { Activity, ActivityType } = require("discord.js");
const config = require("../../config.json");
const mongoose = require("mongoose");
module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    setInterval(() => {
      let status = [
        {
          name: `${client.users.cache.size} users 😎 `,
          type: ActivityType.Watching,
        },
        { name: `🦥 mark.`, type: ActivityType.Streaming },
        { name: `👨‍💻 my GitHub`, type: ActivityType.Watching },
        { name: `🤖 OpenAi`, type: ActivityType.Competing },
        { name: `🔨 Bot in progress`, type: ActivityType.Custom },
      ];
      let random = Math.floor(Math.random() * status.length);
      client.user.setActivity(status[random]);
    }, 60000);
    console.log(`${client.user.username} se ha iniciado con éxito 🌐`);
    await mongoose.connect(config.mongopass);
    if (mongoose.connect) {
      console.log(
        `${client.user.username} se ha conectado a la DB correctamente 👨‍⚖️`
      );
    }
    loadCommands(client);
    loadPrefixs(client);
  },
};
