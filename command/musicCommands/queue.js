const Discord = require("discord.js");

/**
 * Outputs the current song and the next ten songs following it as an embed.
 */
 const getQueue = (message, guild, queue) => {
    const songQueue = queue.get(guild.id);

    // checks if queue doesn't exist
    if (!songQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("There are no songs in the queue")
            .setColor("#0099E1")
        message.channel.send(embed);
        return;
    }

    let index = 1;
    let str = "";

    // for the song currently playing
    if (songQueue.songs[0]) str += `**Currently playing:**\n ${songQueue.songs[0].title}\n\n`;

    // for next ten songs after the first one
    if (songQueue.songs[1]) str += `**Next Songs In Queue:**\n ${songQueue.songs.slice(1, 11).map(x => `**${index++})** ${x.title}\n Artist: **${x.artist}** \n Requested by: **${x.requester}**`).join("\n\n")}`;


    // create embed to hold current song plus the next ten after it
    const embed = new Discord.MessageEmbed()
        .setAuthor(`${message.guild.name}'s Queue`)
        .setThumbnail(songQueue.songs[0].thumbnail)
        .setDescription(str)
        .setColor("#0099E1")

    // return a message embed containing the queue
    return message.channel.send(embed);
}
module.exports = getQueue;