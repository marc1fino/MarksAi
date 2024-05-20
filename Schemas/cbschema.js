const { model, Schema } = require("mongoose");

let cbSchema = new Schema({
  Guild: String,
  Channel: String,
  Model: String,
  ImageModel: String,
  ApiKey: String,
});

module.exports = model("cbSchema", cbSchema);
