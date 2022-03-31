/**
 * Main class for BeatBuddy Music Bot.
 * 
 * Milestone 1: (COMPLETE)
 *      Base prototype, functional commands, base website
 * 
 * Milestone 2: (COMPLETE)
 *      Add playlist support (DONE)
 *      Hostig bot through vultr, upload files throught filezilla, host wesbite on google cloud storage (DONE)
 * 
 * Milestone 3: (In Progress)
 *      Add queue (DONE), song info (DONE), shuffle commands (DONE)
 *      Add Scrub command (Working on now)
 *      Add Spotify and SoundCloud Support to the music commands (Working on now)
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

// sets the activity of the bot to how many servers it is currently in.
client.on('ready', () => {
    client.user.setActivity(`over the music in ${client.guilds.cache.size} servers`, {
        type: "WATCHING",
        name: "ittt"
    });
})

// logs the bot into discord by processing the bot token from the enviornment variable file ".env"
client.login(process.env.BOT_TOKEN);
client.on("error", () => {client.login(process.env.BOT_TOKEN)});
