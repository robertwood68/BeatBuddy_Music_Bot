const Discord = require("discord.js");

/**
 * Handles the resume statement as its own function becuase of the connection.dispatcher.resume() is buggy in the newest version of discord.js.
 */
 const uglyResumeMethod = (serverQueue) => {
    // In order to have one command, the order of commands must be exactly this --> pause, resume, resume, pause, resume, resume.
    serverQueue.connection.dispatcher.pause(true);
    serverQueue.connection.dispatcher.resume();
    serverQueue.connection.dispatcher.resume();
    serverQueue.connection.dispatcher.pause(true);
    serverQueue.connection.dispatcher.resume();
    serverQueue.connection.dispatcher.resume();
    // Unfortunately, all of these statements are neccessary as the newest release of
    // discord.js has a very buggy version of dispatcher.resume().  By using these 
    // statements, the users only need to command //resume once to unpause the song
    // instead of twice.
}

/**
 * Unpauses the song if the command requested if //resume
 */
 const resumeSong = (message, serverQueue) => {
    if(!serverQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("There is nothing to unpause")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    const embed = new Discord.MessageEmbed()
            .setAuthor("Attempting to resume the song...")
            .setColor("#0099E1")
    message.channel.send(embed);
    uglyResumeMethod(serverQueue); // If the song is paused this will unpause it.
    const embed1 = new Discord.MessageEmbed()
            .setAuthor("Song resumed!")
            .setColor("#0099E1")
    message.channel.send(embed1); // Sends a message to the channel the command was used in after it unpauses.
}
module.exports = resumeSong;