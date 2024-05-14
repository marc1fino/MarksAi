const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require(`discord.js`);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Mira mis comandos"),

  async execute(interaction) {
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
    const user = interaction.user;

    const embed = new EmbedBuilder()
      .setTitle("MarksAi Help Menu")
      .setImage(
        "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHpmZG1rcjBiMjJxMG90ODNocnp6eHJtcGYzcnk4cGlyY295cHZ5ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/o9TNUe54nuAFu78vq1/giphy.gif"
      )
      .setColor("#2c2d31")
      .setDescription(`**👇 / Please select an option**`);

    let mensaje = await interaction.reply({
      embeds: [embed],
      components: [cmp],
    });

    const ifiltro = (i) => i.user.id === interaction.user.id;

    let collector = interaction.channel.createMessageComponentCollector({
      filter: ifiltro,
    });

    const embed1 = new EmbedBuilder()
      .setTitle("Setup Commands")
      .setDescription("Coming Soon...")
      .setFooter({ text: "🔧 / Setup the bot using this commands" })
      .setTimestamp()
      .setColor("#2c2d31");

    const embed2 = new EmbedBuilder()
      .setTitle("AI Image Commands")
      .setDescription("Coming Soon...")
      .setFooter({ text: "🖼️ / Generate images using this commands" })
      .setTimestamp()
      .setColor("#2c2d31");

    const embed3 = new EmbedBuilder()
      .setTitle("AI Text Commands")
      .setDescription("Coming Soon...")
      .setFooter({ text: "📝 / Generate text using this commands" })
      .setTimestamp()
      .setColor("#2c2d31");
    const embed4 = new EmbedBuilder()
      .setTitle("AI Other Commands")
      .setDescription("Coming Soon...")
      .setFooter({ text: "🔨 / Generate other things using this commands" })
      .setTimestamp()
      .setColor("#2c2d31");
    collector.on("collect", async (i) => {
      if (i.values[0] === "uno") {
        await i.deferUpdate();
        i.editReply({ embeds: [embed], components: [cmp] });
      }
    });

    collector.on("collect", async (i) => {
      if (i.values[0] === "dos") {
        await i.deferUpdate();
        i.editReply({ embeds: [embed1], components: [cmp] });
      }
    });

    collector.on("collect", async (i) => {
      if (i.values[0] === "tres") {
        await i.deferUpdate();
        i.editReply({ embeds: [embed2], components: [cmp] });
      }
    });

    collector.on("collect", async (i) => {
      if (i.values[0] === "cuatro") {
        await i.deferUpdate();
        i.editReply({ embeds: [embed3], components: [cmp] });
      }
    });

    collector.on("collect", async (i) => {
      if (i.values[0] === "cinco") {
        await i.deferUpdate();
        i.editReply({ embeds: [embed4], components: [cmp] });
      }
    });
  },
};
