// let music = require("./music");
// const Discord = require('discord.js');
// module.exports = {
//     name: "skip",
//     description: "skips song",
//     async execute(message) {
//         if (!music.voiceChannel) {
//             const embed = new Discord.MessageEmbed()
//                 .setAuthor("Must be in the voice channel to skip a song")
//                 .setColor("#0099E1")
//             return message.channel.send(embed);
//         }

//         if (!music.serverQueue) {
//             const embed = new Discord.MessageEmbed()
//                 .setAuthor("There are no songs in the queue")
//                 .setColor("#0099E1")
//             return message.channel.send(embed);
//         }
        
//         const embed = new Discord.MessageEmbed()
//                 .setAuthor("Skipping the current song...")
//                 .setColor("#0099E1")
//             message.channel.send(embed);

//         // end the dispatcher to skip the song currently playing
//         try {
//             music.serverQueue.connection.dispatcher.end();
//         } catch (err) {
//             const embed = new Discord.MessageEmbed()
//                 .setAuthor("Error")
//                 .setDescription("Couldn't execute the command")
//                 .setColor("#0099E1")
//             message.channel.send(embed);
//         }
//     }
// }