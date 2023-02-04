const Discord = require("discord.js");

/**
 * Shuffles the song queue
 */
 const shuffle = (message, guild, queue) => {
    const songQueue = queue.get(guild.id);

    // check is song queue doesn't exist
    if (!songQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("There is no queue to shuffle")
            .setColor("#0099E1")
        message.channel.send(embed);
        return;
    }

    // if only song in queue is playing
    if (songQueue.songs.length === 1) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("There are no songs in the queue")
            .setColor("#0099E1")
        message.channel.send(embed);
        return;
    } 
    
    // if one song is playing and there is only one in the queue
    if (songQueue.songs.length === 2) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("There is one song playing and only one in the queue")
            .setColor("#0099E1")
        message.channel.send(embed);
        return;
    } 
    
    // if queue exists and more than one song is in the queue
    for (let i = songQueue.songs.length - 1; i > 0; i--) {
        // create element to switch the one at i with
        const j = Math.floor(Math.random() * (i + 1));
        // prevents the switching of the song currently playing
        if (j == 0) {
            // create variable k for element 1
            const k = j + 1;
            // switch elements at i and k
            [songQueue.songs[i], songQueue.songs[k]] = [songQueue.songs[k], songQueue.songs[i]];
        } else {
            // switch elements at i and j
            [songQueue.songs[i], songQueue.songs[j]] = [songQueue.songs[j], songQueue.songs[i]];
        }
    }
    const embed = new Discord.MessageEmbed()
            .setAuthor("Success!")
            .setDescription("Queue has been shuffled")
            .setColor("#0099E1")
    return message.channel.send(embed);
}
module.exports = shuffle;