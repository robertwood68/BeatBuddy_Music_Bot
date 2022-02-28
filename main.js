/**
 * Main class for BeatBuddy Music Bot.
 * 
 * Milestone 1: Completed
 *      Base prototype, functional commands, base website
 * Milestone 2: 
 *      Add playlist support and host bot and site through AWS
 * Milestone 3: 
 *      Add queue, song info, shuffle commands.  Also add "premium" features.
 * 
 * @author Robert Wood
 */

// require discord.js from the start for use later in the program
const Discord = require('discord.js');
// require dotenv to secure the bot token
require('dotenv').config();

// create an instance of the discord client
const client = new Discord.Client();

// creates a new collection to hold the commands
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

// for loop that provides the client and Discord variables to the command_handler and event_handler
var handlers = ['command_handler', 'event_handler'];
for(const handler of handlers){
    require(`./handlers/${handler}`)(client, Discord);
};

// logs the bot into discord by processing the bot token from the enviornment variable file ".env"
client.login(process.env.BOT_TOKEN);
client.on("error", () => {client.login(process.env.BOT_TOKEN)});