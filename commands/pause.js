const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

/**
 * Pauses the song if the command requested if //pause
 */
 module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses the current song')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages, PermissionFlagsBits.Connect, PermissionFlagsBits.SendMessages)
        .setDMPermission(false),
    async execute(client, interaction) {
        try {
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
            }
            
            if (typeof client.queue != 'undefined') { // if queue exists
                const songQueue = client.queue.get(`${interaction.guild.id}`);
                if (songQueue.connection.joinConfig.channelId != interaction.member.voice.channelId) { // if client vc id != member vc id
                    // create embed
                    const responseEmbed = new EmbedBuilder()
                        .setAuthor({name: "Error"})
                        .setColor("#0099E1")
                        .setDescription("Enter the same channel as me");
                    // return embed
                    return await interaction.reply({embeds: [responseEmbed]});
                } else {
                    if (!songQueue.connection.state.subscription.player.pause()) {
                        const embed = new EmbedBuilder()
                            .setAuthor({name: "Error"})
                            .setDescription("The song is already paused")
                            .setColor("#0099E1")
                        return await interaction.reply({embeds: [embed]}); 
                    }
                    songQueue.connection.state.subscription.player.pause();
                    const embed = new EmbedBuilder()
                        .setAuthor({name: "Song paused!"})
                        .setColor("#0099E1")
                    return await interaction.reply({embeds: [embed]});
                }
            }
        } catch {
            const embed = new EmbedBuilder()
                        .setDescription("There is no song playing to pause")
                        .setColor("#0099E1")
            return await interaction.reply({embeds: [embed]});
        }
    }
}