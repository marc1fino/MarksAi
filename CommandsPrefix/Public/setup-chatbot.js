const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  Client,
  PermissionsBitField,
  EmbedBuilder,
  ChannelType,
  Message,
} = require("discord.js");
const ms = require("ms");
const megadb = require("megadb");
const pfDB = new megadb.crearDB("prefix");
const cbSchema = require("../../Schemas/cbschema");
const openaiSchema = require("../../Schemas/openaischema");
const geminiSchema = require("../../Schemas/geminischema");
/**
 *
 * @param {Message} message
 */
module.exports = {
  name: "setup-chatbot",
  async execute(message, args) {
    const notenespermiso = new EmbedBuilder().setDescription(
      `❌ You need the \`ManageChannels\` permision to setup the chatbot.`
    );
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)
    )
      return await message.reply({
        embeds: [notenespermiso],
      });

    const canal = message.mentions.channels.first();
    const model = args[1];
    const image_model = args[2];
    const image_enhancer = args[3];
    const data = await cbSchema.findOne({ Guild: message.guild.id });
    const openaiapi_key = openaiSchema.findOne({
      UserId: message.author.id,
    });
    const geminiapi_key = geminiSchema.findOne({
      UserId: message.author.id,
    });
    if (
      !openaiapi_key &&
      (model === "gpt-3.5-turbo" ||
        model === "gpt-4-turbo" ||
        model === "gpt-4" ||
        model === "gpt-4o")
    ) {
      const noApiKey = new EmbedBuilder().setDescription(
        `❌ You need to setup your OpenAI API key first, use the command \`setup openai\`.`
      );
      return await message.reply({
        embeds: [noApiKey],
      });
    }
    if (
      (image_model === "dall-e-3" || image_model === "dall-e-2") &&
      !(
        model === "gpt-3.5-turbo" ||
        model === "gpt-4-turbo" ||
        model === "gpt-4" ||
        model === "gpt-4o"
      )
    ) {
      const noMatch = new EmbedBuilder().setDescription(
        `❌ The image model "dall-e-3" and the image model "dall-e-2" are only available for the models "gpt-3.5-turbo", "gpt-4-turbo", "gpt-4", "gpt-4o" (OpenAI based models).`
      );
      return await message.reply({
        embeds: [noMatch],
      });
    }
    if (
      (!geminiapi_key && model === "gemini-pro") ||
      model === "gemini-flash"
    ) {
      const noApiKey = new EmbedBuilder().setDescription(
        `❌ You need to setup your Gemini API key first to use this models, execute the command \`setup gemini\`.`
      );
      return await message.reply({
        embeds: [noApiKey],
      });
    }
    if (data) {
      const exists = new EmbedBuilder().setDescription(
        `❌ You already have a chatbot system in this channel, to reset it use the command  \`disable chatbot\`.`
      );
      const otherChannel = new EmbedBuilder().setDescription(
        `❌ You already have a chatbot system in another channel, to change it use the command  \`disable chatbot\` and then \`setup chatbot\`.`
      );
      if (data.Channel === canal.id) {
        return await message.reply({
          embeds: [exists],
        });
      } else {
        return await message.reply({
          embeds: [otherChannel],
        });
      }
    }

    await cbSchema.create({
      Guild: message.guild.id,
      Channel: canal.id,
      Model: model,
      ImageModel: image_model,
      ImageEnhancer: image_enhancer,
    });
    const succesful = new EmbedBuilder().setDescription(
      `✅ The chatbot system has been set up correctly in ${canal}.`
    );
    const tsuccesful = new EmbedBuilder().setDescription(
      `✅ The chatbot system has been set up correctly in this channel.`
    );
    if (message.channel.id === canal.id) {
      await message.reply({
        embeds: [tsuccesful],
      });
    } else {
      await message.reply({
        embeds: [succesful],
        ephemeral: true,
      });
    }
  },
};
