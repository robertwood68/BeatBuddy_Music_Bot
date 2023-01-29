// const ytdl = require('ytdl-core');
// const ytSearch = require('yt-search');
// const ytpl = require('ytpl');
// const Discord = require('discord.js');
// const fetch = require('isomorphic-unfetch');
// const soundcloud = require('soundcloud-scraper');
// const { SoundCloud } = require("scdl-core");
// const scdl = new SoundCloud();
// const scClient = new soundcloud.Client(process.env.SOUNDCLOUD_API_KEY);
// const fs = require("fs");
// const { getData, getPreview, getTracks } = require('spotify-url-info')(fetch);
// const queue = require("../music");
// const ytCookie = "YSC=xrOrLy_mswk; VISITOR_INFO1_LIVE=fTo0vURBlEQ; wide=0; PREF=f4=4000000&tz=America.New_York&f6=40000000&f5=30000; LOGIN_INFO=AFmmF2swRgIhAIQraz_zdWZVz9vwUyyBB9K5QypB_EWEsc_Rx83WjCNmAiEApvQg-E8fTqw1pL9zN9gDTKN22_2TSOl7Lq7cIzWr2zk:QUQ3MjNmelRtb1EzNjNscnk2UEZrTkZBQzI5aGZfRWZ1c18yZmVxeXkyNjJQRkNDZEg3eUpEV21iemstWFNoTUpybWZCZC1KX19pNHhRNEJFLWU4UzZHQUExNmNFWVYyb1c1R0ljYnh3ZUFnRk9IczRSRDlDd0puQUVYYkt1SEx4eVNsenVNdkUtVlVFeEhJb19kR2VQdm95TmI4Z1VXbWVR; SID=JQjUJtTY7UFXuR5kdUY6ri1X8a4OTlfiWTAC9Jshq1z3htzCwBYfU6ndCAAULaE3YPKoMw.; __Secure-1PSID=JQjUJtTY7UFXuR5kdUY6ri1X8a4OTlfiWTAC9Jshq1z3htzCUBGT4tx4uvMTDfqbGO1mpw.; __Secure-3PSID=JQjUJtTY7UFXuR5kdUY6ri1X8a4OTlfiWTAC9Jshq1z3htzCDfxu5lphiZVSuOBUYo97aA.; HSID=AIcOpsLqfP1ptA6Gs; SSID=A2fbCMZwMVPQQ9C9d; APISID=QItfrcR2Iva__JgM/AXGikIg8xnITdlKks; SAPISID=swzssEsQqdq2bLD3/A0gdEuiqhy0yyMuYk; __Secure-1PAPISID=swzssEsQqdq2bLD3/A0gdEuiqhy0yyMuYk; __Secure-3PAPISID=swzssEsQqdq2bLD3/A0gdEuiqhy0yyMuYk; SIDCC=AJi4QfF50GVGxwQ1WWt-YRnRwuzdkn8blXK9BmethVZOprvx6A9b3RHX5y0BxDYv-1Px06H5FEc; __Secure-3PSIDCC=AJi4QfEhzm6JuecJt3eC_Qajm6dL08-DeHE2l_ZXsiuYLeJxSnMg-2nzD19p3BbcWJrkiii034w";

// /**
//  * Configures the options for the music and plays the music in the voice channel.
//  * 
//  * FULLY FUNCTONAL
//  * 
//  * @returns null if no song, or "Now playing ${song.title}" if the song is detected and found.
//  */
//  const videoPlayer = async (guild, song) => {
//     const songQueue = queue.get(guild.id);

//     if (!song) {
//         const embed = new Discord.MessageEmbed()
//             .setAuthor("No more songs in the queue.")
//             .setColor("#0099E1")
//         songQueue.text_channel.send(embed);
//         songQueue.voice_channel.leave();
//         queue.delete(guild.id);
//         return;
//     }
//     if (ytdl.validateURL(song.url) || ytpl.validateID(song.url)) {
//         try {
//             const stream = ytdl(song.url, {requestOptions: { headers: { cookie: ytCookie } }, filter: 'audioonly', highWaterMark: 1<<25 }); // audio options for stream
//             songQueue.connection.play(stream, { seek: 0, volume: 0.5 })
//             .on('finish', () => {
//                 songQueue.songs.shift();
//                 videoPlayer(guild, songQueue.songs[0]);
//             })
//             // string to set as description in embed
//             let str = "";
//             str += `**Now Playing:**\n ${song.title}`;

//             // create embed to hold current song
//             const embed = new Discord.MessageEmbed()
//                 .setThumbnail(song.thumbnail)
//                 .setDescription(str)
//                 .setColor("#0099E1")

//             // return now playing embed
//             await songQueue.text_channel.send(embed);
//             return;
//         } catch {
//             console.log(err);
//             const embed = new Discord.MessageEmbed()
//                 .setAuthor("Failure!")
//                 .setDescription("Unable to play the song.  Attempting to skip to the next one.")
//                 .setColor("#0099E1")
//             songQueue.songs.shift();
//             videoPlayer(guild, songQueue.songs[0]);
//             // return error message
//             await songQueue.text_channel.send(embed);
//             return;
//         }
//     } else {
//         try {
//             const stream = await scClient.getSongInfo(song.url).then(function(data) {
//                 return data.downloadProgressive();
//             });
//             songQueue.connection.play(stream, {seek: 0, volume: 0.5})
//             .on('finish', () => {
//                 songQueue.songs.shift();
//                 videoPlayer(guild, songQueue.songs[0]);
//             });
//             // string to set as description in embed
//             let str = "";
//             str += `**Now Playing:**\n ${song.title}`;

//             // create embed to hold current song
//             const embed = new Discord.MessageEmbed()
//                 .setThumbnail(song.thumbnail)
//                 .setDescription(str)
//                 .setColor("#0099E1")

//             // return now playing embed
//             await songQueue.text_channel.send(embed);
//             return;
//         } catch (err) {
//             console.log(err);
//             const embed = new Discord.MessageEmbed()
//                 .setAuthor("Failure!")
//                 .setDescription("Unable to play the song.  Attempting to skip to the next one.")
//                 .setColor("#0099E1")
//             songQueue.songs.shift();
//             videoPlayer(guild, songQueue.songs[0]);
//             // return error message
//             await songQueue.text_channel.send(embed);
//             return;
//         }
//     }
// }
// module.exports = videoPlayer;