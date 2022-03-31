/**
 * Replies with hey to whichever user sent the command.
 * 
 * @author Robert Wood
 */
module.exports = {
    name: 'hello',
    aliases: ['hi', 'hey'],
    description: "Says hello to the author of the command message",
    execute(message, args, cmd, client, Discord) {
        const embed = new Discord.MessageEmbed()
                .setAuthor('Hey ' + message.author.username + '!')
                .setColor("#0099E1")
        return message.channel.send(embed);
    }
}