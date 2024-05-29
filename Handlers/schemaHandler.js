const mongoose = require("mongoose");
const AsciiTable = require("ascii-table");
const fs = require("fs");
const path = require("path");

async function loadSchemas() {
  const schemasPath = path.join(__dirname, "../Schemas");
  const schemaFiles = fs
    .readdirSync(schemasPath)
    .filter((file) => file.endsWith(".js"));

  const table = new AsciiTable().setHeading(
    "Esquema".padEnd(20),
    "Estado".padEnd(10)
  );

  for (const file of schemaFiles) {
    const schema = require(path.join(schemasPath, file));
    const schemaName = path.basename(file, ".js");
    table.addRow(schemaName.trim(), "✅");
  }
  table.setAlign(0, AsciiTable.LEFT);
  table.setAlign(1, AsciiTable.CENTER);
  console.log(table.toString(), "\n¡Esquemas de MongoDB Cargados Con Éxito!");
}

module.exports = { loadSchemas };
