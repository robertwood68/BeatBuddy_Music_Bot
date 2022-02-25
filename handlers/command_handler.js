// require fileSystem in order to read directories
const fs = require('fs');

/**
 * Adds each command to the commands collection in the main class.
 * 
 * @author Robert Wood
 */
module.exports = (client, Discord) => {
    // creates the commandFiles variable to hold each command
    const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

    // adds each command to the client.commands collection
    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        // if the command has a name
        if (command.name) {
            client.commands.set(command.name, command); // sets the command found in the client.commands collection by name and its function
        } else {
            continue; // continues if no command name
        }
    }
}