/**
 * Handles all client commands.
 * 
 * @author Robert Wood
 */
const fs = require('node:fs');
const path = require('node:path');
module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../commands'); // direct to commands folder
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    // iterate over every command file and set to client commands list
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// const embed = new EmbedBuilder()
//             .setColor("#0099E1")
//             .setTitle('Some title')
//             //.setURL('https://discord.js.org/')
//             //.setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
//             //.setDescription('Some description here')
//             //.setThumbnail('https://i.imgur.com/AfFp7pu.png')
//             // .addFields(
//             //     { name: 'Regular field title', value: 'Some value here' },
//             //     { name: '\u200B', value: '\u200B' },
//             //     { name: 'Inline field title', value: 'Some value here', inline: true },
//             //     { name: 'Inline field title', value: 'Some value here', inline: true },
//             // )
//             // .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
//             // .setImage('https://i.imgur.com/AfFp7pu.png')
//             // .setTimestamp()
//             // .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
//         const channel = client.channels.cache.get('id');
//         channel.send({ embeds: [embed] });