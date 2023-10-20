const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require('discord.js');
const videoPlayer = require('../videoPlayer/videoPlayer');
/**
 * Skips from the current song to the next if the command requested is //skip
 * 
 * @returns error message or ends the current song
 */
module.exports = {
    data: new SlashCommandBuilder() 
    .setName('skip')
    .setDescription('Skips the current song')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages, PermissionFlagsBits.Connect, PermissionFlagsBits.SendMessages)
    .setDMPermission(false), 
    async execute(client, interaction) {
        // create a variable for the current voice channel
        let voiceChannel = interaction.member.voice.channelId;

        // FailCases:
        if (!voiceChannel) { // if user not in a voice channel 
            // create embed to hold current song
            const responseEmbed = new EmbedBuilder()
                .setAuthor({name: "Error"})
                .setColor("#0099E1")
                .setDescription("You need to enter the voice channel");

            // return embed
            return await interaction.reply({embeds: [responseEmbed]});
        } else if (typeof client.queue === 'undefined') { // if queue doesn't exist
            const embed = new EmbedBuilder()
                .setColor('#0099E1')
                .setDescription('There are no songs to skip');
            return await interaction.reply({embeds: [embed]});
        } 
        let songQueue = client.queue.get(`${interaction.guild.id}`);
        if (typeof songQueue.connection === 'undefined') {
            const embed = new EmbedBuilder()
                .setColor('#0099E1')
                .setDescription('There are no songs to skip');
            return await interaction.reply({embeds: [embed]});
        }
        if (songQueue.connection.joinConfig.channelId != interaction.member.voice.channelId) { // if client vc id != member vc id
            // create embed
            const responseEmbed = new EmbedBuilder()
                .setAuthor({name: "Error"})
                .setColor("#0099E1")
                .setDescription("Enter the same channel as me");
            // return embed
            return await interaction.reply({embeds: [responseEmbed]});
        }
        const embed = new EmbedBuilder()
                .setColor('#0099E1')
                .setDescription('Skipping the song...');
        await interaction.reply({embeds: [embed]});

        try {
            songQueue.songs.shift();
            videoPlayer(client, interaction, interaction.guild, songQueue.songs[0], client.queue, songQueue.connection);
            console.log("Skipped")
        } catch (err) {
            const failureEmbed = new EmbedBuilder()
                .setColor('#0099E1')
                .setDescription("Couldn't skip the song.");
            return await interaction.channel.send({embeds: [failureEmbed]});
        }
    }
}