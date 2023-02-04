const Discord = require("discord.js");

/**
 * Skips from the current song to the song requested by number.
 * 
 * @returns error message or skips to requested index in queue
 */
 const skipTo = (message, args, serverQueue, guild, songQueue) => {
    // if no number is given
    if (!args[0]) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("Try //skipto (integer)")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    // if the user tries to clear a number of messages that isn't real
    if (isNaN(args[0])) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("Try //skipto (integer)")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    // if the user tries to delete more than 100 messages
    if (args[0] > serverQueue.songs.length - 1) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("There is no song at index " + args[0])
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    // if the user tries to delete less than 1 message
    if (args[0] < 1) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("There is no song at index " + args[0])
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    // if user is not in the voice channel
    if (!message.member.voice.channel) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Must be in the voice channel to skip to a song")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    // if there is no queue
    if (!serverQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("There are no songs in the queue")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    
    const embed = new Discord.MessageEmbed()
            .setAuthor("Skipping to...")
            .setDescription(`**${args[0]})** ${songQueue.songs[args[0]].title}`)
            .setColor("#0099E1")   
    message.channel.send(embed);

    // end dispatcher and shift queue until queue reaches the song
    if (args[0] == 1) {
        for (i=0; i <= args[0] - 1; i++) {
            serverQueue.connection.dispatcher.end();
        }
    } else {
        for (i=0; i < args[0] - 1; i++) {
            serverQueue.connection.dispatcher.end();
            songQueue.songs.shift();
        }
    }
}
module.exports = skipTo;