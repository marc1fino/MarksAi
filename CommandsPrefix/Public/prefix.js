const { PermissionsBitField, EmbedBuilder, Message } = require("discord.js");
const megadb = require("megadb");
const pfDB = new megadb.crearDB("prefix");
const ms = require("ms");

module.exports = {
  name: "setprefix",
  alias: [],
  /**
   *
   * @param {Message} message
   */
  async execute(message, args) {
    if (
      !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
      const notenespermiso = new EmbedBuilder().setDescription(
        `❌ You need the \`Administrator\` permision to change the client prefix.`
      );
      return await message.reply({
        embeds: [notenespermiso],
      });
    }

    const prfx = args[0];
    const serverId = message.guild.id;

    await pfDB.set(`PREFIX.${serverId}_create_newPrefix`, Date.now());

    const load = new EmbedBuilder()
      .setDescription(
        `
        ⌛ Changing client profile...
        `
      )
      .setFooter({
        text: message.guild.name,
        iconURL:
          message.guild.iconURL({ dynamic: true }) ||
          message.client.user.displayAvatarURL({ dynamic: true }),
      })
      .setColor("Blue");

    const sentMessage = await message.reply({
      embeds: [load],
    });

    setTimeout(async () => {
      await pfDB.set(`PREFIX.${serverId}.prfx`, prfx);

      const updatedEmbed = new EmbedBuilder()
        .setDescription(
          `
            ✅ Prefix changed successfully to **${prfx}**
          `
        )
        .setFooter({
          text: message.guild.name,
          iconURL:
            message.guild.iconURL({ dynamic: true }) ||
            message.client.user.displayAvatarURL({ dynamic: true }),
        })
        .setAuthor({
          name: `${message.author.username}`,
          iconURL:
            `${message.author.displayAvatarURL({
              dynamic: true,
              size: 1024,
            })}` || message.client.user.displayAvatarURL({ dynamic: true }),
        })
        .setColor("Green");

      // Edita el mensaje enviado anteriormente con el nuevo embed
      await sentMessage.edit({ embeds: [updatedEmbed] });
    }, 7000);
  },
};
