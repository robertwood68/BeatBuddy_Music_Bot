const Discord = require("discord.js");

/**
 * Stops the videoplayer if the command requested is //stop
 * 
 * @returns an arror message or leaves the channel
 */
 const leaveChannel = (message, serverQueue) => {
    const userVoiceChannel = message.member.voice.channel;
    if (!userVoiceChannel) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("I'm not in a voice channel")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    if (serverQueue) {
        // empties the queue
        serverQueue.songs = [];
        // ends dispatcher to disconnect from channel after emptying the queue
        if (serverQueue.connection.dispatcher) {
            serverQueue.connection.dispatcher.end();
        } else {
            userVoiceChannel.leave();
        }
        const embed = new Discord.MessageEmbed()
            .setAuthor("Left the voice channel")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    userVoiceChannel.leave();
    const embed = new Discord.MessageEmbed()
            .setAuthor("Left the voice channel")
            .setColor("#0099E1")
    message.channel.send(embed);
}
module.exports = leaveChannel;