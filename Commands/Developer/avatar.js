const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("set-avatar")
    .setDescription("👨‍🎨 / Change bot avatar")
    .addAttachmentOption((option) =>
      option
        .setName("avatar")
        .setDescription("📹 / The avatar with a maximum of 1,2 MB")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("format")
        .setDescription("🎎 / Image format")
        .addChoices({ name: "GIF", value: "image/gif" })
        .addChoices({ name: "JPEG", value: "image/jpeg" })
        .addChoices({ name: "PNG", value: "image/png" })
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const { options } = interaction;
    const avatar = options.getAttachment("avatar");
    const formato = options.getString("format");

    if (!interaction.deferred || !interaction.deferred.isDone()) {
      await interaction.deferReply({ ephemeral: true });
    }

    async function sendmessage(mensaje) {
      const embed = new EmbedBuilder().setColor("Blue").setDescription(mensaje);

      await interaction.followUp({ embeds: [embed], ephemeral: true });
    }

    if (formato === "image/gif" && avatar.contentType !== "image/gif") {
      return await sendmessage(
        "❌ / Please use a gif format for the animated avatar."
      );
    } else if (
      formato !== "image/gif" &&
      avatar.contentType !== "image/jpeg" &&
      avatar.contentType !== "image/png"
    ) {
      return await sendmessage(
        "❌ / Please use a valid image format (JPEG or PNG)."
      );
    }

    var error;
    await client.user.setAvatar(avatar.url).catch(async (err) => {
      error = true;
      console.log(err);
      return await sendmessage(`Error: \`${err.toString()}\``);
    });

    if (error) return;
    await sendmessage(
      "✅ / The bot avatar has been changed correctly, congratulations!"
    );
  },
};
