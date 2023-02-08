const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require("discord.js");

/**
 * Removes the song at the specified index from the queue.
 */
module.exports = {
    data: new SlashCommandBuilder() 
        .setName("remove")
        .setDescription("Removes the song at the specified index")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false)
        .addNumberOption(options => options
            .setName('songindex')
            .setDescription('Provide the queue index of the song you want to remove')
            .setMinValue(1)
            .setRequired(true)
        ),
    async execute(client, interaction) {
        try {
            // create a variable for the current voice channel
            let userVC = interaction.member.voice.channelId;

            // create variable for embed
            const embed = new EmbedBuilder();

            // store user input in variable
            const num = interaction.options.getNumber('songindex');

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
                        if (songQueue.songs.length > 1) {
                            if (num > songQueue.songs.length) {
                                return await interaction.reply({embeds: [embed.setAuthor({name: "Error"}).setDescription("There is no song at the index requested").setColor("#0099E1")]});
                            } else if (num < 1) {
                                return await interaction.reply({embeds: [embed.setAuthor({name: "Error"}).setDescription("You can't remove the song currently playing").setColor("#0099E1")]});
                            } else if (songQueue.songs[num] && num != 0) {
                                songQueue.songs.splice(num, 1);
                                return await interaction.reply({embeds: [embed.setAuthor({name: `Track at index ${num} has been removed successfully`}).setColor("#0099E1")]});
                            } else if (num === 0) {
                                return await interaction.reply({embeds: [embed.setAuthor({name: "Error"}).setDescription("Can't remove a song that's already playing").setColor("#0099E1")]});
                            } else {
                                return await interaction.reply({embeds: [embed.setAuthor({name: "Error"}).setDescription(`Couldn't remove song at index ${args[0]}`).setColor("#0099E1")]});
                            }
                        } 
                    } catch (err) {
                        console.log(err)
                        // send error embed
                        return await interaction.reply({embeds: [embed.setAuthor({name: "Error"}).setDescription(`Couldn't remove the song`).setColor("#0099E1")]});
                    }
                } else {
                    // return embed
                    return await interaction.reply({embeds: [embed.setColor("#0099E1").setDescription("There are no songs to remove")]});
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
}