const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const { ApexImagine } = require("apexify.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("image")
    .setDescription("🌆 / Generate an Image using AI")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("💭 / The prompt to generate an image from")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("model")
        .setDescription("📈 / The model to use for generating the image")
        .setRequired(true)
        .addChoices(
          { name: "v1", value: "v1" },
          { name: "v2", value: "v2" },
          { name: "v2-beta", value: "v2-beta" },
          { name: "v3", value: "v3" },
          { name: "lexica", value: "lexica" },
          { name: "prodia", value: "prodia" },
          { name: "raava", value: "raava" },
          { name: "shonin", value: "shonin" },
          {
            name: "animagineXLV3_v30.safetensors[75f2f05b]",
            value: "animagineXLV3_v30.safetensors[75f2f05b]",
          },
          {
            name: "dreamshaperXL10_alpha2.safetensors[c8afe2ef]",
            value: "dreamshaperXL10_alpha2.safetensors[c8afe2ef]",
          },
          {
            name: "dynavisionXL_0411.safetensors[c39cc051]",
            value: "dynavisionXL_0411.safetensors[c39cc051]",
          },
          {
            name: "juggernautXL_v45.safetensors[e75f5471]",
            value: "juggernautXL_v45.safetensors[e75f5471]",
          },
          {
            name: "realvisxlV40.safetensors[f7fdcb51]",
            value: "realvisxlV40.safetensors[f7fdcb51]",
          },
          {
            name: "sd_xl_base_1.0_inpainting_0.1.safetensors[5679a81a]",
            value: "sd_xl_base_1.0_inpainting_0.1.safetensors[5679a81a]",
          },
          {
            name: "3Guofeng3_v34.safetensors[50f420de]",
            value: "3Guofeng3_v34.safetensors[50f420de]",
          },
          {
            name: "absolutereality_V16.safetensors[37db0fc3]",
            value: "absolutereality_V16.safetensors[37db0fc3]",
          },
          {
            name: "amIReal_V41.safetensors[0a8a2e61]",
            value: "amIReal_V41.safetensors[0a8a2e61]",
          },
          {
            name: "analog-diffusion-1.0.ckpt[9ca13f02]",
            value: "analog-diffusion-1.0.ckpt[9ca13f02]",
          },
          {
            name: "anythingv3_0-pruned.ckpt[2700c435]",
            value: "anythingv3_0-pruned.ckpt[2700c435]",
          },
          {
            name: "anythingV5_PrtRE.safetensors[893e49b9]",
            value: "anythingV5_PrtRE.safetensors[893e49b9]",
          },
          {
            name: "AOM3A3_orangemixs.safetensors[9600da17]",
            value: "AOM3A3_orangemixs.safetensors[9600da17]",
          }
        )
    )
    .addStringOption((option) =>
      option
        .setName("negative_prompt")
        .setDescription("💭 / The negative prompt to avoid in the image")
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("steps")
        .setDescription("🔢 / The number of steps for generating the image")
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("seed")
        .setDescription("🌱 / The seed for generating the image")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("image-style")
        .setDescription("🎨 / The image style to use for generating the image")
        .addChoices(
          { name: "3d-model", value: "3d-model" },
          { name: "analog-film", value: "analog-film" },
          { name: "cinematic", value: "cinematic" },
          { name: "comic-book", value: "comic-book" },
          { name: "digital-art", value: "digital-art" },
          { name: "enhance", value: "enhance" },
          { name: "isometric", value: "isometric" },
          { name: "fantasy-art", value: "fantasy-art" },
          { name: "line-art", value: "line-art" },
          { name: "low-poly", value: "low-poly" },
          { name: "neon-punk", value: "neon-punk" },
          { name: "origami", value: "origami" },
          { name: "photographic", value: "photographic" },
          { name: "pixel-art", value: "pixel-art" },
          { name: "texture", value: "texture" },
          { name: "craft-clay", value: "craft-clay" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("sampler")
        .setDescription("💫 / The sampler to use for generating the image")
        .addChoices(
          { name: "DPM++ 2M Karras", value: "DPM++ 2M Karras" },
          { name: "DPM++ SDE Karras", value: "DPM++ SDE Karras" },
          {
            name: "DPM++ 2M SDE Exponential",
            value: "DPM++ 2M SDE Exponential",
          },
          { name: "DPM++ 2M SDE Karras", value: "DPM++ 2M SDE Karras" },
          { name: "Euler a", value: "Euler a" },
          { name: "Euler", value: "Euler" },
          { name: "LMS", value: "LMS" },
          { name: "Heun", value: "Heun" },
          { name: "DPM2", value: "DPM2" },
          { name: "DPM2 a", value: "DPM2 a" },
          {
            name: "DPM++ 2M SDE Heun Karras",
            value: "DPM++ 2M SDE Heun Karras",
          },
          {
            name: "DPM++ 2M SDE Heun Exponential",
            value: "DPM++ 2M SDE Heun Exponential",
          },
          { name: "DPM++ 3M SDE", value: "DPM++ 3M SDE" },
          { name: "DPM++ 3M SDE Karras", value: "DPM++ 3M SDE Karras" },
          {
            name: "DPM++ 3M SDE Exponential",
            value: "DPM++ 3M SDE Exponential",
          },
          { name: "DPM fast", value: "DPM fast" },
          { name: "DPM adaptive", value: "DPM adaptive" },
          { name: "LMS Karras", value: "LMS Karras" },
          { name: "DPM2 Karras", value: "DPM2 Karras" },
          { name: "DPM2 a Karras", value: "DPM2 a Karras" },
          { name: "DPM++ 2S a Karras", value: "DPM++ 2S a Karras" },
          { name: "Restart", value: "Restart" },
          { name: "DDIM", value: "DDIM" },
          { name: "PLMS", value: "PLMS" },
          { name: "UniPC", value: "UniPC" }
        )
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */

  async execute(interaction, client) {
    const prompt = interaction.options.getString("prompt");
    const nprompt = prompt.toLowerCase();
    const model = interaction.options.getString("model");
    const negativePrompt =
      interaction.options.getString("negative-prompt") || "";
    const seed = interaction.options.getInteger("seed") || "-1";
    const steps = interaction.options.getInteger("steps") || "19";
    const imageStyle =
      interaction.options.getString("image-style") || "Cinematic";
    const sampler = interaction.options.getString("sampler") || "DPM-Solver";
    const logembed = new EmbedBuilder()
      .setDescription(`⌛ / Generating Image, This May Take a Moment...`)
      .setColor("Blue")
      .setFooter({
        text: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      });
    interaction.reply({
      embeds: [logembed],
    });

    const options = {
      count: 4,
      nsfw: !interaction.channel.nsfw,
      deepCheck: !interaction.channel.nsfw,
      negative_prompt: negativePrompt,
      cfg_scale: 9,
      width: 1024,
      height: 1024,
      steps: steps,
      seed: seed,
      sampler: sampler,
      image_style: imageStyle,
    };

    const imgURLS = await ApexImagine(model, nprompt, options);

    if (imgURLS.length === 0) {
      const notnsfwembed = new EmbedBuilder()
        .setTitle("> 🚫 NSFW Content Not Allowed")
        .setDescription(
          "This channel does not allow NSFW content. Please use a different channel."
        )
        .setColor("Red")
        .setFooter({
          text: interaction.user.username,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        });
      return await interaction.editReply({ embeds: [notnsfwembed] });
    }
    // Remove the loading embed
    const successfulembed = new EmbedBuilder()
      .setDescription(`✅ / Image Generated Successfully`)
      .setColor("Green")
      .setFooter({
        text: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL(),
      });
    await interaction.editReply({ embeds: [successfulembed] });

    for (const url of imgURLS) {
      const embed = new EmbedBuilder()
        .setTitle("> ✅ Image generated successfully")
        .setImage(url)
        .setColor("Blue")
        .setFooter({
          text: `User: ${interaction.user.username} | Model: ${model} | Prompt: ${prompt} | Negative Prompt: ${negativePrompt} | Steps: ${steps} | Seed: ${seed} | Sampler: ${sampler} | Style: ${imageStyle}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        });

      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Image")
          .setStyle(ButtonStyle.Link)
          .setURL(url)
      );

      // Send the embed and button in the same message
      await interaction.followUp({
        embeds: [embed],
        components: [button],
      });
    }
  },
};
