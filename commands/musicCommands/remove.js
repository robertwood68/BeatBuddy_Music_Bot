const Discord = require("discord.js");

/**
 * Removes the song at the specified index from the queue.
 */
 const remove = (message, args, serverQueue, guild, queue) => {
    const songQueue = queue.get(guild.id);

    // check if song queue doesn't exist
    if (!songQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("There are no songs in the queue to remove")
            .setColor("#0099E1")
        message.channel.send(embed);
        return;
    }

    // if index requested is not a number
    if (isNaN(args[0])) {
        const embed = new Discord.MessageEmbed()
                .setAuthor("Error")
                .setDescription("Enter a number from the queue after //remove")
                .setColor("#0099E1")
            message.channel.send(embed);
        return;
    }

    // if the queue is longer than one, and there is a song at the requested index and the index is not 0, remove the track.  Otherwise, tell the user why the track couldn't be removed.
    if (serverQueue.songs.length > 1) {
        if (serverQueue.songs[args[0]] && args[0] != 0) {
            serverQueue.songs.splice(args[0], 1);
            const embed = new Discord.MessageEmbed()
                .setAuthor("Track at index " + args[0] + " has been removed successfully")
                .setColor("#0099E1")
            message.channel.send(embed);
            return;
        } else if (args[0] === 0) {
            const embed = new Discord.MessageEmbed()
                .setAuthor("Error")
                .setDescription("Can't remove a song that's already playing")
                .setColor("#0099E1")
            message.channel.send(embed);
            return;
        } else {
            const embed = new Discord.MessageEmbed()
                .setAuthor("Error")
                .setDescription("Couldn't remove song at index " + args[0])
                .setColor("#0099E1")
            message.channel.send(embed);
            return;
        }
    } 
}
module.exports = remove;