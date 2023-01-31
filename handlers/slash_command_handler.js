// require fileSystem in order to read directories
const fs = require('fs');

const ping = require("../slashcommands/ping");

/**
 * Adds each command to the commands collection in the main class.
 * 
 * @author Robert Wood
 */
module.exports = (client, Discord) => {
    // creates the commandFiles variable to hold each command
    const commandFiles = fs.readdirSync('./slashcommands/').filter(file => file.endsWith('.js'));

    // adds each command to the client.commands collection
    for (const file of commandFiles) {
        const command = require(`./slashcommands/${file}`);
        client.commands.set("ping", ping);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}