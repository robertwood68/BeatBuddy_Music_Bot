const Discord = require("discord.js");

/**
 * Moves the specified song to the top of the queue
 */
 const moveSong = (message, args, serverQueue, guild, queue) => {
    const songQueue = queue.get(guild.id);

    // if no song queue
    if (!songQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("There are no songs in the queue")
            .setColor("#0099E1")
        message.channel.send(embed);
        return;
    }

    // if trying to move song playing currently
    if (args[0] == 0) {
        const embed = new Discord.MessageEmbed()
                .setAuthor("Error")
                .setDescription("Can't move the current song to play next, try '//loop'")
                .setColor("#0099E1")
            message.channel.send(embed);
        return;
    }

    // if index requested is not a number or no index is requested
    if (isNaN(args[0]) || !args[0]) {
        const embed = new Discord.MessageEmbed()
                .setAuthor("Error")
                .setDescription("Enter a number from the queue after //move")
                .setColor("#0099E1")
            message.channel.send(embed);
        return;
    }

    // if there is a song at the specified index
    if (songQueue.songs[args[0]]) {
        // song selected by the user
        const selectedSong = songQueue.songs[args[0]];

        // remove the song from its original index
        serverQueue.songs.splice(args[0], 1);

        // moves the song to the next spot in the queue
        songQueue.songs.splice(1, 0, selectedSong);

        // success message embed
        const embed = new Discord.MessageEmbed()
                .setAuthor("Success!")
                .setDescription("The song has been moved to play next")
                .setColor("#0099E1")
        return message.channel.send(embed);
    }

    // if anything outside of this method goes wrong
    const embed = new Discord.MessageEmbed()
        .setAuthor("Error!")
        .setDescription("There is no song at the index requested")
        .setColor("#0099E1")
    return message.channel.send(embed);
    
}
module.exports = moveSong;