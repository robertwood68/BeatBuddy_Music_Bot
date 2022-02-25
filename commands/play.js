const ytdl = require('ytdl-core');
const playdl = require('play-dl');
const ytSearch = require('yt-search');
const queue = new Map();
/**
 * Plays music in the current voice channel that the user who requested the song is in.
 * 
 * @author Robert Wood
 */
module.exports = {
    name: 'play',
    aliases: ['skip', 'pause', 'resume', 'leave', 'join', 'stop'],
    decription: 'plays the requested song in the voice channel',
    async execute(message, args, cmd, client, Discord) {

        // create a variable for the current voice channel
        const voiceChannel = message.member.voice.channel;
        // create the queue
        const serverQueue = queue.get(message.guild.id);
        // create a variable for the permissions
        // const permissions = voiceChannel.permissions(message.client.user);

        // FailCases:
        if (!voiceChannel) {
            console.log('Nobody in the voice channel');
            return message.channel.send("You need to enter a voice channel before I can play any music for you");
        }
        // PERMISSIONS ARE ONT NECCESSARY FOR THE PROTOTYPE
        // // if the bot does not have specific permissions
        // if (!permissions.has('CONNECT')){
        //     return message.channel.send('You do not have connection permissions enabled for me');
        // }
        // if (!permissions.has('SPEAK')) {
        //     return message.channel.send('You do not have speaking permissions enabled for me');
        // }

        if (cmd === 'play') {
            if (!args.length) return message.channel.send('After "//play", give me something to play');
            // create song object to put in the map
            let song = {};

            // if the requestes song is a url, pull the song info from the link and set the details for the song
            if (ytdl.validateURL(args[0])) {
                const songInfo = await ytdl.getInfo(args[0]);
                song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url}
            } else {
                // if the song is not a URL, then use keywords to find that song on youtube.
                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }

                // add the info pulled from youtube to the song variable
                const video = await videoFinder(args.join(' '));
                if (video) {
                    song = { title: video.title, url: video.url}
                } else {
                    // if no results, send error message
                    message.channel.send("Couldn't find the requested song");
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
                // push the song info obtained in the queue
                queueConstructor.songs.push(song);
    
                try {
                    const connection = await voiceChannel.join();
                    queueConstructor.connection = connection;
                    videoPlayer(message.guild, queueConstructor.songs[0]);
                } catch {
                    queue.delete(message.guild.id);
                    message.channel.send("There was an error connecting");
                    throw err;
                }
            } else {
                serverQueue.songs.push(song);
                return message.channel.send(` ${song.title} has been added to the queue`);
            }
        } else if (cmd === 'skip') {
            skipSong(message, serverQueue);
        } else if (cmd === 'leave') {
            leaveChannel(message, serverQueue);
        } else if (cmd === "pause"){
            pauseSong(message, serverQueue);
        } else if (cmd === "resume"){
            resumeSong(message, serverQueue);
        }
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
        songQueue.voice_channel.leave();
        queue.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, { filter: 'audioonly'});
    songQueue.connection.play(stream, { seek: 0, volume: 0.5}) // highWaterMark fixed the lag and the random dispacher stopping
    .on('finish', () => {
        songQueue.songs.shift();
        videoPlayer(guild, songQueue.songs[0]);
    });
    await songQueue.text_channel.send(` Now playing ${song.title}`);
}

// /**
//  * Joins the user's voice channel without playing any music
//  * 
//  * FULLY FUNCTIONAL
//  * 
//  * @returns 
//  */
// const joinChannel = async (message, guild) => {
//     const songQueue = queue.get(guild.id);
//     message.channel.send("Joining the channel");
//     songQueue.voice_channel.join();
//     return;
// }

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
    serverQueue.connection.dispatcher.end();
}

/**
 * Stops the videoplayer if the command requested is //stop
 * 
 * FULLY FUNCTIONAL
 * 
 * @returns an arror message or leaves the channel
 */
const leaveChannel = (message, serverQueue) => {
    if (!message.member.voice.channel) return message.channel.send("Must be in the voice channel to leave it");
    if (serverQueue) {
        message.channel.send("Ending the queue and leaving the channel...");
        // empties the queue
        serverQueue.songs = [];
        // ends dispatcher to disconnect from channel after emptying the queue
        if (serverQueue.connection.dispatcher) {
            serverQueue.connection.dispatcher.end();
        }
        message.channel.send("Queue emptied and voice channel left.");
    } else {
        return message.channel.send("There's nothing to stop");
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
 * Unpauses the song if the command requested if //resume
 * 
 * FULLY FUNCTIONAL
 */
 const resumeSong = (message, serverQueue) => {
    if(!serverQueue) return message.channel.send("Nothing to unpause");
    message.channel.send("Attemping to resume the song...")
    fuckedUpResume(serverQueue); // If the song is paused this will unpause it.
    message.channel.send("Song resumed!"); // Sends a message to the channel the command was used in after it unpauses.
}

/**
 * Handles the resume statement as its own function becuase of the connection.dispatcher.resume() is buggy in the newest version of node.js.
 */
const fuckedUpResume = (serverQueue) => {
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