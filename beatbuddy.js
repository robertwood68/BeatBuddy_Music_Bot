/**
 * Main class for BeatBuddy Music Bot.
 * 
 * @author Robert Wood 2023
 */
const { Client, Collection, GatewayIntentBits, Discord } = require('discord.js');
require('@discordjs/voice');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

// require dotenv to secure the bot token
require('dotenv').config();

// creates new collections to hold the commands and events
client.commands = new Collection();
client.events = new Collection();
//FIX DEPLOY COMMANDS 
console.clear()
require('./deploy-commands');


// for loop that provides the client and Discord variables to the command_handler and event_handler
const handlers = ['command_handler', 'event_handler'];
for(const handler of handlers){
    require(`./handlers/${handler}`)(client);
}

// logs the bot into discord by processing the bot token from the enviornment variable file ".env"
client.login(`${process.env.BOT_TOKEN}`);
client.on("error", () => {`${client.login(process.env.BOT_TOKEN)}`});

// below is the code to show which version of discord.js is installed
// console.log(`Discord.js version is ${require("discord.js/package.json").version}`)

module.exports = {client};
