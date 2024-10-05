/**
 * Deploys commands from the list of slash commands when
 * 'node deploy-commands.js' is run from the terminal
 * 
 * @author Rob Wood, 2024
 */
// imports
const { clientId, guildId, token } = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('node:fs');

// empty array for commands
const commands = [];

// grab each command file from the /commands directory
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// get the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

// construct an instance of the REST module
const rest = new REST({ version: '10' }).setToken(token);

// deploy the commands
(
	async () => {
		try {
			// log start
			console.log(`Started refreshing ${commands.length} application (/) commands.`);

			// refresh all the commands in the guild with the PUT method
			const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });

			// log end
			console.log(`Successfully reloaded ${data.length} application (/) commands.`);
		} catch (error) {
			// log errors
			console.error(error);
		}
	}
)();