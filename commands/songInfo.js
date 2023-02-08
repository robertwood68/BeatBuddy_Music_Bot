const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

/**
 * Outputs song info for the current track
 */
module.exports = {
    data: new SlashCommandBuilder() 
        .setName('songinfo')
        .setDescription('Shows details of the current song, if available')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages, PermissionFlagsBits.Connect, PermissionFlagsBits.SendMessages)
        .setDMPermission(false), 
    async execute(client, interaction) {
        try {
            // create a variable for the current voice channel
            let userVC = interaction.member.voice.channelId;

            // FailCases:
            if (!userVC || typeof userVC === 'undefined') { // if user not in a voice channel 
                // create embed
                const responseEmbed = new EmbedBuilder()
                    .setAuthor({name: "Error"})
                    .setColor("#0099E1")
                    .setDescription("You need to enter the voice channel");
                // return embed
                return await interaction.reply({embeds: [responseEmbed]});
            }
            
            if (typeof client.queue != 'undefined') { // if queue exists
                if (typeof client.queue.get(`${interaction.guild.id}`) != 'undefined') { // if songqueue exists
                    const songQueue = client.queue.get(`${interaction.guild.id}`);
                    // Pull song data
                    const title = songQueue.songs[0].title;
                    const artist = songQueue.songs[0].artist;
                    const time = songQueue.songs[0].time;
                    const date = songQueue.songs[0].date;
                    try {
                        if (songQueue.connection.joinConfig.channelId != interaction.member.voice.channelId) { // if client vc id != member vc id
                            // create embed
                            const responseEmbed = new EmbedBuilder()
                                .setAuthor({name: "Error"})
                                .setColor("#0099E1")
                                .setDescription("Enter the same channel as me");
                            // return embed
                            return await interaction.reply({embeds: [responseEmbed]});
                        }
                        // if no songs in songqueue
                        if (typeof songQueue.songs === 'undefined') return;
                        const responseEmbed = new EmbedBuilder()
                            .setAuthor({name: title})
                            .setThumbnail(songQueue.songs[0].thumbnail)
                            .setDescription("**Artist:** " + artist + "\n**Length:** " + time + "\n**Date Published:** " + date)
                            .setColor("#0099E1")
                        // return embed
                        return await interaction.reply({embeds: [responseEmbed]});
                    } catch (err) {
                        console.log(err)
                    }
                } else {
                    const responseEmbed = new EmbedBuilder()
                        .setColor("#0099E1")
                        .setDescription("There are no songs in the queue");
                    // return embed
                    return await interaction.reply({embeds: [responseEmbed]});
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
}