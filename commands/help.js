/**
 * Sends two messages.  The first contains a list of general commands and their functions, and the second contains a list of music-specific commands and their functions.
 * 
 * @author Robert Wood
 */
module.exports = {
    name: 'help',
    description: "Outputs a list of commands available for the bot",
    execute(message, args, cmd, client, Discord) {
        if (cmd === 'help') {
            console.log('Sending commands list');
            message.channel.send("List of my basic commands: \n  - ' //clear (int), //delete (int), or //del (int) ' allows me to clear the specified number of messages. \n - ' //hello, //hey, or //hi ' has me say hello to the person who said it. \n - ' //help ' will have me send a list of all available commands \n - ' //ping ' will make me respond with ' pong '");
            message.channel.send("List of my audioplayer commands: \n - ' //play (Insert URL) ' will make me join an audio channel and play the song tied to the url \n - ' //add (Insert URL) ' will allow me to add the contents of the url to the queue \n - ' //queue ' will allow me to show you the lineup of songs in the queue \n - ' //skip ' will make me skip the current song to the next in the queue \n - ' //stop ' will have me end the song and exit the voice channel which will also clear the queue");
        }
    }
}