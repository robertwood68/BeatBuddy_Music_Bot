const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require("discord.js");

/**
 * Loops the current song in the queue.
 */
module.exports = {
    data: new SlashCommandBuilder() 
        .setName("repeat")
        .setDescription("Sets the song to repeat")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),
    async execute(client, interaction) {
        try {
            // create a variable for the current voice channel
            let userVC = interaction.member.voice.channelId;

            // create variable for embed
            const embed = new EmbedBuilder();

            // FailCases:
            // if user not in a voice channel
            if (!userVC || typeof userVC === 'undefined') { 
                return await interaction.reply({embeds: [embed.setAuthor({name: "Error"}).setColor("#0099E1").setDescription("You need to enter the voice channel")]});
            }

            // if queue exists
            if (typeof client.queue != 'undefined') {
                if (typeof client.queue.get(`${interaction.guild.id}`) != 'undefined') { // if songqueue exists
                    // store song queue in variable
                    const songQueue = client.queue.get(`${interaction.guild.id}`);
                    try {
                        // if client vc id != member vc id
                        if (songQueue.connection.joinConfig.channelId != interaction.member.voice.channelId) {
                            return await interaction.reply({embeds: [embed.setAuthor({name: "Error"}).setColor("#0099E1").setDescription("Enter the same channel as me")]});
                        }
                        // if no songs in songqueue
                        if (typeof songQueue.songs === 'undefined') return;
                        // index to put the songs at, how any elements to remove, and item to add at the front index
                        songQueue.songs.splice(1, 0, songQueue.songs[0]);
                        // send success message
                        return await interaction.reply({embeds: [embed.setAuthor({name: "Success"}).setDescription(`The song is now set to repeat`).setColor("#0099E1")]});
                    } catch (err) {
                        console.log(err)
                        // send error embed
                        return await interaction.reply({embeds: [embed.setAuthor({name: "Error"}).setDescription(`Couldn't set the song to repeat`).setColor("#0099E1")]});
                    }
                } else {
                    // return embed
                    return await interaction.reply({embeds: [embed.setColor("#0099E1").setDescription("There are no songs to repeat")]});
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
}