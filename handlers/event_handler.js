// require fileSystem in order to read directories
const fs = require('fs');

/**
 * Adds all of the events to the events collection in the main class.
 * 
 * @author Robert Wood
 */
module.exports = (client, Discord) => {
    // loads the events directory
    const load_dir = (dirs) => {
        // creates the eventFiles variable to hold each event
        const eventFiles = fs.readdirSync(`./events/${dirs}`).filter(file => file.endsWith('.js'));

        // adds each event to eventFiles from the events folder
        for (const file of eventFiles) {
            const event = require(`../events/${dirs}/${file}`);
            const eventName = file.split('.')[0];
            client.on(eventName, event.bind(null, Discord, client));
        }
    }

    // loads each events directory
    ['client', 'guild'].forEach(e => load_dir(e));
}