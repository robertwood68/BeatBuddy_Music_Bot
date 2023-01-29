const Discord = require("discord.js");

/**
 * Loops the current song in the queue.
 */
 const loopSong = (message, guild, queue) => {
    const songQueue = queue.get(guild.id);

    // check is song queue doesn't exist
    if (!songQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("There is no song to repeat")
            .setColor("#0099E1")
        message.channel.send(embed);
        return;
    }

    // index to put the songs at, how any elements to remove, and item to add at the front index
    songQueue.songs.splice(1, 0, songQueue.songs[0]);

    const embed = new Discord.MessageEmbed()
            .setAuthor("Success!")
            .setDescription("The song is now set to repeat")
            .setColor("#0099E1")
    return message.channel.send(embed);
}
module.exports = loopSong;