const { model, Schema } = require("mongoose");

let cbSchema = new Schema({
  Guild: String,
  Channel: String,
  Model: String,
  ImageModel: String,
  ImageEnhancer: String,
  ImageSeed: String,
  ImageSteps: String,
  ImageSampler: String,
  ImageStyle: String,
  NegativePrompt: String,
});

module.exports = model("cbSchema", cbSchema);
