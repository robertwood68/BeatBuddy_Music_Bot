const Discord = require("discord.js");

/**
 * Pauses the song if the command requested if //pause
 */
 const pauseSong = (message, serverQueue) => {
    if (!serverQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("There is nothing to pause")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    if (serverQueue.connection.dispatcher.paused) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("The song is already paused")
            .setColor("#0099E1")
        return message.channel.send(embed); // Checks if the song is already paused.
    }
    // Sends a message to the channel the command was used in while trying to pause
    const embed = new Discord.MessageEmbed()
            .setAuthor("Attempting to pause the song...")
            .setColor("#0099E1")
    message.channel.send(embed);
    // If the song isn't paused this will pause it.
    serverQueue.connection.dispatcher.pause();
    // Sends a message to the channel the command was used in after it pauses
    const embed1 = new Discord.MessageEmbed()
            .setAuthor("Song paused!")
            .setColor("#0099E1")
    message.channel.send(embed1);
}
module.exports = pauseSong;