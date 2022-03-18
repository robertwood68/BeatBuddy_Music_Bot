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
        console.log('Sending num servers');
        message.channel.send(`I'm currently in ${client.guilds.cache.size} servers at this time.`);
    }
}
