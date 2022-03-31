const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const ytpl = require('ytpl');
const Discord = require('discord.js');
const fetch = require('isomorphic-unfetch');
const { getData, getPreview, getTracks } = require('spotify-url-info')(fetch);
const queue = new Map();

/**
 * Plays music in the current voice channel that the user who requested the song is in.
 * 
 * Known Bugs: Takes a little to load a spotify playlist.
 * 
 * Later Features:
 *      Commands:
 *          // add spotify support (DONE)
 *          // add soundcloud support
 *          // add skipTo command (DONE)
 *          // add option to select song from youtube search
 * 
 * @author Robert Wood
 */
module.exports = {
    name: 'play',
    aliases: ['p', 'skip', 'skipto', 'st', 'next', 'pause', 'resume', 'unpause', 'leave', 'stop', 'join', 'queue', 'q', 'songinfo', 'song', 'info', 'i', 'shuffle'],
    decription: 'plays the requested song in the voice channel',
    async execute(message, args, cmd, client, Discord) {

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
                console.log("Song from YouTube")
                const songInfo = await ytdl.getInfo(args[0]);
                // set specific song information
                song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url, artist: songInfo.videoDetails.author.name, time: songInfo.videoDetails.lengthSeconds/60, date: songInfo.videoDetails.uploadDate, thumbnail: songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url, requester: message.author.username}
            } 
            else if (ytpl.validateID(args[0])) {  // if link is a YouTube playlist
                console.log("YouTube Playlist");
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
            else if (args[0].includes("https://") && args[0].includes('spotify') && !args[0].includes('playlist')) { // Sp.Song
                console.log("Song from Spotify");
                // retrive the data for the song from the spotify link
                let data = await getPreview(args[0]).then(function(data) {
                    return data;
                });

                // set details of song from spotify
                let date = data.date;
                let title = data.title;
                let artist = data.artist;
                let thumbnail = data.image;

                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }
                
                const video = await videoFinder(data.title + data.artist + "spotify");
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
            else if (args[0].includes("https://") && args[0].includes('spotify') && args[0].includes('playlist')) { // Sp.Playlist
                console.log("Spotify Playlist")
                // get the array of tracks in the spotify playlist
                const playlist = await getTracks(args[0]).then(function(data) {
                    return data;
                });

                // function to handle youtube searches
                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }

                // return a message embed saying that the playlist is being gotten
                const searching = new Discord.MessageEmbed()
                    .setAuthor("Retrieving your Spotify playlist")
                    .setDescription("This will take a minute or two...")
                    .setColor("#0099E1")
                message.channel.send(searching);

                // loop through each song in the playlist
                for (const track of playlist) {
                    const video = await videoFinder(track.name + track.artists[0].name + "spotify");

                    // if there is a video, create the song object and add its details, then push it to the videos array.
                    if (video) {
                        // set specific song information
                        let song = { title: track.name, url: video.url, artist: track.artists[0].name, time: video.duration.timestamp, date: track.album.release_date, thumbnail: track.album.images[0].url, requester: message.author.username};
                        videos.push(song);
                    }
                };

                // return a message embed saying that the playlist was found
                const success = new Discord.MessageEmbed()
                    .setAuthor("Got it!")
                    .setColor("#0099E1")
                message.channel.send(success);
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
                    song = { title: video.title, url: video.url, artist: video.author.name, time: video.duration.timestamp, date: "Couldn't retrive date", thumbnail: video.thumbnail, requester: message.author.username}
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
                    for (i = 0; i < videos.length - 1; i++) {
                        queueConstructor.songs.push(videos[i]);
                    }
                    // remove the undefined push from song info outside of loop
                    queueConstructor.songs.shift();
                } else if (args[0].includes('spotify') && args[0].includes('playlist')) {
                    for (i = 0; i < videos.length - 1; i++) {
                        queueConstructor.songs.push(videos[i]);
                    }
                    // remove the undefined push from song info outside of loop
                    queueConstructor.songs.shift();
                }

                try {
                    const connection = await voiceChannel.join();
                    queueConstructor.connection = connection;
                    videoPlayer(message.guild, queueConstructor.songs[0], message);
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

                    // for each video, push it to the serverqueue
                    for (i = 0; i < videos.length - 1; i++) {
                        serverQueue.songs.push(videos[i]);
                    }

                    // remove the undefined song push from earlier
                    serverQueue.songs.splice(elementToRemove, elementToRemove);

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
                    // get the array of tracks in the spotify playlist
                    const playlist = await getData(args[0]).then(function(data) {
                        return data;
                    });

                    // get playlist name
                    const playlistName = playlist.name;
                    // get playlist thumbnail
                    const playlistThumbnail = playlist.images[0].url;
                    // get owner of the playlist
                    const owner = playlist.owner.display_name;
                    // get index of undefined song push to remove
                    const remIndex = serverQueue.songs.length-1;

                    // for each song, push it to the serverQueue
                    for (i = 0; i < videos.length - 1; i++) {
                        serverQueue.songs.push(videos[i]);
                    }

                    // remove the undefined song
                    serverQueue.songs.splice(remIndex, remIndex);

                    // string to set as description in embed
                    let str = "";
                    str += `**Playlist Added To Queue:**\n ${playlistName}`;

                    // create embed show that the playlist was added to the queue
                    const embed = new Discord.MessageEmbed()
                        .setThumbnail(playlistThumbnail)
                        .setDescription(str + "\n" + "Owner: " + owner)
                        .setColor("#0099E1")

                    // return a message embed saying which playlist was added to the queue
                    return message.channel.send(embed);
                }
                
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
        else if (cmd === 'join') joinChannel(message, message.guild);
        else if (cmd === 'skip' || cmd === 'next') skipSong(message, serverQueue);
        else if (cmd === 'skipto' || cmd === 'st') skipTo(message, args, serverQueue, message.guild);
        else if (cmd === "pause") pauseSong(message, serverQueue);
        else if (cmd === "resume" || cmd === "unpause") resumeSong(message, serverQueue);
        else if (cmd === 'leave' || cmd === 'stop') leaveChannel(message, serverQueue);
        else if (cmd === 'queue' || cmd === 'q') getQueue(message, message.guild);
        else if (cmd === 'songinfo' || cmd === 'song' || cmd === 'info' || cmd === 'i') songInfo(message, message.guild);
        else if (cmd === 'shuffle') shuffle(message, message.guild);
    }
}

/**
 * Configures the options for the music and plays the music in the voice channel.
 * 
 * FULLY FUNCTONAL
 * 
 * @returns null if no song, or "Now playing ${song.title}" if the song is detected and found.
 */
const videoPlayer = async (guild, song) => {
    const songQueue = queue.get(guild.id);

    if (!song) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("No more songs in the queue.")
            .setColor("#0099E1")
        songQueue.text_channel.send(embed);
        songQueue.voice_channel.leave();
        queue.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, { filter: 'audioonly', highWaterMark: 1<<25}); // highWaterMark fixed the lag and the random dispacher stopping
    songQueue.connection.play(stream, { seek: 0, volume: 0.5 })
    .on('finish', () => {
        songQueue.songs.shift();
        videoPlayer(guild, songQueue.songs[0]);
    });

    // string to set as description in embed
    let str = "";
    str += `**Now Playing:**\n ${song.title}`;

    // create embed to hold current song
    const embed = new Discord.MessageEmbed()
        .setThumbnail(song.thumbnail)
        .setDescription(str)
        .setColor("#0099E1")

    // return now playing embed
    await songQueue.text_channel.send(embed);
}

/**
 * Joins the user's voice channel without playing any music
 * 
 * FULLY FUNCTIONAL
 *
 * @returns an error message if the bot is already in a voice channel.
 */
 const joinChannel = async (message, guild) => {
    const songQueue = queue.get(guild.id);

    if (songQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Already in the voice channel")
            .setColor("#0099E1")
        return message.channel.send(embed);
    } 

    const embed = new Discord.MessageEmbed()
        .setAuthor("Joining the channel")
        .setColor("#0099E1")
    message.channel.send(embed);
    message.member.voice.channel.join();
}

/**
 * Skips from the current song to the next if the command requested is //skip
 * 
 * FULLY FUNCTIONAL
 * 
 * @returns error message or ends the current song
 */
const skipSong = (message, serverQueue) => {
    if (!message.member.voice.channel) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Must be in the voice channel to skip a song")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    if (!serverQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("There are no songs in the queue")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    const embed = new Discord.MessageEmbed()
            .setAuthor("Skipping the current song...")
            .setColor("#0099E1")
    message.channel.send(embed);

    // end the dispatcher to skip the song currently playing
    try {
        serverQueue.connection.dispatcher.end();
    } catch (err) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("Couldn't execute the command")
            .setColor("#0099E1")
        message.channel.send(embed);
    }
}

/**
 * Skips from the current song to the song requested by number.
 * 
 * FULLY FUNCTIONAL
 * 
 * @returns error message or skips to requested index in queue
 */
 const skipTo = (message, args, serverQueue, guild) => {
    // if no number is given
    if (!args[0]) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("Try //skipto (integer)")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    // if the user tries to clear a number of messages that isn't real
    if (isNaN(args[0])) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("Try //skipto (integer)")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    // if the user tries to delete more than 100 messages
    if (args[0] > serverQueue.songs.length - 1) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("There is no song at index " + args[0])
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    // if the user tries to delete less than 1 message
    if (args[0] < 1) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("There is no song at index " + args[0])
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    // if user is not in the voice channel
    if (!message.member.voice.channel) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Must be in the voice channel to skip to a song")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    // if there is no queue
    if (!serverQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("There are no songs in the queue")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }

    const songQueue = queue.get(guild.id);
    const embed = new Discord.MessageEmbed()
            .setAuthor("Skipping to...")
            .setDescription(args[0] + ": " + songQueue.songs[args[0]-1].title)
            .setColor("#0099E1")   
    message.channel.send(embed);

    // end dispatcher and shift queue until queue reaches the song
    for (i=0; i < args[0] - 1; i++) {
        serverQueue.connection.dispatcher.end();
        songQueue.songs.shift();
    }
}

/**
 * Pauses the song if the command requested if //pause
 * 
 * FULLY FUNCTIONAL
 */
 const pauseSong = (message, serverQueue) => {
    if (!serverQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("There is nothing to pause")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    if (serverQueue.connection.dispatcher.paused) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("The song is already paused")
            .setColor("#0099E1")
        return message.channel.send(embed); // Checks if the song is already paused.
    }
    // Sends a message to the channel the command was used in while trying to pause
    const embed = new Discord.MessageEmbed()
            .setAuthor("Attempting to pause the song...")
            .setColor("#0099E1")
    message.channel.send(embed);
    // If the song isn't paused this will pause it.
    serverQueue.connection.dispatcher.pause();
    // Sends a message to the channel the command was used in after it pauses
    const embed1 = new Discord.MessageEmbed()
            .setAuthor("Song paused!")
            .setColor("#0099E1")
    message.channel.send(embed1);
}

/**
 * Handles the resume statement as its own function becuase of the connection.dispatcher.resume() is buggy in the newest version of node.js.
 * 
 * FULLY FUNCTIONAL
 */
 const uglyResumeMethod = (serverQueue) => {
    // In order to have one command, the order of commands must be exactly this --> pause, resume, resume, pause, resume, resume.
    serverQueue.connection.dispatcher.pause(true);
    serverQueue.connection.dispatcher.resume();
    serverQueue.connection.dispatcher.resume();
    serverQueue.connection.dispatcher.pause(true);
    serverQueue.connection.dispatcher.resume();
    serverQueue.connection.dispatcher.resume();
    // Unfortunately, all of these statements are neccessary as the newest release of
    // discord.js has a very buggy version of dispatcher.resume().  By using these 
    // statements, the users only need to command //resume once to unpause the song
    // instead of twice.
}

/**
 * Unpauses the song if the command requested if //resume
 * 
 * FULLY FUNCTIONAL
 */
 const resumeSong = (message, serverQueue) => {
    if(!serverQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("There is nothing to unpause")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    const embed = new Discord.MessageEmbed()
            .setAuthor("Attempting to resume the song...")
            .setColor("#0099E1")
    message.channel.send(embed);
    uglyResumeMethod(serverQueue); // If the song is paused this will unpause it.
    const embed1 = new Discord.MessageEmbed()
            .setAuthor("Song resumed!")
            .setColor("#0099E1")
    message.channel.send(embed1); // Sends a message to the channel the command was used in after it unpauses.
}

/**
 * Stops the videoplayer if the command requested is //stop
 * 
 * FULLY FUNCTIONAL
 * 
 * @returns an arror message or leaves the channel
 */
const leaveChannel = (message, serverQueue) => {
    const userVoiceChannel = message.member.voice.channel;
    if (!userVoiceChannel) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("I'm not in a voice channel")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    if (serverQueue) {
        // empties the queue
        serverQueue.songs = [];
        // ends dispatcher to disconnect from channel after emptying the queue
        if (serverQueue.connection.dispatcher) {
            serverQueue.connection.dispatcher.end();
        } else {
            userVoiceChannel.leave();
        }
        const embed = new Discord.MessageEmbed()
            .setAuthor("Left the voice channel")
            .setColor("#0099E1")
        return message.channel.send(embed);
    }
    userVoiceChannel.leave();
    const embed = new Discord.MessageEmbed()
            .setAuthor("Left the voice channel")
            .setColor("#0099E1")
    message.channel.send(embed);
}

/**
 * Outputs the current song and the next ten songs following it as an embed.
 * 
 * Milestone 3: FULLY FUNCTIONAL 
 */
const getQueue = (message, guild) => {
    const songQueue = queue.get(guild.id);

    // checks if queue doesn't exist
    if (!songQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("There are no songs in the queue")
            .setColor("#0099E1")
        message.channel.send(embed);
        return;
    }

    let index = 1;
    let str = "";

    // for the song currently playing
    if (songQueue.songs[0]) str += `**Currently playing:**\n ${songQueue.songs[0].title}\n\n`;

    // for next ten songs after the first one
    if (songQueue.songs[1]) str += `**Next Songs In Queue:**\n ${songQueue.songs.slice(1, 11).map(x => `**${index++})** ${x.title}\n Artist: **${x.artist}** \n Requested by: **${x.requester}**`).join("\n\n")}`;


    // create embed to hold current song plus the next ten after it
    const embed = new Discord.MessageEmbed()
        .setAuthor(`${message.guild.name}'s Queue`)
        .setThumbnail(songQueue.songs[0].thumbnail)
        .setDescription(str)
        .setColor("#0099E1")

    // return a message embed containing the queue
    return message.channel.send(embed);
}

/**
 * Outputs song info for the current track
 * 
 * Milestone 3: FULLY FUNCTIONAL
 */
const songInfo = (message, guild) => {
    const songQueue = queue.get(guild.id);
    
    // check if song queue doesn't exist
    if (!songQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("There are no songs in the queue")
            .setColor("#0099E1")
        message.channel.send(embed);
        return;
    }

    // Works correctly
    const title = songQueue.songs[0].title;
    const artist = songQueue.songs[0].artist;
    const time = songQueue.songs[0].time;
    const date = songQueue.songs[0].date;

    // create embed to hold current song plus the next ten after it
    const embed = new Discord.MessageEmbed()
        .setAuthor(title)
        .setThumbnail(songQueue.songs[0].thumbnail)
        .setDescription("**Artist:** " + artist + "\n**Length:** " + time + "\n**Date Published:** " + date)
        .setColor("#0099E1")

    // return a message embed containing the queue
    return message.channel.send(embed);
}

/**
 * Shuffles the song queue
 * 
 * MILESTONE 3: FULLY FUNCTIONAL
 * 
 * @returns null
 */
const shuffle = (message, guild) => {
    const songQueue = queue.get(guild.id);

    // check is song queue doesn't exist
    if (!songQueue) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("There is no queue to shuffle")
            .setColor("#0099E1")
        message.channel.send(embed);
        return;
    }

    // if only song in queue is playing
    if (songQueue.songs.length === 1) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("There are no songs in the queue")
            .setColor("#0099E1")
        message.channel.send(embed);
        return;
    } 
    
    // if one song is playing and there is only one in the queue
    if (songQueue.songs.length === 2) {
        const embed = new Discord.MessageEmbed()
            .setAuthor("Error")
            .setDescription("There is one song playing and only one in the queue")
            .setColor("#0099E1")
        message.channel.send(embed);
        return;
    } 
    
    // if queue exists and more than one song is in the queue
    for (let i = songQueue.songs.length - 1; i > 0; i--) {
        // create element to switch the one at i with
        const j = Math.floor(Math.random() * (i + 1));
        // prevents the switching of the song currently playing
        if (j == 0) {
            // create variable k for element 1
            const k = j + 1;
            // switch elements at i and k
            [songQueue.songs[i], songQueue.songs[k]] = [songQueue.songs[k], songQueue.songs[i]];
        } else {
            // switch elements at i and j
            [songQueue.songs[i], songQueue.songs[j]] = [songQueue.songs[j], songQueue.songs[i]];
        }
    }
    const embed = new Discord.MessageEmbed()
            .setAuthor("Success!")
            .setDescription("Queue has been shuffled")
            .setColor("#0099E1")
    return message.channel.send(embed);
}