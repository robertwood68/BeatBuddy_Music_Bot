/**
 * Main class for BeatBuddy Music Bot.
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





























/**
 * COMMANDS THAT NEED TO BE REFORMATTED IN THE COMMANDS FOLDER AS INDIVIDUAL FILES FOR EACH ONE
 */

// // holds the queue songs
// var servers = {};
//     /**
//      * Plays whatever the user wants to hear in an audio channel through "//play (Link or title)".
//      */
//     case 'play' :

//         /**
//          * Defines the play function which will use YouTubeDL to download only the audio of the request and play it in the current voice channel.
//          * 
//          * @param {*} connection Voice channel connection
//          * @param {*} message What is requested to be played in the voice channel
//          */
//         async function play(connection, message){

//             // create the server variable
//             var server = servers[message.guild.id];

//             // create server dispatcher to download the audio of the file
//             server.dispatcher = connection.play(ytdl(server.queue[0], {filter:"audioonly"}));

//             //shifts the queue over
//             server.queue.shift();

//             // If there is something in the queue after the audio ends, play it.  If not, disconnect from the channel.
//             if (server.queue[0]) {
//                 server.dispatcher.on("finish", function(){
//                      if(server.queue[0]) {
//                         play(connection, message);
//                      } else {
//                          connection.disconnect();
//                      }
//                 });
//             }
//         }

//         

//         // create queue
//         if (!servers[message.guild.id]) servers[message.guild.id] = {
//             queue: []
//         }

//         // create the server variable for use with the play command
//         var server = servers[message.guild.id];

//         // push the queue
//         server.queue.push(args[1]);
        
//         // if user is in a voice channel, join it and play the requested song
//         if (!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection) {
//             play(connection, message);
//         })
//     break;

//     /**
//      * Adds a requested song to the queue if a link is provided, if not tell the user to paste a link as the request after //add
//      * 
//      * THIS WORKS FINE DON'T CHANGE IT
//      */
//     case 'add' :
//         var server = servers[message.guild.id];
//         if (!args[1]) {
//             return message.channel.send("Do you expect me to add nothing to the queue?  Paste a link too!!!");
//         } else {
//             server.queue.push(args[1]); // set another element in arguments as the next requested song
//             message.channel.send("Added song to the queue")
//             console.log("added the song to the queue")
//         }
//     break;

//     /**
//      * Outputs the each item in the queue.
//      * 
//      * THIS WORKS FINE DON'T CHANGE IT
//      */
//     case 'queue' :
//         var server = servers[message.guild.id];
//         if (message.member.voice.channel) {
//             for (var i = 0; i < server.queue.length; i++) {
//                 if (i === 0) {
//                     message.channel.send("Current Track: " + server.queue[0]);
//                 } else if (i > 0) {
//                     message.channel.send("Next Track:" + server.queue[i]);
//                 }
//             }
//         } else if (!message.member.voice.channel) {
//             message.reply("Make sure you join a voice channel first");
//         } else if (!message.guild.voice.connection) {
//             message.reply("Ask me to play something first");
//         }
//     break;

//     /**
//      * Skips the current song when the user commands //skip in a text channel
//      */
//     case 'skip' :
//         var server = servers[message.guild.id];
//         message.channel.send("Attempting to skip to the next song...");
//         if(server.dispatcher) {
//             server.dispatcher.end(); // end the server dispatcher to move on in the queue
//             message.channel.send("Song skipped successfully");
//             console.log("Skip is working");
//         } else if (server.queue.length == 0) {
//             server.dispatcher.end();
//             message.channel.send("There are no more songs in the queue");
//             message.channel.send("Leaving the voice channel...");
//             console.log("No more songs - left channel");
//             message.guild.voice.connection.disconnect(); // disconnects from the voice channel
//         }
//     break;    

//     /**
//      * Stops the audio in the voice channel and exits the channel when the user commands //stop in a text channel
//      * 
//      * THIS WORKS FINE DON'T CHANGE IT
//      */
//     case 'stop' :
//         var server = servers[message.guild.id];
//         // takes everything out of the queue
//         if (message.guild.voice.connection) {
//             for(var i = server.queue.length -1; i >= 0; i--) {
//                 server.queue.splice(i, 1);
//             }

//             server.dispatcher.end();
//             message.channel.send("Ending the queue and leaving the voice channel.");
//             console.log('Emptied the queue');
//             message.guild.voice.connection.disconnect();
//         }

//         //if(message.guild.connection)  // disconnects from the voice channel
//     break;
// }