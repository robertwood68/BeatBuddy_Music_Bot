/**
 * Replies with hey to whichever user sent the command.
 * 
 * @author Robert Wood
 */
 module.exports = {
    name: 'servercount',
    aliases: ['sc'],
    description: "Outputs the number of servers that BeatBuddy is in.",
    execute(message, args, cmd, client, Discord) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Am I Famous Yet?")
            .setDescription(`I'm currently in ${client.guilds.cache.size} servers at this time.`)
            .setColor("#0099E1")
        message.channel.send(embed);
    }
}
