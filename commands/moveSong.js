const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require("discord.js");

/**
 * Moves the specified song to the top of the queue
 */
module.exports = {
    data: new SlashCommandBuilder() 
        .setName("move")
        .setDescription("Moves the song at the specified index to play next")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false)
        .addNumberOption(options => options
            .setName('songindex')
            .setDescription('Provide the queue index of the song you want to play next')
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
                        if (num > songQueue.songs.length) {
                            return await interaction.reply({embeds: [embed.setAuthor({name: "Error"}).setDescription("There is no song at the index requested").setColor("#0099E1")]});
                        } else if (num < 2) {
                            return await interaction.reply({embeds: [embed.setAuthor({name: "Error"}).setDescription("You can't move the current song or the first song in the queue to play next").setColor("#0099E1")]});
                        }
                        // if there is a song at the specified index
                        if (songQueue.songs[num]) {
                            // song selected by the user
                            const selectedSong = songQueue.songs[num];

                            // remove the song from its original index
                            songQueue.songs.splice(num, 1);

                            // moves the song to the next spot in the queue
                            songQueue.songs.splice(1, 0, selectedSong);
                            return await interaction.reply({embeds: [embed.setAuthor({name: "Success"}).setColor("#0099E1").setDescription("The song has been moved to play next")]});
                        }
                    } catch (err) {
                        console.log(err)
                        // send error embed
                        return await interaction.reply({embeds: [embed.setAuthor({name: "Error"}).setDescription(`Couldn't move the song`).setColor("#0099E1")]});
                    }
                } else {
                    // return embed
                    return await interaction.reply({embeds: [embed.setColor("#0099E1").setDescription("There are no songs to move")]});
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
}