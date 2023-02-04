/**
 * Handles all client events.
 * 
 * @author Robert Wood
 */
const fs = require('node:fs');
const path = require('node:path');
module.exports = (client) => {
    // event handler
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    // iterate over every event file and set to client events list
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}