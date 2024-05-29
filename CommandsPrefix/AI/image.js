const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { ApexImagine } = require("apexify.js");

module.exports = {
  name: "image",
  async execute(message, args) {
    const getArgValue = (args, key) => {
      const index = args.indexOf(key);
      if (index === -1) return null;
      const nextIndex = args.findIndex(
        (arg, i) => i > index && arg.includes(":")
      );
      return args
        .slice(index + 1, nextIndex !== -1 ? nextIndex : args.length)
        .join(" ");
    };

    const model = getArgValue(args, "model:");
    const prompt = getArgValue(args, "prompt:");
    const negativePrompt = getArgValue(args, "negative_prompt:");
    const seed = getArgValue(args, "seed:");
    const steps = getArgValue(args, "steps:");
    const imageStyle = getArgValue(args, "image_style:");
    const sampler = getArgValue(args, "sampler:");

    console.log("Model:", model);
    console.log("Prompt:", prompt);
    console.log("Negative Prompt:", negativePrompt);
    console.log("Seed:", seed);
    console.log("Steps:", steps);
    console.log("Image Style:", imageStyle);
    console.log("Sampler:", sampler);

    if (!model || !prompt) {
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("**> Error**")
        .setDescription(
          "❌ / Please provide both a model using 'model:' and a prompt using 'prompt:'."
        )
        .setAuthor({
          name: message.client.user.username,
          iconURL: message.client.user.displayAvatarURL(),
        })
        .setTimestamp();
      return message.reply({ embeds: [errorEmbed] });
    }

    // Default values if not provided
    const seedValue = seed || "-1";
    const stepsValue = steps || "19";
    const imageStyleValue = imageStyle || "Cinematic";
    const samplerValue = sampler || "DPM-Solver";
    const negativepromptValue = negativePrompt || "";

    const logembed = new EmbedBuilder()
      .setDescription(`⌛ / Generating Image, This May Take a Moment...`)
      .setColor("Blue")
      .setFooter({
        text: message.author.username,
        iconURL: message.author.displayAvatarURL(),
      })
      .setAuthor({
        name: message.client.user.username,
        iconURL: message.client.user.displayAvatarURL(),
      });

    const loading = await message.reply({
      embeds: [logembed],
    });

    const options = {
      count: 4,
      nsfw: !message.channel.nsfw,
      deepCheck: !message.channel.nsfw,
      negative_prompt: negativepromptValue,
      cfg_scale: 9,
      width: 1024,
      height: 1024,
      steps: stepsValue,
      seed: seedValue,
      sampler: samplerValue,
      image_style: imageStyleValue,
    };

    try {
      const imgURLS = await ApexImagine(model, prompt, options);
      console.log(imgURLS);
      if (!imgURLS || imgURLS.length === 0) {
        const notnsfwembed = new EmbedBuilder()
          .setTitle("> 🚫 NSFW Content Not Allowed")
          .setDescription(
            "This channel does not allow NSFW content. Please use a different channel."
          )
          .setColor("Red")
          .setFooter({
            text: message.author.username,
            iconURL: message.author.displayAvatarURL(),
          })
          .setAuthor({
            name: message.client.user.username,
            iconURL: message.client.user.displayAvatarURL(),
          });
        return await loading.edit({ embeds: [notnsfwembed] });
      }

      const successfulembed = new EmbedBuilder()
        .setDescription(`✅ / Image Generated Successfully`)
        .setColor("Green")
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL(),
        })
        .setAuthor({
          name: message.client.user.username,
          iconURL: message.client.user.displayAvatarURL(),
        });
      await loading.edit({ embeds: [successfulembed] });

      for (const url of imgURLS) {
        const embed = new EmbedBuilder()
          .setTitle("> ✅ Image generated successfully")
          .setImage(url)
          .setColor("Blue")
          .setFooter({
            text: `User: ${message.author.username} | Model: ${model} | Prompt: ${prompt} | Negative Prompt: ${negativepromptValue} | Steps: ${stepsValue} | Seed: ${seedValue} | Sampler: ${samplerValue} | Style: ${imageStyleValue}`,
            iconURL: message.author.displayAvatarURL(),
          })
          .setAuthor({
            name: message.client.user.username,
            iconURL: message.client.user.displayAvatarURL(),
          });

        const button = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Image")
            .setStyle(ButtonStyle.Link)
            .setURL(url)
        );

        await message.reply({
          embeds: [embed],
          components: [button],
        });
      }
    } catch (error) {
      console.error("Error generating the image:", error);
      const errorEmbed = new EmbedBuilder()
        .setTitle("> ❌ Error generating the image")
        .setDescription(`Error generating the image: ${error.message}`)
        .setColor("Red")
        .setFooter({
          text: message.author.username,
          iconURL: message.author.displayAvatarURL(),
        })
        .setAuthor({
          name: message.client.user.username,
          iconURL: message.client.user.displayAvatarURL(),
        });
      await loading.edit({ embeds: [errorEmbed] });
    }
  },
};
