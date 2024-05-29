const { model, Schema } = require("mongoose");

let personalitySchema = new Schema({
  UserId: String,
  BasedModel: String,
  Personalities: [
    {
      name: String,
      value: String,
    },
  ],
});

module.exports = model("personalitySchema", personalitySchema);
