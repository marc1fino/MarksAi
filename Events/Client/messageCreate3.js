const megadb = require("megadb");
const pfDB = new megadb.crearDB("prefix");
const cbSchema = require("../../Schemas/cbschema");
const { EmbedBuilder } = require("discord.js");
const geminiSchema = require("../../Schemas/geminischema");
const crypto = require("crypto");
const config = require("../../config.json");
const { ApexAI } = require("apexify.js");
const translate = require("translate-google");

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
  name: "messageCreate",
  once: false,
  async execute(message, client, interaction, guild) {
    client.setMaxListeners(150);
    const ignore_prefix =
      (await pfDB.get(`PREFIX.${message.guild.id}.prfx`)) || "+";
    const Aidata = await cbSchema.findOne({ Guild: message.guild.id });
    const apiKey = await geminiSchema.findOne({ UserId: message.author.id });
    const correctApiKey = new EmbedBuilder()
      .setColor("Red")
      .setTitle("**> Invalid API Key!**")
      .setDescription(
        `❌ / An error ocurred, make sure the OpenAI API key isn't invalid or the api key have enough quota.`
      )
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp();

    if (!Aidata || Aidata.Model === "gpt-4-turbo" || Aidata.Model === "gpt-4o")
      return;
    if (message.channel.id !== Aidata.Channel) return;
    if (message.author.bot) return;
    if (
      message.content.startsWith(ignore_prefix) &&
      !message.mentions.users.has(client.user.id)
    )
      return;

    const aiOptions = {
      imagine: {
        enable: true, // Habilita el procesamiento de imágenes
        drawTrigger: [
          "imagine",
          "create",
          "draw",
          "generate",
          "paint",
          "sketch",
          "design",
          "illustrate",
        ], // Desencadenantes para generar las imágenes (por ejemplo, palabras clave o frases)
        imageModel: Aidata.ImageModel, // Especifica el modelo o servicio de procesamiento de imágenes (e.g., "prodia", "dalle", etc.)
        numOfImages: 1, // Especifica el nmero de imágenes para procesar
        nsfw: {
          enable: !message.channel.nsfw, // Palabras clave, que activan el bloqueo
          keywords: [
            "nsfw",
            "nude",
            "nudity",
            "nude",
            "ass",
            "boobs",
            "sex",
            "anal",
            "desnudo",
            "desnuda",
            "culo",
            "tetas",
            "sexo",
          ],
          deepCheck: true,
        },
        enhancer: {
          enable: true,
          enhancerModal: Aidata.ImageEnhancer || "ERSGAN_4x",
          negative_prompt: Aidata.NegativePrompt || "",
          cfg_Scale: 7,
          sample: Aidata.ImageSampler || "DDIM",
          steps: Aidata.ImageSteps || 20,
          seed: Aidata.ImageSeed || -1,
          imgStyle: Aidata.ImageStyle || "enhace",
        },
      },
      chat: {
        chatModal: Aidata.Model,
        readFiles: true,
        readImages: true,
        personality: "", // cree un archivo de texto (personality.txt), personalize la personalidad de tu AI, luego defina su ruta y agregala
        API_KEY: "", // Afrege su propia clave si usa gemini-pro/gemeni-flash. Agregue solo su propia clave en caso de que haya recibido un límite de tarifa
        memory: {
          memoryOn: true,
          id: message.author.id,
        },
        typeWriting: {
          enable: false,
          speed: 70,
          delay: 2000,
        },
      },
      others: {
        messageType: {
          type: "reply",
          intialContent: "",
        },
      },
    };
    ApexAI(message, aiOptions);
  },
};
