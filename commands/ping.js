/**
 * Responds to "//ping" with "Pong".
 * 
 * Mainly a test command, however it is left in for fun.
 * 
 * @author Robert Wood
 */
module.exports = {
    name: 'ping',
    description: "Responds with pong",
    async execute(message, args, cmd, client, Discord) {
        if (cmd === 'ping') {
            const embed = new Discord.MessageEmbed()
                .setAuthor("Pong")
                .setColor("#0099E1")
            message.channel.send(embed);
        }
    }
}