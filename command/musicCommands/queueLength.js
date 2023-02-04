const Discord = require("discord.js");

/**
 * Returns the number of songs in the queue.
 */
 const queueLength = (message, guild, queue) => {
    const songQueue = queue.get(guild.id);

    // checks if queue doesn't exist
    if (!songQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("There are no songs in the queue")
            .setColor("#0099E1")
        message.channel.send(embed);
        return;
    }

    // create embed to hold current song plus the next ten after it
    const embed = new Discord.MessageEmbed()
        .setAuthor("There are " + songQueue.songs.length + " songs in the queue")
        .setColor("#0099E1")

    // return a message embed containing the queue
    return message.channel.send(embed);
}
module.exports = queueLength;