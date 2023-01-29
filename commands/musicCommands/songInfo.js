const Discord = require("discord.js");

/**
 * Outputs song info for the current track
 */
 const songInfo = (message, guild, queue) => {
    const songQueue = queue.get(guild.id);
    
    // check if song queue doesn't exist
    if (!songQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("There are no songs in the queue")
            .setColor("#0099E1")
        message.channel.send(embed);
        return;
    }

    // Works correctly
    const title = songQueue.songs[0].title;
    const artist = songQueue.songs[0].artist;
    const time = songQueue.songs[0].time;
    const date = songQueue.songs[0].date;

    // create embed to hold current song plus the next ten after it
    const embed = new Discord.MessageEmbed()
        .setAuthor(title)
        .setThumbnail(songQueue.songs[0].thumbnail)
        .setDescription("**Artist:** " + artist + "\n**Length:** " + time + "\n**Date Published:** " + date)
        .setColor("#0099E1")

    // return a message embed containing the queue
    return message.channel.send(embed);
}
module.exports = songInfo;