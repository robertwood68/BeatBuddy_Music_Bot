/**
 * Main class for BeatBuddy Music Bot.
 * 
 * Milestone 1: 
 * Status: Done
 * 
 *      Base prototype, functional commands, base website
 * 
 * Milestone 2:
 * Status: Done
 * 
 *      Add playlist support 
 *      Hosting bot through vultr, upload files throught filezilla, host wesbite on google cloud storage 
 * 
 * Milestone 3:
 * Status: Done
 *      
 *      Add queue, song info, shuffle commands
 *      Add skipto command 
 *      Add Spotify and SoundCloud Support to the music commands 
 * 
 * Post-Project Goals:              
 * Status: In Progress
 * 
 *      Seperate music.js into multiple files for each command inside of it
 *      Add new commands (loop, loopAll, move, moveTo)
 *
 * Once finished with all further development:  
 * Status: Not Started
 * 
 *      Convert all commands to slash commands
 * 
 * @author Robert Wood
 */

// require discord.js from the start for use later in the program
const Discord = require('discord.js');

// require dotenv to secure the bot token
require('dotenv').config();

// create a global instance of the discord client
global.client = new Discord.Client();

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
