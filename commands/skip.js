const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require('discord.js');
const { serverQueue, connection } = require("./music");
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
        client.player.stop(); // need to figure out how to skip with player
        console.log("Skipped")
        const embed = new EmbedBuilder()
            .setColor('#0099E1')
            .setDescription('Skipped the song');
        return await interaction.reply({embeds: [embed]});
        // if (!message.member.voice.channel) {
        //     const embed = new Discord.MessageEmbed()
        //         .setAuthor("Must be in the voice channel to skip a song")
        //         .setColor("#0099E1")
        //     return message.channel.send(embed);
        // }
        // if (!serverQueue) {
        //     const embed = new Discord.MessageEmbed()
        //         .setAuthor("There are no songs in the queue")
        //         .setColor("#0099E1")
        //     return message.channel.send(embed);
        // }
        // const embed = new Discord.MessageEmbed()
        //         .setAuthor("Skipping the current song...")
        //         .setColor("#0099E1")
        // message.channel.send(embed);
    
        // // end the dispatcher to skip the song currently playing
        // try {
        //     serverQueue.connection.dispatcher.end();
        // } catch (err) {
        //     const embed = new Discord.MessageEmbed()
        //         .setAuthor("Error")
        //         .setDescription("Couldn't execute the command")
        //         .setColor("#0099E1")
        //     message.channel.send(embed);
        // }
    }
}
// module.exports = skipSong;