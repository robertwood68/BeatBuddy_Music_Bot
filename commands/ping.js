/**
* Responds to "//ping" with "Pong".
* 
* Mainly a test command, however it is left in for fun.
* 
* @author Robert Wood
*/
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),
    async execute(client, interaction) {
        // hidden reply to command
        const responseEmbed = new EmbedBuilder().setColor("#0099E1");
        interaction.reply({embeds: [responseEmbed.setDescription(`Pong!`)]})
    }
};

// global reply to command
        //await interaction.reply('Pong!');
// edit reply after initial one has been sent
        // await wait(2000);
		// await interaction.editReply('Pong again!');
        // defer the time to process command
        // await interaction.deferReply();
		// await wait(4000);
		// await interaction.editReply('Pong!');
        // follow up a reply
        // await interaction.followUp({ content: 'Pong again!', ephemeral: true });


        // const { SlashCommandBuilder } = require('discord.js');

        // const data = new SlashCommandBuilder()
        //     .setName('gif')
        //     .setDescription('Sends a random gif!')
        //     .addStringOption(option =>
        //         option.setName('category')
        //             .setDescription('The gif category')
        //             .setRequired(true)
        //             .addChoices(
        //                 { name: 'Funny', value: 'gif_funny' },
        //                 { name: 'Meme', value: 'gif_meme' },
        //                 { name: 'Movie', value: 'gif_movie' },
        //             )
        //     );