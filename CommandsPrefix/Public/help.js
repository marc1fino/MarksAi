const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  Message,
} = require(`discord.js`);

module.exports = {
  name: "help",
  /**
   *
   * @param {Message} message
   */
  async execute(message, args) {
    const cmp = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId("Menu").addOptions([
        {
          label: "Main Menu",
          description: "MarksAi Help Menu",
          value: "uno",
          emoji: "⚙️",
        },
        {
          label: "Setup",
          description: "Setup commands",
          value: "dos",
          emoji: "🔧",
        },
        {
          label: "AI Image",
          description: "AI Image commands",
          value: "tres",
          emoji: "🖼️",
        },
        {
          label: "AI Text",
          description: "AI Text commands",
          value: "cuatro",
          emoji: "📝",
        },
        {
          label: "AI Other",
          description: "AI Other commands",
          value: "cinco",
          emoji: "🔨",
        },
      ])
    );

    const embed = new EmbedBuilder()
      .setTitle("MarksAi Help Menu")
      .setImage("https://i.ibb.co/C9TqP3f/marksfuncs-2.png")
      .setColor("#2c2d31")
      .setDescription(
        `**👇 / Please select an option, all commands are avaliable in prefix too!**`
      );

    let mensaje = await message.reply({
      embeds: [embed],
      components: [cmp],
    });

    const filter = (interaction) => interaction.user.id === message.author.id;

    const collector = message.channel.createMessageComponentCollector({
      filter,
      time: 60000, // 1 minuto para recoger interacciones
    });

    collector.on("collect", async (interaction) => {
      if (!interaction.isStringSelectMenu()) return;

      let selectedEmbed;
      switch (interaction.values[0]) {
        case "uno":
          selectedEmbed = embed;
          break;
        case "dos":
          selectedEmbed = new EmbedBuilder()
            .setTitle("Setup Commands")
            .setDescription("🔧 / Setup the bot using these commands")
            .setTimestamp()
            .setImage(
              "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXE5bzQ5NDE3MnFxM2RuY3p5Z2tpeWkzczQ3MHZrMjM5cng3bmsyMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Ee3IjUlLtGqCCl4XLB/giphy.gif"
            )
            .addFields({
              name: "</help:1240005680929439784>",
              value: "👨‍🏫 / Watch all the bot commands",
            })
            .addFields({
              name: "</set-prefix:1241351822485225515>",
              value: "❓ / Set server prefix",
            })
            .setColor("#2c2d31");
          break;
        case "tres":
          selectedEmbed = new EmbedBuilder()
            .setTitle("AI Image Commands")
            .setDescription("🖼️ / Generate images using these commands")
            .setTimestamp()
            .setImage(
              "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHZsczhheG44N2xsZW5iNmo5cnh2bXNxNjZub2JibHppb3V3Y2R4OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WPUezDL0d3OOoEkb3u/giphy.gif"
            )
            .setColor("#2c2d31");
          break;
        case "cuatro":
          selectedEmbed = new EmbedBuilder()
            .setTitle("AI Text Commands")
            .setDescription("📝 / Generate text using these commands")
            .setTimestamp()
            .setImage(
              "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTYyNjRiaG0xc2FwZzhubm44aWhzbDhrMWxvdTQzbTBhdWtsdWt0MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bhwiUKXEn0a6cAJDlC/giphy.gif"
            )
            .setColor("#2c2d31");
          break;
        case "cinco":
          selectedEmbed = new EmbedBuilder()
            .setTitle("AI Other Commands")
            .setDescription("🔨 / Generate other things using these commands")
            .setTimestamp()
            .addFields({
              name: "</ping:1238945215000350923>",
              value: "🏓 / Watch client ping",
            })
            .setImage(
              "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTE3NXcwcnRxN25ueHc0ajZsd3pkdGI3czk1NjlqajV2a2liM29jYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/0dhMT8ISqVHPPTah8k/giphy.gif"
            )
            .setColor("#2c2d31");
          break;
      }

      await interaction.update({ embeds: [selectedEmbed], components: [cmp] });
    });
  },
};
