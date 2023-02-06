const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const videoPlayer = require('../videoPlayer/videoPlayer');

/**
 * Stops the videoplayer if the command requested is //stop
 * 
 * @returns an arror message or leaves the channel
 */
module.exports = {
    data: new SlashCommandBuilder() 
        .setName('leave')
        .setDescription('Kicks BeatBuddy from the voice channel and clears the queue')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages, PermissionFlagsBits.Connect, PermissionFlagsBits.SendMessages)
        .setDMPermission(false), 
    async execute(client, interaction) {
        try {
            // create a variable for the current voice channel
            let userVC = interaction.member.voice.channelId;

            // FailCases:
            if (!userVC || typeof userVC === 'undefined') { // if user not in a voice channel 
                // create embed to hold current song
                const responseEmbed = new EmbedBuilder()
                    .setAuthor({name: "Error"})
                    .setColor("#0099E1")
                    .setDescription("You need to enter the voice channel");
                // return embed
                return await interaction.reply({embeds: [responseEmbed]});
            }
            
            if (typeof client.queue != 'undefined') { // if queue exists
                if (typeof client.queue.get(`${interaction.guild.id}`) != 'undefined') {
                    const songQueue = client.queue.get(`${interaction.guild.id}`);
                    try {
                        if (songQueue.connection.joinConfig.channelId != interaction.member.voice.channelId) {
                            // create embed
                            const responseEmbed = new EmbedBuilder()
                                .setAuthor({name: "Error"})
                                .setColor("#0099E1")
                                .setDescription("Enter the same channel as me");
                            // return embed
                            return await interaction.reply({embeds: [responseEmbed]});
                        }
                        if (typeof songQueue.songs === 'undefined') return;
                        const responseEmbed = new EmbedBuilder()
                            .setColor("#0099E1")
                            .setDescription("Leaving channel...");
                        // return embed
                        await interaction.reply({embeds: [responseEmbed]});
                        for (i = 0; i <= songQueue.songs.length; i++) {
                            songQueue.songs.shift();
                        }
                        videoPlayer(client, interaction, interaction.guild, songQueue.songs[0], client.queue, songQueue.connection);
                    } catch (err) {
                        console.log(err)
                    }
                }
            }
        } catch (err) {
            console.log(err)
            const embed = new EmbedBuilder()
                        .setDescription("Couldn't leave the channel")
                        .setColor("#0099E1")
            return await interaction.reply({embeds: [embed]});
        }
    }
}