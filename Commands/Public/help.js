const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require(`discord.js`);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("👨‍🏫 / Watch all the bot commands")
    .addStringOption((query) =>
      query
        .setName("command")
        .setDescription("👨‍🏫 / The command you want help for")
        .setRequired(false)
    ),

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
      .setImage("https://i.ibb.co/C9TqP3f/marksfuncs-2.png")
      .setColor("#2c2d31")
      .setDescription(
        `**👇 / Please select an option, all commands are avaliable in prefix too!**`
      );

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
      .setDescription("🔧 / Setup the bot using this commands")
      .setTimestamp()
      .setImage(
        "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXE5bzQ5NDE3MnFxM2RuY3p5Z2tpeWkzczQ3MHZrMjM5cng3bmsyMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Ee3IjUlLtGqCCl4XLB/giphy.gif"
      )
      .addFields({
        name: "</help:1240005680929439784>",
        value: "👨‍🏫 / Watch all the bot commands",
      })
      .addFields({
        name: "</setup:1241485042929373308>",
        value: "🔧 / Setup client",
      })
      .setColor("#2c2d31");

    const embed2 = new EmbedBuilder()
      .setTitle("AI Image Commands")
      .setDescription("🖼️ / Generate images using this commands")
      .addFields({
        name: "</image:1242498969679171686>",
        value: "🌆 / Generate an Image using AI",
      })
      .setTimestamp()
      .setImage(
        "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHZsczhheG44N2xsZW5iNmo5cnh2bXNxNjZub2JibHppb3V3Y2R4OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WPUezDL0d3OOoEkb3u/giphy.gif"
      )
      .setColor("#2c2d31");

    const embed3 = new EmbedBuilder()
      .setTitle("AI Text Commands")
      .setDescription("📝 / Generate text using this commands")
      .addFields({
        name: "</ask:1242117387717972041>",
        value: "💬 / Ask a question to the AI",
      })
      .setTimestamp()
      .setImage(
        "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTYyNjRiaG0xc2FwZzhubm44aWhzbDhrMWxvdTQzbTBhdWtsdWt0MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bhwiUKXEn0a6cAJDlC/giphy.gif"
      )
      .setColor("#2c2d31");
    const embed4 = new EmbedBuilder()
      .setTitle("AI Other Commands")
      .setDescription("🔨 / Generate other things using this commands")
      .setTimestamp()
      .addFields({
        name: "</ping:1238945215000350923>",
        value: "🏓 / Watch client ping",
      })
      .setImage(
        "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTE3NXcwcnRxN25ueHc0ajZsd3pkdGI3czk1NjlqajV2a2liM29jYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/0dhMT8ISqVHPPTah8k/giphy.gif"
      )
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
