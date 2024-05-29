async function loadCommands(client) {
  const { loadFiles } = require("../Functions/fileLoader");
  const ascii = require("ascii-table");
  const table = new ascii().setHeading(
    "Comando".padEnd(20),
    "Estado".padEnd(10)
  );

  await client.commands.clear();

  let commandsArray = [];

  const Files = await loadFiles("Commands");

  Files.forEach((file) => {
    const command = require(file);
    client.commands.set(command.data.name, command);

    commandsArray.push(command.data.toJSON());

    table.addRow(command.data.name.trim(), "✅");
  });

  client.application.commands.set(commandsArray);
  table.setAlign(0, ascii.LEFT);
  table.setAlign(1, ascii.CENTER);
  return console.log(table.toString(), "\n¡Comandos Cargados Con Éxito!");
}

module.exports = { loadCommands };
