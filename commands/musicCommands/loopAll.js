const Discord = require("discord.js");

/**
 * Loops the entirety of the current song queue.
 */
 const loopAll = (message, guild, queue) => {
    // pulls the current queue of songs
    const songQueue = queue.get(guild.id);

    // check is song queue doesn't exist
    if (!songQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("There are no songs to repeat")
            .setColor("#0099E1")
        message.channel.send(embed);
        return;
    }

    // variable saving the current length of the queue
    const stop = songQueue.songs.length;
    
    // loops through the length of the queue and adds songs to the end of it in ascending order
    for (i = 0; i < stop; i++) {
        songQueue.songs.splice(songQueue.songs.length, 0, songQueue.songs[i]);
    }

    // success message embed
    const embed = new Discord.MessageEmbed()
            .setAuthor("Success!")
            .setDescription("The queue is now set to repeat")
            .setColor("#0099E1")
    return message.channel.send(embed);
}
module.exports = loopAll;