const { model, Schema } = require("mongoose");

let cbSchema = new Schema({
  Guild: String,
  Channel: String,
  Model: String,
  ImageModel: String,
  ImageEnhancer: String,
});

module.exports = model("cbSchema", cbSchema);
