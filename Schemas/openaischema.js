const { model, Schema } = require("mongoose");

let openaiSchema = new Schema({
  ApiKey: String,
  UserId: String,
});

module.exports = model("openaiSchema", openaiSchema);
