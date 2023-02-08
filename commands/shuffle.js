const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require("discord.js");

/**
 * Shuffles the song queue
 */
module.exports = {
    data: new SlashCommandBuilder() 
        .setName("shuffle")
        .setDescription("Shuffles the song queue")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false), 
    async execute(client, interaction) {
        try {
            // create a variable for the current voice channel
            let userVC = interaction.member.voice.channelId;

            // create variable for embed
            const embed = new EmbedBuilder()

            // FailCases:
            if (!userVC || typeof userVC === 'undefined') { // if user not in a voice channel 
                // create embed
                embed.setAuthor({name: "Error"}).setColor("#0099E1").setDescription("You need to enter the voice channel");
                // return embed
                return await interaction.reply({embeds: [embed]});
            }

            if (typeof client.queue != 'undefined') { // if queue exists
                if (typeof client.queue.get(`${interaction.guild.id}`) != 'undefined') { // if songqueue exists
                    // store song queue in variable
                    const songQueue = client.queue.get(`${interaction.guild.id}`);
                    try {
                        // if client vc id != member vc id
                        if (songQueue.connection.joinConfig.channelId != interaction.member.voice.channelId) {
                            // create embed
                            embed.setAuthor({name: "Error"}).setColor("#0099E1").setDescription("Enter the same channel as me");
                            // return embed
                            return await interaction.reply({embeds: [embed]});
                        }
                        // if no songs in songqueue
                        if (typeof songQueue.songs === 'undefined') return;
                        // if only song in queue is playing
                        if (songQueue.songs.length === 1) {
                            embed.setAuthor({name: "Error"}).setColor("#0099E1").setDescription("There are no songs in the queue");
                            // return embed
                            return await interaction.reply({embeds: [embed]});
                        } else if (songQueue.songs.length === 2) {
                            embed.setAuthor({name: "Error"}).setColor("#0099E1").setDescription("There is one song playing and only one in the queue");
                            // return embed
                            return await interaction.reply({embeds: [embed]});
                        } 
                        // if queue exists and more than one song is in the queue
                        for (let i = songQueue.songs.length - 1; i > 0; i--) {
                            // create element to switch the one at i with
                            const j = Math.floor(Math.random() * (i + 1));
                            // prevents the switching of the song currently playing
                            if (j == 0) {
                                // create variable k for element 1
                                const k = j + 1;
                                // switch elements at i and k
                                [songQueue.songs[i], songQueue.songs[k]] = [songQueue.songs[k], songQueue.songs[i]];
                            } else {
                                // switch elements at i and j
                                [songQueue.songs[i], songQueue.songs[j]] = [songQueue.songs[j], songQueue.songs[i]];
                            }
                        }
                        embed.setAuthor({name: "Success"}).setColor("#0099E1").setDescription("The queue has been shuffled");
                        // return embed
                        return await interaction.reply({embeds: [embed]});
                    } catch (err) {
                        console.log(err)
                        // send skipping to embed
                        embed.setAuthor({name: "Error"}).setDescription(`Couldn't shuffle the queue`).setColor("#0099E1");   
                        return await interaction.reply({embeds: [embed]});
                    }
                } else {
                    embed.setColor("#0099E1").setDescription("There is no queue to shuffle");
                    // return embed
                    return await interaction.reply({embeds: [embed]});
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
}