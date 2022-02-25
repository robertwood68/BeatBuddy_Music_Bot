/**
 * Processes which commands should be executed based off of the message content.
 * 
 * @author Robert Wood
 */
require('dotenv').config();
module.exports = (Discord, client, message) => {
    // prefix used for bot commands
    const prefix = process.env.PREFIX;

    // cover the off-chance that the message doesnt start with the prefix or the message is from another bot
    if (!message.content.startsWith(prefix) || message.author.bot) {
        return;
    }

    // allow the usage of the prefix + command name as argument[0]
     const args = message.content.slice(prefix.length).split(/ +/);
     const cmd = args.shift().toLowerCase();

     // get the command requested
     const command = client.commands.get(cmd) || client.commands.find(alt => alt.aliases && alt.aliases.includes(cmd));

     try {
         command.execute(message, args, cmd, client, Discord);
     } catch (err) {
         message.reply('an error occured while trying to execute the command');
         console.log(err);
     }
}