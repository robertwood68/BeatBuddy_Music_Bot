const Discord = require("discord.js");

/**
 * Joins the user's voice channel without playing any music
 * 
 * @returns an error message if the bot is already in a voice channel.
 */
 const joinChannel = async (message, guild, queue) => {
    const songQueue = queue.get(guild.id);

    if (songQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Already in the voice channel")
            .setColor("#0099E1")
        return message.channel.send(embed);
    } 

    const embed = new Discord.MessageEmbed()
        .setAuthor("Joining the channel")
        .setColor("#0099E1")
    message.channel.send(embed);
    message.member.voice.channel.join();
}
module.exports = joinChannel;