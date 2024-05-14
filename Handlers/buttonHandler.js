async function loadButtons(client) {
  const { loadFiles } = require("../Functions/fileLoader");
  const ascii = require("ascii-table");
  const table = new ascii().setHeading("Botones", "Estado");

  await client.buttons.clear();
  const Files = await loadFiles("Buttons");
  Files.forEach((file) => {
    const button = require(file);
    client.buttons.set(button.data.name, button);
    table.addRow(button.data.name, "✅");
  });

  return console.log(table.toString(), "\n¡Botones Cargados Con Éxito!");
}

module.exports = { loadButtons };
