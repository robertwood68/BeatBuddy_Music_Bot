const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require("discord.js");
const videoPlayer = require("../videoPlayer/videoPlayer");

/**
 * Skips from the current song to the song requested by number.
 * 
 * @returns error message or skips to requested index in queue
 */
module.exports = {
    data: new SlashCommandBuilder() 
        .setName("skipto")
        .setDescription("Skips to the specified index in the song queue")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false)
        .addNumberOption(options => options
            .setName('songindex')
            .setDescription('Provide the queue index of the song you want to skip to')
            .setMinValue(1)
            .setRequired(true)
        ),
    async execute(client, interaction) {
        try {
            // store user input in variable
            const num = interaction.options.getNumber('songindex');

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
                    // store song queue in variable
                    const songQueue = client.queue.get(`${interaction.guild.id}`);
                    try {
                        // if client vc id != member vc id
                        if (songQueue.connection.joinConfig.channelId != interaction.member.voice.channelId) {
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
                        // if the user tries to skip to a lettered index
                        if (isNaN(num)) {
                            const embed = new EmbedBuilder()
                                .setAuthor({name: "Error"})
                                .setDescription("Enter the number of the song in the queue")
                                .setColor("#0099E1")
                            return await interaction.reply({embeds: [embed]});
                        }
                        // if the user tries to skip to nonexistent index
                        if (num > songQueue.songs.length - 1 || num < 1) {
                            const embed = new EmbedBuilder()
                                .setAuthor({name: "Error"})
                                .setDescription("There is no song at index " + num)
                                .setColor("#0099E1")
                            return await interaction.reply({embeds: [embed]});
                        }
                        
                        // send skipping to embed
                        const embed = new EmbedBuilder()
                                .setAuthor({name: "Skipping to..."})
                                .setDescription(`**${num})** ${songQueue.songs[num].title}`)
                                .setColor("#0099E1")   
                        interaction.reply({embeds: [embed]});
                    
                        // end dispatcher and shift queue until queue reaches the song
                        if (num == 1) {
                            songQueue.songs.shift();
                            videoPlayer(client, interaction, interaction.guild, songQueue.songs[0], client.queue, songQueue.connection);
                        } else {
                            for (i=0; i < num; i++) {
                                songQueue.songs.shift();
                            }
                            videoPlayer(client, interaction, interaction.guild, songQueue.songs[0], client.queue, songQueue.connection);
                        }
                    } catch (err) {
                        console.log(err)
                        // send skipping to embed
                        const embed = new EmbedBuilder()
                                .setAuthor({name: "Error"})
                                .setDescription(`Couldn't skip to the song at the specified index`)
                                .setColor("#0099E1")   
                        return await interaction.reply({embeds: [embed]});
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