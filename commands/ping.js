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
            console.log('time for pong');
            message.channel.send('Pong');
        }
    }
}