const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const ytpl = require('ytpl');
const Discord = require('discord.js');
const fetch = require('isomorphic-unfetch');
const soundcloud = require('soundcloud-scraper');
const { SoundCloud } = require("scdl-core");
const scdl = new SoundCloud();
const scClient = new soundcloud.Client(process.env.SOUNDCLOUD_API_KEY);
const fs = require("fs");
const { getData, getPreview, getTracks } = require('spotify-url-info')(fetch);
const queue = new Map();
const ytCookie = "YSC=xrOrLy_mswk; VISITOR_INFO1_LIVE=fTo0vURBlEQ; wide=0; PREF=f4=4000000&tz=America.New_York&f6=40000000&f5=30000; LOGIN_INFO=AFmmF2swRgIhAIQraz_zdWZVz9vwUyyBB9K5QypB_EWEsc_Rx83WjCNmAiEApvQg-E8fTqw1pL9zN9gDTKN22_2TSOl7Lq7cIzWr2zk:QUQ3MjNmelRtb1EzNjNscnk2UEZrTkZBQzI5aGZfRWZ1c18yZmVxeXkyNjJQRkNDZEg3eUpEV21iemstWFNoTUpybWZCZC1KX19pNHhRNEJFLWU4UzZHQUExNmNFWVYyb1c1R0ljYnh3ZUFnRk9IczRSRDlDd0puQUVYYkt1SEx4eVNsenVNdkUtVlVFeEhJb19kR2VQdm95TmI4Z1VXbWVR; SID=JQjUJtTY7UFXuR5kdUY6ri1X8a4OTlfiWTAC9Jshq1z3htzCwBYfU6ndCAAULaE3YPKoMw.; __Secure-1PSID=JQjUJtTY7UFXuR5kdUY6ri1X8a4OTlfiWTAC9Jshq1z3htzCUBGT4tx4uvMTDfqbGO1mpw.; __Secure-3PSID=JQjUJtTY7UFXuR5kdUY6ri1X8a4OTlfiWTAC9Jshq1z3htzCDfxu5lphiZVSuOBUYo97aA.; HSID=AIcOpsLqfP1ptA6Gs; SSID=A2fbCMZwMVPQQ9C9d; APISID=QItfrcR2Iva__JgM/AXGikIg8xnITdlKks; SAPISID=swzssEsQqdq2bLD3/A0gdEuiqhy0yyMuYk; __Secure-1PAPISID=swzssEsQqdq2bLD3/A0gdEuiqhy0yyMuYk; __Secure-3PAPISID=swzssEsQqdq2bLD3/A0gdEuiqhy0yyMuYk; SIDCC=AJi4QfF50GVGxwQ1WWt-YRnRwuzdkn8blXK9BmethVZOprvx6A9b3RHX5y0BxDYv-1Px06H5FEc; __Secure-3PSIDCC=AJi4QfEhzm6JuecJt3eC_Qajm6dL08-DeHE2l_ZXsiuYLeJxSnMg-2nzD19p3BbcWJrkiii034w";

// add constants to external command functions
const joinChannel = require("./musicCommands/join");
const skipSong = require('./musicCommands/skip');
const skipTo = require("./musicCommands/skipTo");
const pauseSong = require("./musicCommands/pause");
const resumeSong = require("./musicCommands/resume");
const leaveChannel = require("./musicCommands/leave");
const getQueue = require("./musicCommands/queue");
const songInfo = require("./musicCommands/songInfo");
const shuffle = require("./musicCommands/shuffle");
const remove = require("./musicCommands/remove");
const queueLength = require("./musicCommands/queueLength");
const loopSong = require("./musicCommands/loopSong");
const loopAll = require("./musicCommands/loopAll");
const moveSong = require("./musicCommands/moveSong");

// create variable for the video player function
const videoPlayer = require("./musicCommands/videoPlayer");

/**
 * Plays music in the current voice channel that the user who requested the song is in.
 * 
 * Updates: BeatBuddy can now take song, album, and playlist links from Spotify and SoundCloud
 *
 * @author Robert Wood
 */
module.exports = {
    name: 'play',
    aliases: ['p', 'skip', 'skipto', 'st', 'next', 'pause', 'resume', 'unpause', 'leave', 'stop', 'join', 'queue', 'q', 'songinfo', 'song', 'info', 'i', 'shuffle', 'remove', 'rem', 'qlength', 'queuelength', 'length', 'loop', 'repeat', 'loopAll', 'loopall', 'repeatAll', 'repeatall', 'move', 'm'],
    decription: 'plays the requested song in the voice channel',
    async execute(message, args, cmd, client, Discord) {
        // create songQueue variable for use in external command
        const songQueue = queue.get(message.guild.id);

        // create a variable for the current voice channel
        const voiceChannel = message.member.voice.channel;
        // create the queue
        const serverQueue = queue.get(message.guild.id);

        // FailCases:
        if (!voiceChannel) {
            const embed = new Discord.MessageEmbed()
                .setAuthor("Error")
                .setDescription("You need to enter a voice channel before I can play any music for you")
                .setColor("#0099E1")
            return message.channel.send(embed);
        }

        if (cmd === 'play' || cmd == 'p') {
            // check if no argument given
            if (!args.length) return message.channel.send('After "//play", give me something to play');
        
            // create song object to put in the map
            let song = {};

            // create videos array to hold each song from a playlist
            let videos = [];

            // if the requested song is a YouTube url, pull the song info from the link and set the details for the song
            if (ytdl.validateURL(args[0])) {
                const songInfo = await ytdl.getInfo(args[0], { requestOptions: { headers: { cookie: ytCookie } }, filter: 'audioonly', highWaterMark: 1<<25 });
                console.log(songInfo)
                // set specific song information
                song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url, artist: songInfo.videoDetails.author.name, time: songInfo.videoDetails.lengthSeconds/60, date: songInfo.videoDetails.uploadDate, thumbnail: songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url, requester: message.author.username}
            } 
            else if (ytpl.validateID(args[0])) {  // if link is a YouTube playlist
                // Create playlist collection
                const playlist = ytpl(args[0]);
                // for each video in the playlist
                for (vid in (await playlist).items) {
                    // let plSong be the video
                    let plSong = (await playlist).items[vid];

                    // set specific song information
                    let song = {title: plSong.title, url: plSong.url, artist: plSong.author.name, time: plSong.duration, date: (await playlist).lastUpdated, thumbnail: plSong.thumbnails[0].url, requester: message.author.username};

                    // push the song to the videos array
                    videos.push(song);
                }
            } 
            else if (args[0].includes("https://") && args[0].includes('spotify') && !args[0].includes('playlist') && !args[0].includes('album')) { // Sp.Song

                // retrive the data for the song from the spotify link
                let data = await getPreview(args[0]).then(function(data) {
                    return data;
                });

                // set details of song from spotify
                let date = data.date.replace(/\T.+/, '');
                let title = data.title;
                let artist = data.artist;
                let thumbnail = data.image;

                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }
                
                const video = await videoFinder(data.title + data.artist + "lyrics");
                if (video) {
                    // set specific song information
                    song = { title: title, url: video.url, artist: artist, time: video.duration.timestamp, date: date, thumbnail: thumbnail, requester: message.author.username}
                } else {
                    // if no results, send error message
                    const embed = new Discord.MessageEmbed()
                        .setAuthor("Error")
                        .setDescription("Couldn't find the requested song, try using a YouTube link after //play")
                        .setColor("#0099E1")
                    return message.channel.send(embed);
                }
            } 
            else if (args[0].includes("https://") && args[0].includes('spotify') && !args[0].includes('playlist') && args[0].includes('album')) { 
                try {
                    // get the array of tracks in the spotify playlist
                    const album = await getTracks(args[0]).then(function(data) {
                        return data;
                    });

                    // get the playlist data for the message embed
                    const albumData = await getData(args[0]).then(function(data) {
                        return data;
                    })

                    // get playlist name
                    const albumName = albumData.name;
                    // get playlist thumbnail
                    const albumThumbnail = albumData.images[0].url;
                    // get owner of the playlist
                    const albumArtist = albumData.artists[0].name;

                    // function to handle youtube searches
                    const videoFinder = async (query) => {
                        const videoResult = await ytSearch(query);
                        return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                    }

                    // return a message embed saying that the playlist is being gotten
                    const searching = new Discord.MessageEmbed()
                        .setAuthor(`Retrieving the album ${albumName}`)
                        .setDescription("Please wait: This could take up to a minute...")
                        .setColor("#0099E1")
                    message.channel.send(searching);

                    // loop through each song in the playlist
                    for (const track of album) {
                        const video = await videoFinder(track.name + track.artists[0].name + "lyrics");
                        // if there is a video, create the song object and add its details, then push it to the videos array.
                        if (video) {
                            // set specific song information
                            let song = { title: track.name, url: video.url, artist: track.artists[0].name, time: video.duration.timestamp, date: albumData.release_date, thumbnail: albumData.images[0].url, requester: message.author.username};
                            videos.push(song);
                        }
                    };
                    
                    let str = "";
                    str += `**${albumName}** has been added \n`;

                    // return a message embed saying that the playlist was found
                    const embed = new Discord.MessageEmbed()
                        .setThumbnail(albumThumbnail)
                        .setAuthor("Success!")
                        .setDescription(str + "\n" + "Artist: **" + albumArtist + "**")
                        .setColor("#0099E1")
                    message.channel.send(embed);
                } catch {
                    const embed = new Discord.MessageEmbed()
                        .setAuthor("Failure")
                        .setDescription("Can't play the album.")
                        .setColor("#0099E1")
                    message.channel.send(embed);
                }
            }
            else if (args[0].includes("https://") && args[0].includes('spotify') && args[0].includes('playlist')) { // Sp.Playlist
                const url = args[0];
                try {
                    // get the array of tracks in the spotify playlist
                    const playlist = await getTracks(args[0]).then(function(data) {
                        return data;
                    });

                    // get the playlist data for the message embed
                    const playlistData = await getData(args[0]).then(function(data) {
                        return data;
                    })

                    // get playlist name
                    const playlistName = playlistData.name;
                    // get playlist thumbnail
                    const playlistThumbnail = playlistData.images[0].url;
                    // get owner of the playlist
                    const owner = playlistData.owner.display_name;

                    // function to handle youtube searches
                    const videoFinder = async (query) => {
                        const videoResult = await ytSearch(query);
                        return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                    }

                    // return a message embed saying that the playlist is being gotten
                    const searching = new Discord.MessageEmbed()
                        .setAuthor(`Retrieving the playlist ${playlistName}`)
                        .setDescription("Please wait: This will take 1 - 2 minutes...")
                        .setColor("#0099E1")
                    message.channel.send(searching);

                    // loop through each song in the playlist
                    for (const track of playlist) {
                        const video = await videoFinder(track.name + track.artists[0].name + "lyrics");
                        // if there is a video, create the song object and add its details, then push it to the videos array.
                        if (video) {
                            // set specific song information
                            let song = { title: track.name, url: video.url, artist: track.artists[0].name, time: video.duration.timestamp, date: track.album.release_date, thumbnail: track.album.images[0].url, requester: message.author.username};
                            videos.push(song);
                        }
                    };
                    
                    let str = "";
                    str += `**${playlistName}** has been added \n`;

                    // return a message embed saying that the playlist was found
                    const embed = new Discord.MessageEmbed()
                        .setThumbnail(playlistThumbnail)
                        .setAuthor("Success!")
                        .setDescription(str + "\n" + "Owner: **" + owner + "**")
                        .setColor("#0099E1")
                    message.channel.send(embed);
                } catch {
                    if (url.includes("37")) {
                        const embed = new Discord.MessageEmbed()
                            .setAuthor("Error: Blend Detected")
                            .setDescription("BeatBuddy does not support Spotify Blends.")
                            .setColor("#0099E1")
                        message.channel.send(embed);
                    } else {
                        const embed = new Discord.MessageEmbed()
                            .setAuthor("Error: Couldn't Get Playlist")
                            .setDescription("Try again, and make sure to not send commands until the playlist has been retrieved.")
                            .setColor("#0099E1")
                        message.channel.send(embed);
                    }
                }
            } 
            else if (
                (args[0].includes("https://") && args[0].includes('soundcloud') && args[0].includes('sets') && args[0].includes('?in='))
                 || (args[0].includes("https://") && args[0].includes('soundcloud') && !args[0].includes('sets') && args[0].includes("?")) 
                 || (args[0].includes("https://") && args[0].includes('soundcloud') && !args[0].includes('sets') && !args[0].includes("?"))) { 

                // get the track info
                let pURL = args[0];
                if (args[0].includes("sets") && args[0].includes("?in=")) {
                    pURL = args[0].replace(/\?.+/, '');
                } else if (!args[0].includes("sets") && args[0].includes("?")) {
                    pURL = args[0].replace(/\?.+/, '');
                }
                const track = await scClient.getSongInfo(pURL).then(function(data) {
                    return data;
                });

                const date = (track.publishedAt.toISOString().replace(/\T.+/, ''));

                // set the details for the song that gets pushed
                song = {title: track.title, url: track.url, artist: track.author.name, time: (track.duration/60000).toPrecision(3).replace(".", ":"), date: date, thumbnail: track.thumbnail, requester: message.author.username};

                // push the song to the videos queue
                videos.push(song);
            }
            else if (
                (args[0].includes("https://") && args[0].includes('soundcloud') && args[0].includes('sets') && args[0].includes("?") && !args[0].includes("in=")) 
                || (args[0].includes("https://") && args[0].includes('soundcloud') && args[0].includes('sets') && !args[0].includes("?"))) { 

                let pURL = args[0];
                if (args[0].includes("?")) {
                    pURL = args[0].replace(/\?.+/, '');
                }
                
                const p = (await scdl.playlists.getPlaylist(pURL));
                const pName = p.title;
                const pThumb = p.artwork_url;
                let pThumbnail = "";
                if (pThumb != "") {
                    pThumbnail = pThumb;
                }
                const owner = p.user.username;

                const playlist = scdl.playlists.getPlaylist(pURL);

                // return a message embed saying that the playlist is being gotten
                const searching = new Discord.MessageEmbed()
                    .setAuthor(`Retrieving the playlist/album ${pName}`)
                    .setDescription("This will take a minute or two...")
                    .setColor("#0099E1")
                message.channel.send(searching);

                // loop through each song in the playlist
                for (track in (await playlist).tracks) {
                    let plSong = (await playlist).tracks[track];

                    if (plSong) {
                        let song = {title: plSong.title, url: plSong.permalink_url, artist: plSong.user.username, time: (plSong.duration/60000).toPrecision(3).replace(".", ":"), date: plSong.created_at.replace(/\T.+/, ''), thumbnail: plSong.artwork_url, requester: message.author.username};
                        videos.push(song)
                    }
                }

                // return a message embed saying that the playlist was found
                let str = "";
                str += `**${pName}** has been added \n`;
                const embed = new Discord.MessageEmbed()
                    .setThumbnail(pThumbnail)
                    .setAuthor("Success!")
                    .setDescription(str + "\n" + "Owner: **" + owner + "**")
                    .setColor("#0099E1")
                message.channel.send(embed);
            }
            else {
                // if the song is not a URL, then use keywords to find that song on youtube through a search query.
                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }

                // add the info pulled from youtube to the song variable
                const video = await videoFinder(args.join(' '));
                if (video) {
                    // set specific song information
                    song = { title: video.title, url: video.url, artist: video.author.name, time: video.duration.timestamp, date: "Couldn't retrive date", thumbnail: video.thumbnail, requester: message.author.username};
                    console.log("Found the requested song!");
                } else {
                    // if no results, send error message
                    message.channel.send("Couldn't find the requested song, try using a YouTube link after //play");
                    return;
                }
            }

            // if there is no serverQueue
            if (!serverQueue) {
                // create a new constructor for the queue
                const queueConstructor = {
                    voice_channel: voiceChannel,
                    text_channel: message.channel,
                    connection: null,
                    songs: []
                }
                
                // set values in the map as guild id number and queueConstructor
                queue.set(message.guild.id, queueConstructor);

                // push the song item regardless
                queueConstructor.songs.push(song);
                
                // push playlist items into queue if playlist is requested
                if (ytpl.validateID(args[0])) {
                    for (i = 0; i <= videos.length - 1; i++) {
                        queueConstructor.songs.push(videos[i]);
                    }
                    // remove the undefined push from song info outside of loop
                    queueConstructor.songs.shift();
                } else if (args[0].includes('spotify') && args[0].includes('album')) {
                    for (i = 0; i <= videos.length - 1; i++) {
                        queueConstructor.songs.push(videos[i]);
                    }
                    // remove the undefined push from song info outside of loop
                    queueConstructor.songs.shift();
                } else if (args[0].includes('spotify') && args[0].includes('playlist')) {
                    for (i = 0; i <= videos.length - 1; i++) {
                        queueConstructor.songs.push(videos[i]);
                    }
                    // remove the undefined push from song info outside of loop
                    queueConstructor.songs.shift();
                } else if ((args[0].includes("https://") && args[0].includes('soundcloud') && args[0].includes('sets')) || (args[0].includes("https://") && args[0].includes('soundcloud') && args[0].includes('sets') && !args[0].includes("?"))) {
                    for (i=0; i <= videos.length - 1; i++) {
                        queueConstructor.songs.push(videos[i]);
                    }
                    // remove the undefined push from song info outside of loop
                    queueConstructor.songs.shift();
                }

                try {
                    const connection = await voiceChannel.join();
                    queueConstructor.connection = connection;
                    videoPlayer(message.guild, queueConstructor.songs[0], queue); // add queue variable if it is decided to rework the videoPlayer function.
                } catch {
                    queue.delete(message.guild.id);
                    const embed = new Discord.MessageEmbed()
                        .setAuthor("Error")
                        .setDescription("There was an error connecting")
                        .setColor("#0099E1")
                    message.channel.send(embed);
                    throw err;
                }
                
            } else {
                // push song item regardless
                serverQueue.songs.push(song);

                // if playlist is added after the serverQueue has been made
                if (ytpl.validateID(args[0])) {

                    // get playlist name
                    const playlistName = (await ytpl(args[0])).title;
                    // set playlist thumbnail as server image
                    const playlistThumbnail = message.guild.iconURL();
                    // get index of undefine push of song above for removal
                    const elementToRemove = serverQueue.songs.length-1;
                    // remove the undefined song push from earlier
                    serverQueue.songs.splice(elementToRemove, elementToRemove);

                    // for each video, push it to the serverqueue
                    for (i = 0; i <= videos.length - 1; i++) {
                        serverQueue.songs.push(videos[i]);
                    }

                    // string to set as description in embed
                    let str = "";
                    str += `**Playlist Added To Queue:**\n ${playlistName}`;
                    // create embed show that the playlist was added to the queue
                    const embed = new Discord.MessageEmbed()
                        .setThumbnail(playlistThumbnail)
                        .setDescription(str)
                        .setColor("#0099E1")

                    // return a message embed saying which playlist was added to the queue
                    return message.channel.send(embed);
                } else if (args[0].includes('spotify') && args[0].includes('playlist')) {
                    // get index of undefined song push to remove
                    const remIndex = serverQueue.songs.length-1;

                    // remove the undefined song
                    serverQueue.songs.splice(remIndex, remIndex);

                    // for each song, push it to the serverQueue
                    for (i = 0; i <= videos.length - 1; i++) {
                        serverQueue.songs.push(videos[i]);
                    }
                } else if (args[0].includes('spotify') && args[0].includes('album')) {
                    // get index of undefined song push to remove
                    const remIndex = serverQueue.songs.length-1;

                    // remove the undefined song
                    serverQueue.songs.splice(remIndex, remIndex);

                    // for each song, push it to the serverQueue
                    for (i = 0; i <= videos.length - 1; i++) {
                        serverQueue.songs.push(videos[i]);
                    }
                } else if ((args[0].includes("https://") && args[0].includes('soundcloud') && args[0].includes('sets')) || (args[0].includes("https://") && args[0].includes('soundcloud') && args[0].includes('sets') && !args[0].includes("?"))) {
                    const remIndex = serverQueue.songs.length-1;

                    // remove the undefined song
                    serverQueue.songs.splice(remIndex, remIndex);

                    // for each song, push it to the serverQueue
                    for (i = 0; i <= videos.length - 1; i++) {
                        serverQueue.songs.push(videos[i]);
                    }
                } else {
                    // string to set as description in embed
                    let str = "";
                    str += `**Added to Queue:**\n ${song.title}`;
                    // create embed show that the song was added to the queue
                    const embed = new Discord.MessageEmbed()
                        .setThumbnail(song.thumbnail)
                        .setDescription(str)
                        .setColor("#0099E1")
                    // return a message embed saying which song was added to the queue
                    return message.channel.send(embed);
                }
            }
        } 
        else if (cmd === 'join') joinChannel(message, message.guild, queue);
        else if (cmd === 'skip' || cmd === 'next') skipSong(message, serverQueue);
        else if (cmd === 'skipto' || cmd === 'st') skipTo(message, args, serverQueue, message.guild, songQueue);
        else if (cmd === "pause") pauseSong(message, serverQueue);
        else if (cmd === "resume" || cmd === "unpause") resumeSong(message, serverQueue);
        else if (cmd === 'leave' || cmd === 'stop') leaveChannel(message, serverQueue);
        else if (cmd === 'queue' || cmd === 'q') getQueue(message, message.guild, queue);
        else if (cmd === 'songinfo' || cmd === 'song' || cmd === 'info' || cmd === 'i') songInfo(message, message.guild, queue);
        else if (cmd === 'shuffle') shuffle(message, message.guild, queue);
        else if (cmd === 'remove' || cmd === 'rem') remove(message, args, serverQueue, message.guild, queue);
        else if (cmd === 'qlength' || cmd === 'queuelength' || cmd === 'length') queueLength(message, message.guild, queue);
        else if (cmd === 'loop' || cmd === 'repeat') loopSong (message, message.guild, queue);
        else if (cmd === 'loopAll' || cmd === 'loopall' || cmd === 'repeatAll' || cmd === 'repeatall') loopAll (message, message.guild, queue);
        else if (cmd == 'move' || cmd == 'm') moveSong(message, args, serverQueue, message.guild, queue);
    }
}