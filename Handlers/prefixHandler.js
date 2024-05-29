async function loadPrefixs(client) {
  const { loadFiles } = require("../Functions/fileLoader");
  const ascii = require("ascii-table");
  const table = new ascii().setHeading(
    "Prefix".padEnd(20),
    "Estado".padEnd(10)
  );

  await client.prefixs.clear();
  const Files = await loadFiles("CommandsPrefix");
  Files.forEach((file) => {
    const prefixs = require(file);
    client.prefixs.set(prefixs.name, prefixs);
    table.addRow(prefixs.name.trim(), "✅");
  });
  table.setAlign(0, ascii.LEFT);
  table.setAlign(1, ascii.CENTER);
  return console.log(
    table.toString(),
    "\n¡Comandos de Prefix Cargados Con Éxito!"
  );
}

module.exports = { loadPrefixs };
