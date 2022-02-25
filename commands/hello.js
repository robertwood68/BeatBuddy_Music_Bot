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
        console.log('Saying hello');
        message.channel.send('Hey ' + message.author.username + '!');
    }
}