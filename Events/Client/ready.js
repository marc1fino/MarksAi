const { loadCommands } = require("../../Handlers/commandHandler");
const { loadPrefixs } = require("../../Handlers/prefixHandler");
const { loadSchemas } = require("../../Handlers/schemaHandler"); // Importa el nuevo handler
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
          name: `${client.users.cache.size} users 😎`,
          type: ActivityType.Watching,
        },
        { name: `mark. 🦥`, type: ActivityType.Streaming },
        { name: `Github 👨‍💻`, type: ActivityType.Watching },
        { name: `OpenAi 🤖`, type: ActivityType.Competing },
      ];
      let random = Math.floor(Math.random() * status.length);
      client.user.setActivity(status[random]);
    }, 60000);
    loadCommands(client);
    loadPrefixs(client);
    console.log(`${client.user.username} se ha iniciado con éxito 🌐`);
    loadSchemas(); // Llama al nuevo handler para mostrar la tabla de esquemas
    await mongoose.connect(config.mongopass);
    if (mongoose.connect) {
      console.log(
        `${client.user.username} se ha conectado a la DB correctamente 👨‍⚖️`
      );
    }
  },
};
