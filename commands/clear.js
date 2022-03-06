/**
 * Clears a specified number of messages from the current text channel.
 * 
 * @author Robert Wood
 */
module.exports = {
    name: 'clear',
    aliases:  ['delete', 'del'],
    description: "Clears a specified amount of messages from the text channel",
    execute(message, args, cmd, client, Discord) {
        console.log('Attempting to delete messages...');
        if (args[0] === 'all') {
            message.channel.bulkDelete(100, true);
            message.channel.bulkDelete(100, true);
            message.channel.bulkDelete(100, true);
            return;
        }
        // if no number of messages is specified
        if (!args[0]) return message.reply("You wanna give me a number of messages to delete or what?");
        // if the user tries to clear a number of messages that isn't real
        if (isNaN(args[0])) return message.reply("Nice try.  Enter a real number!");
        // if the user tries to delete more than 100 messages
        if (args[0] > 100) return message.reply("You can't delete more than 100 messages");
        // if the user tries to delete less than 1 message
        if (args[0] < 1) return message.reply("You have to delete at least 1 message, dawg.");
        // if no other failcases apply, delete the specified number of messages from the channel
        message.channel.bulkDelete(args[0], true);
        console.log("Messages deleted")
    }
}