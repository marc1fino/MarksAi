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
    const model = args[2];
    const image_model = args[3];
    const api_key = args[1];
    const data = await cbSchema.findOne({ Guild: message.guild.id });

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
      ApiKey: api_key,
    });
    const succesful = new EmbedBuilder().setDescription(
      `✅ The chatbot system has been set up correctly in ${canal}.`
    );
    const tsuccesful = new EmbedBuilder().setDescription(
      `✅ The chatbot system has been set up correctly in this channel.`
    );
    if (message.channelId === canal.id) {
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
