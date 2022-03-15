const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const ytpl = require('ytpl');
const Discord = require('discord.js');
const queue = new Map();

/**
 * Plays music in the current voice channel that the user who requested the song is in.
 * 
 * Known Bugs: Crashes if user tries to play a link from anywhere but youtube.
 * 
 * Later Features:
 *      Commands:
 *          // add soundcloud and spotify support.
 *      Permissions:
 *          - add the use of permissions to ensure that nobody runs into errors using the bot.
 * 
 * @author Robert Wood
 */
module.exports = {
    name: 'play',
    aliases: ['p', 'skip', 'next', 'pause', 'resume', 'unpause', 'leave', 'stop', 'join', 'queue', 'q', 'songinfo', 'song', 'info', 'i', 'shuffle'],
    decription: 'plays the requested song in the voice channel',
    async execute(message, args, cmd, client, Discord) {

        // create a variable for the current voice channel
        const voiceChannel = message.member.voice.channel;
        // create the queue
        const serverQueue = queue.get(message.guild.id);

        // FailCases:
        if (!voiceChannel) {
            console.log('Nobody in the voice channel');
            return message.channel.send("You need to enter a voice channel before I can play any music for you");
        }
        // // PERMISSIONS ARE NOT NECCESSARY FOR THE PROTOTYPE
        // // create a variable for the permissions
        // const permissions = voiceChannel.permissions(message.client.user);
        // // if the bot does not have specific permissions
        // if (!permissions.has('CONNECT')){
        //     return message.channel.send('You do not have connection permissions enabled for me');
        // }
        // if (!permissions.has('SPEAK')) {
        //     return message.channel.send('You do not have speaking permissions enabled for me');
        // }

        if (cmd === 'play' || cmd == 'p') {
            // check if no argument given
            if (!args.length) return message.channel.send('After "//play", give me something to play');
        
            // create song object to put in the map
            let song = {};

            // create videos array to hold each song from a playlist
            let videos = [];

            // if the requested song is a url, pull the song info from the link and set the details for the song
            if (ytdl.validateURL(args[0])) {
                console.log("Song")
                const songInfo = await ytdl.getInfo(args[0]);
                // set specific song information
                song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url, artist: songInfo.videoDetails.author.name, time: songInfo.videoDetails.lengthSeconds/60, date: songInfo.videoDetails.uploadDate, thumbnail: songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url, requester: message.author.username}
            } 
            else if (ytpl.validateID(args[0])) {  // if link is a playlist
                
                // Create playlist collection
                const playlist = ytpl(args[0]);
                console.log("Got playlist");
                // for each video in the playlist
                for (vid in (await playlist).items) {
                    // let plSong be the video
                    let plSong = (await playlist).items[vid];

                    // set specific song information
                    let song = {title: plSong.title, url: plSong.url, artist: plSong.author.name, time: plSong.duration, date: (await playlist).lastUpdated, thumbnail: plSong.thumbnails[0].url, requester: message.author.username};

                    // push the song to the videos array
                    videos.push(song);
                }
                console.log("Added songs from playlist");
            } 
            else {
                // if the song is not a URL, then use keywords to find that song on youtube.
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
                }

                try {
                    const connection = await voiceChannel.join();
                    queueConstructor.connection = connection;
                    videoPlayer(message.guild, queueConstructor.songs[0], message);
                } catch {
                    queue.delete(message.guild.id);
                    message.channel.send("There was an error connecting");
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
                        .setDescription(str);

                    // return a message embed saying which playlist was added to the queue
                    return message.channel.send(embed);
                }
                
                // string to set as description in embed
                let str = "";
                str += `**Added to Queue:**\n ${song.title}`;
                // create embed show that the song was added to the queue
                const embed = new Discord.MessageEmbed()
                    .setThumbnail(song.thumbnail)
                    .setDescription(str);

                // return a message embed saying which song was added to the queue
                return message.channel.send(embed);
            }
        } 
        else if (cmd === 'join') joinChannel(message, message.guild);
        else if (cmd === 'skip' || cmd === 'next') skipSong(message, serverQueue);
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
        songQueue.text_channel.send("No more songs in the queue.");
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
        .setDescription(str);

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
    if (songQueue) return message.channel.send("Already in the voice channel");
    message.channel.send("Joining the channel");
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
    if (!message.member.voice.channel) return message.channel.send("Must be in the voice channel to skip a song");
    if (!serverQueue) {
        return message.channel.send("There are no songs in the queue");
    }
    message.channel.send("Skipping the current song...");
    // end the dispatcher to skip the song currently playing
    try {
        serverQueue.connection.dispatcher.end();
    } catch (err) {
        message.channel.send("An error occured while trying to execute the command.")
    }
}

/**
 * Pauses the song if the command requested if //pause
 * 
 * FULLY FUNCTIONAL
 */
 const pauseSong = (message, serverQueue) => {
    if (!serverQueue) return message.channel.send("Nothing to pause");
    if (serverQueue.connection.dispatcher.paused) return message.channel.send("Song is already paused!"); // Checks if the song is already paused.
    // Sends a message to the channel the command was used in while trying to pause
    message.channel.send("Attempting to pause the song...");
    // If the song isn't paused this will pause it.
    serverQueue.connection.dispatcher.pause();
    // Sends a message to the channel the command was used in after it pauses
    message.channel.send("Song paused!");
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
    if(!serverQueue) return message.channel.send("Nothing to unpause");
    message.channel.send("Attemping to resume the song...")
    uglyResumeMethod(serverQueue); // If the song is paused this will unpause it.
    message.channel.send("Song resumed!"); // Sends a message to the channel the command was used in after it unpauses.
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
    if (!userVoiceChannel) return message.channel.send("I can't leave a channel if I'm not in one");
    if (serverQueue) {
        // empties the queue
        serverQueue.songs = [];
        // ends dispatcher to disconnect from channel after emptying the queue
        if (serverQueue.connection.dispatcher) {
            serverQueue.connection.dispatcher.end();
        } else {
            userVoiceChannel.leave();
        }
        return message.channel.send("Left the voice channel.");
    }
    userVoiceChannel.leave();
    message.channel.send("Left the voice channel.")
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
        message.channel.send("No songs in the queue");
        return;
    }

    let index = 1;
    let str = "";

    // for the song currently playing
    if (songQueue.songs[0]) str += `**Currently playing:**\n ${songQueue.songs[0].title}\n\n`;

    // for next ten songs after the first one
    if (songQueue.songs[1]) str += `**Next Songs In Queue:**\n ${songQueue.songs.slice(1, 11).map(x => `**${index++})** ${x.title}\n Requested by: **${x.requester}**`).join("\n\n")}`;


    // create embed to hold current song plus the next ten after it
    const embed = new Discord.MessageEmbed()
        .setAuthor(`${message.guild.name}'s Queue`)
        .setThumbnail(songQueue.songs[0].thumbnail)
        .setDescription(str);

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
        message.channel.send("No songs in the queue");
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
        .setDescription("**Artist:** " + artist + "\n**Length:** " + time + "\n**Date Published:** " + date);

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
        message.channel.send("There are no songs to shuffle");
        return;
    }

    // if only song in queue is playing
    if (songQueue.songs.length === 1) {
        message.channel.send("Error: No songs in the queue");
        return;
    } 
    
    // if one song is playing and there is only one in the queue
    if (songQueue.songs.length === 2) {
        message.channel.send("Error: One song playing and one in the queue");
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
    return message.channel.send("Queue shuffled");
}