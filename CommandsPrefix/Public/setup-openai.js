const { EmbedBuilder } = require("discord.js");
const openaiSchema = require("../../Schemas/openaischema");
const crypto = require("crypto");
const config = require("../../config.json");

const algorithm = "aes-256-cbc";
const secretKey = config.secret;
const iv = crypto.randomBytes(16);

// Función para cifrar
function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// Función para descifrar
function decrypt(text) {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
module.exports = {
  name: "setup-openai",

  async execute(message, args) {
    const apiKey = args[0];
    const encryptedApiKey = encrypt(apiKey);
    const data = openaiSchema.findOne({
      UserId: message.author.id,
    });
    if (data) {
      await openaiSchema.deleteMany({ UserId: message.author.id });
    }

    await openaiSchema.create({
      UserId: message.author.id,
      ApiKey: encryptedApiKey,
    });

    const successEmbed = new EmbedBuilder().setDescription(
      `✅ Your OpenAI API key has been securely stored.`
    );
    await message.reply({
      embeds: [successEmbed],
    });
  },
};
