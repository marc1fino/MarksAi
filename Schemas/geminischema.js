const { model, Schema } = require("mongoose");

let geminiSchema = new Schema({
  ApiKey: String,
  UserId: String,
});

module.exports = model("geminiSchema", geminiSchema);
