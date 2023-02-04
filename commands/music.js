// const client = require("../index");

// add constants to external command functions
const joinChannel = require("../command/musicCommands/join");
// const skipSong = require('./skip');
const skipTo = require("../command/musicCommands/skipTo");
const pauseSong = require("../command/musicCommands/pause");
const resumeSong = require("../command/musicCommands/resume");
const leaveChannel = require("../command/musicCommands/leave");
const getQueue = require("../command/musicCommands/queue");
const songInfo = require("../command/musicCommands/songInfo");
const shuffle = require("../command/musicCommands/shuffle");
const remove = require("../command/musicCommands/remove");
const queueLength = require("../command/musicCommands/queueLength");
const loopSong = require("../command/musicCommands/loopSong");
const loopAll = require("../command/musicCommands/loopAll");
const moveSong = require("../command/musicCommands/moveSong");

// create variable for the video player function

/**
 * Plays music in the current voice channel that the user who requested the song is in.
 *
 * @author Robert Wood
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const discordVoice = require('@discordjs/voice');
const videoPlayer = require("../videoPlayer/videoPlayer");
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const ytpl = require('ytpl');
const Discord = require('discord.js');
const fetch = require('isomorphic-unfetch');
const soundcloud = require('soundcloud-scraper');
const { SoundCloud } = require("scdl-core");
const scdl = new SoundCloud();
const scClient = new soundcloud.Client(process.env.SOUNDCLOUD_API_KEY);
const { getData, getPreview, getTracks } = require('spotify-url-info')(fetch);
const queue = new Map();
const ytCookie = "YSC=xrOrLy_mswk; VISITOR_INFO1_LIVE=fTo0vURBlEQ; wide=0; PREF=f4=4000000&tz=America.New_York&f6=40000000&f5=30000; LOGIN_INFO=AFmmF2swRgIhAIQraz_zdWZVz9vwUyyBB9K5QypB_EWEsc_Rx83WjCNmAiEApvQg-E8fTqw1pL9zN9gDTKN22_2TSOl7Lq7cIzWr2zk:QUQ3MjNmelRtb1EzNjNscnk2UEZrTkZBQzI5aGZfRWZ1c18yZmVxeXkyNjJQRkNDZEg3eUpEV21iemstWFNoTUpybWZCZC1KX19pNHhRNEJFLWU4UzZHQUExNmNFWVYyb1c1R0ljYnh3ZUFnRk9IczRSRDlDd0puQUVYYkt1SEx4eVNsenVNdkUtVlVFeEhJb19kR2VQdm95TmI4Z1VXbWVR; SID=JQjUJtTY7UFXuR5kdUY6ri1X8a4OTlfiWTAC9Jshq1z3htzCwBYfU6ndCAAULaE3YPKoMw.; __Secure-1PSID=JQjUJtTY7UFXuR5kdUY6ri1X8a4OTlfiWTAC9Jshq1z3htzCUBGT4tx4uvMTDfqbGO1mpw.; __Secure-3PSID=JQjUJtTY7UFXuR5kdUY6ri1X8a4OTlfiWTAC9Jshq1z3htzCDfxu5lphiZVSuOBUYo97aA.; HSID=AIcOpsLqfP1ptA6Gs; SSID=A2fbCMZwMVPQQ9C9d; APISID=QItfrcR2Iva__JgM/AXGikIg8xnITdlKks; SAPISID=swzssEsQqdq2bLD3/A0gdEuiqhy0yyMuYk; __Secure-1PAPISID=swzssEsQqdq2bLD3/A0gdEuiqhy0yyMuYk; __Secure-3PAPISID=swzssEsQqdq2bLD3/A0gdEuiqhy0yyMuYk; SIDCC=AJi4QfF50GVGxwQ1WWt-YRnRwuzdkn8blXK9BmethVZOprvx6A9b3RHX5y0BxDYv-1Px06H5FEc; __Secure-3PSIDCC=AJi4QfEhzm6JuecJt3eC_Qajm6dL08-DeHE2l_ZXsiuYLeJxSnMg-2nzD19p3BbcWJrkiii034w";
module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays the requested song in the voice channel or adds it to the queue')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages, PermissionFlagsBits.Connect, PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        .addStringOption(options => options
            .setName('link-or-keywords')
            .setDescription('Provide a song link, playlist link or keywords for a youtube search')
            .setRequired(true)
        ),
    async execute(client, interaction) {
        // create songQueue variable for use in external command
        const message = interaction;
        const songQueue = queue.get(interaction.guild.id);

        // create a variable for the current voice channel
        let voiceChannel = interaction.member.voice.channelId;
        let txtchannel = interaction.channel;


        // create the queue
        const serverQueue = queue.get(interaction.guild.id);

        // song or link requested
        const input = interaction.options.getString('link-or-keywords');

        // FailCases:
        if (!voiceChannel) {
            // create embed to hold current song
            const responseEmbed = new EmbedBuilder()
                .setAuthor({name: "Error"})
                .setColor("#0099E1")
                .setDescription("You need to enter a voice channel");

            // return embed
            return await interaction.reply({embeds: [responseEmbed]});
        }

        // create embed to hold current song
        const responseEmbed = new EmbedBuilder()
            .setColor("#0099E1")
            .setDescription("Searching...");

        // return embed
        await interaction.reply({embeds: [responseEmbed], ephemeral: true});

        // Listener that clears the queue if manually disconnected by user.
        client.on('voiceStateUpdate', (oldState, newState) => {
            // check if someone connects or disconnects, and check if the bot is disconnecting
            if (oldState.channelID === null || typeof oldState.channelID == 'undefined' || newState.id !== client.user.id) return;
            return queue.delete(oldState.guild.id);
        });

        // create song object to put in the map
        let song = {};

        // create videos array to hold each song from a playlist
        let videos = [];

        // if the requested song is a YouTube url, pull the song info from the link and set the details for the song
        if (ytdl.validateURL(input)) {
            const songInfo = await ytdl.getInfo(input, { requestOptions: { headers: { cookie: ytCookie } }, filter: 'audioonly', highWaterMark: 1<<25 });
            // set specific song information
            song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url, artist: songInfo.videoDetails.author.name, time: songInfo.videoDetails.lengthSeconds/60, date: songInfo.videoDetails.uploadDate, thumbnail: songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url, requester: interaction.user.username}
        } 
        else if (ytpl.validateID(input)) {  // if link is a YouTube playlist
            // Create playlist collection
            const playlist = ytpl(input);
            // for each video in the playlist
            for (vid in (await playlist).items) {
                // let plSong be the video
                let plSong = (await playlist).items[vid];

                // set specific song information
                let song = {title: plSong.title, url: plSong.url, artist: plSong.author.name, time: plSong.duration, date: (await playlist).lastUpdated, thumbnail: plSong.thumbnails[0].url, requester: interaction.user.username};

                // push the song to the videos array
                videos.push(song);
            }
        } 
        else if (input.includes("https://") && input.includes('spotify') && !input.includes('playlist') && !input.includes('album')) { // Sp.Song

            // retrive the data for the song from the spotify link
            let data = await getPreview(input).then(function(data) {
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
                song = { title: title, url: video.url, artist: artist, time: video.duration.timestamp, date: date, thumbnail: thumbnail, requester: interaction.user.username}
            } else {
                // if no results, send error message
                const responseEmbed = new EmbedBuilder()
                    .setAuthor({name: "Error"})
                    .setColor("#0099E1")
                    .setDescription("Couldn't find the requested song");

                // return embed
                return await interaction.send({embeds: [responseEmbed]});
            }
        } 
        else if (input.includes("https://") && input.includes('spotify') && !input.includes('playlist') && input.includes('album')) { 
            try {
                // get the array of tracks in the spotify playlist
                const album = await getTracks(input).then(function(data) {
                    return data;
                });

                // get the playlist data for the message embed
                const albumData = await getData(input).then(function(data) {
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
                const searchEmbed = new EmbedBuilder()
                    .setAuthor({name: `Retrieving the album ${albumName}`})
                    .setColor("#0099E1")
                    .setDescription("Please wait: This could take up to a minute...");

                await interaction.send({embeds: [searchEmbed]});
                // loop through each song in the playlist
                for (const track of album) {
                    const video = await videoFinder(track.name + track.artists[0].name + "lyrics");
                    // if there is a video, create the song object and add its details, then push it to the videos array.
                    if (video) {
                        // set specific song information
                        let song = { title: track.name, url: video.url, artist: track.artists[0].name, time: video.duration.timestamp, date: albumData.release_date, thumbnail: albumData.images[0].url, requester: interaction.user.username};
                        videos.push(song);
                    }
                };
                
                let str = "";
                str += `**${albumName}** has been added \n`;

                // return a message embed saying that the playlist was found
                const embed = new EmbedBuilder()
                    .setAuthor({name: "Success!"})
                    .setColor("#0099E1")
                    .setDescription(str + "\n" + "Artist: **" + albumArtist + "**")
                    .setThumbnail(albumThumbnail);
                await interaction.send({embeds: [embed]});
            } catch {
                const embed = new EmbedBuilder()
                    .setAuthor({name: "Failure"})
                    .setColor("#0099E1")
                    .setDescription("Can't play the album requested");
                message.channel.send({embeds: [embed]});
            }
        }
        else if (input.includes("https://") && input.includes('spotify') && input.includes('playlist')) { // Sp.Playlist
            const url = input;
            try {
                // get the array of tracks in the spotify playlist
                const playlist = await getTracks(input).then(function(data) {
                    return data;
                });

                // get the playlist data for the message embed
                const playlistData = await getData(input).then(function(data) {
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

                // // return a message embed saying that the playlist is being gotten
                const searching = new EmbedBuilder()
                    .setAuthor({name: `Retrieving the playlist ${playlistName}`})
                    .setDescription("Please wait: This will take 1 - 2 minutes...")
                    .setColor("#0099E1")
                await interaction.send({embeds: [searching]});

                // loop through each song in the playlist
                for (const track of playlist) {
                    const video = await videoFinder(track.name + track.artists[0].name + "lyrics");
                    // if there is a video, create the song object and add its details, then push it to the videos array.
                    if (video) {
                        // set specific song information
                        let song = { title: track.name, url: video.url, artist: track.artists[0].name, time: video.duration.timestamp, date: track.album.release_date, thumbnail: track.album.images[0].url, requester: interaction.user.username};
                        videos.push(song);
                    }
                };
                
                let str = "";
                str += `**${playlistName}** has been added \n`;

                // return a message embed saying that the playlist was found
                const embed = new EmbedBuilder()
                    .setThumbnail(playlistThumbnail)
                    .setAuthor({name: "Success!"})
                    .setDescription(str + "\n" + "Owner: **" + owner + "**")
                    .setColor("#0099E1")
                await interaction.send({embeds: [embed]});
            } catch {
                if (url.includes("37")) {
                    const embed = new EmbedBuilder()
                        .setAuthor({name: "Error: Blend Detected"})
                        .setDescription("BeatBuddy does not support Spotify Blends.")
                        .setColor("#0099E1")
                    await interaction.send({embeds: [embed]});
                } else {
                    const embed = new EmbedBuilder()
                        .setAuthor({name: "Error: Couldn't Get Playlist"})
                        .setDescription("Try again, and make sure to not send commands until the playlist has been retrieved.")
                        .setColor("#0099E1")
                    await interaction.send({embeds: [embed]});
                }
            }
        } 
        else if (
            (input.includes("https://") && input.includes('soundcloud') && input.includes('sets') && input.includes('?in='))
             || (input.includes("https://") && input.includes('soundcloud') && !input.includes('sets') && input.includes("?")) 
             || (input.includes("https://") && input.includes('soundcloud') && !input.includes('sets') && !input.includes("?"))) { 

            // get the track info
            let pURL = input;
            if (input.includes("sets") && input.includes("?in=")) {
                pURL = input.replace(/\?.+/, '');
            } else if (!input.includes("sets") && input.includes("?")) {
                pURL = input.replace(/\?.+/, '');
            }
            const track = await scClient.getSongInfo(pURL).then(function(data) {
                return data;
            });

            const date = (track.publishedAt.toISOString().replace(/\T.+/, ''));

            // set the details for the song that gets pushed
            song = {title: track.title, url: track.url, artist: track.author.name, time: (track.duration/60000).toPrecision(3).replace(".", ":"), date: date, thumbnail: track.thumbnail, requester: interaction.user.username};

            // push the song to the videos queue
            videos.push(song);
        }
        else if (
            (input.includes("https://") && input.includes('soundcloud') && input.includes('sets') && input.includes("?") && !input.includes("in=")) 
            || (input.includes("https://") && input.includes('soundcloud') && input.includes('sets') && !input.includes("?"))) { 

            let pURL = input;
            if (input.includes("?")) {
                pURL = input.replace(/\?.+/, '');
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
            const searching = new EmbedBuilder()
                .setAuthor({name: `Retrieving the playlist/album ${pName}`})
                .setDescription("This will take a minute or two...")
                .setColor("#0099E1")
            await txtchannel.send({embeds: [searching]});

            // loop through each song in the playlist
            for (track in (await playlist).tracks) {
                let plSong = (await playlist).tracks[track];

                if (plSong) {
                    let song = {title: plSong.title, url: plSong.permalink_url, artist: plSong.user.username, time: (plSong.duration/60000).toPrecision(3).replace(".", ":"), date: plSong.created_at.replace(/\T.+/, ''), thumbnail: plSong.artwork_url, requester: interaction.user.username};
                    videos.push(song)
                }
            }

            // return a message embed saying that the playlist was found
            let str = "";
            str += `**${pName}** has been added \n`;
            const embed = new EmbedBuilder()
                .setThumbnail(pThumbnail)
                .setAuthor({name: "Success!"})
                .setDescription(str + "\n" + "Owner: **" + owner + "**")
                .setColor("#0099E1")
            await txtchannel.send({embeds: [embed]});
        }
        else {
            // if the song is not a URL, then use keywords to find that song on youtube through a search query.
            const videoFinder = async (query) => {
                const videoResult = await ytSearch(query);
                return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
            }

            // add the info pulled from youtube to the song variable
            const video = await videoFinder(input);
            if (video) {
                // set specific song information
                song = { title: video.title, url: video.url, artist: video.author.name, time: video.duration.timestamp, date: "Couldn't retrive date", thumbnail: video.thumbnail, requester: interaction.user.username};
                console.log("Found the requested song!");
            } else {
                // if no results, send error message
                const responseEmbed = new EmbedBuilder()
                    .setAuthor({name: "Error"})
                    .setColor("#0099E1")
                    .setDescription("Couldn't find the requested song");

                // return embed
                return await txtchannel.send({embeds: [responseEmbed]});
            }
        }

        // if there is no serverQueue
        if (!serverQueue) {
            // create a new constructor for the queue
            const queueConstructor = {
                voice_channel: voiceChannel,
                //text_channel: message.channel,
                connection: null,
                songs: []
            }
            
            // set values in the map as guild id number and queueConstructor
            queue.set(interaction.guild.id, queueConstructor);

            // push the song item regardless
            queueConstructor.songs.push(song);
            
            // push playlist items into queue if playlist is requested
            if (ytpl.validateID(input)) {
                for (i = 0; i <= videos.length - 1; i++) {
                    queueConstructor.songs.push(videos[i]);
                }
                // remove the undefined push from song info outside of loop
                queueConstructor.songs.shift();
            } else if (input.includes('spotify') && input.includes('album')) {
                for (i = 0; i <= videos.length - 1; i++) {
                    queueConstructor.songs.push(videos[i]);
                }
                // remove the undefined push from song info outside of loop
                queueConstructor.songs.shift();
            } else if (input.includes('spotify') && input.includes('playlist')) {
                for (i = 0; i <= videos.length - 1; i++) {
                    queueConstructor.songs.push(videos[i]);
                }
                // remove the undefined push from song info outside of loop
                queueConstructor.songs.shift();
            } else if ((input.includes("https://") && input.includes('soundcloud') && input.includes('sets')) || (input.includes("https://") && input.includes('soundcloud') && input.includes('sets') && !input.includes("?"))) {
                for (i=0; i <= videos.length - 1; i++) {
                    queueConstructor.songs.push(videos[i]);
                }
                // remove the undefined push from song info outside of loop
                queueConstructor.songs.shift();
            }

            try {
                const connection = discordVoice.joinVoiceChannel(
                    {
                        channelId: voiceChannel,
                        guildId: interaction.guild.id,
                        adapterCreator: interaction.guild.voiceAdapterCreator
                    });
                queueConstructor.connection = connection;
                videoPlayer(client, message, message.guild, queueConstructor.songs[0], queue, queueConstructor.connection);
            } catch (err) {
                queue.delete(interaction.guild.id);
                const embed = new EmbedBuilder()
                    .setAuthor({name: "Error"})
                    .setDescription("There was an error connecting")
                    .setColor("#0099E1")
                await interaction.send({embeds: [embed]});
                throw err;
            }  
        } else {
            // push song item regardless
            serverQueue.songs.push(song);

            // if playlist is added after the serverQueue has been made
            if (ytpl.validateID(input)) {

                // get playlist name
                const playlistName = (await ytpl(input)).title;
                // set playlist thumbnail as server image
                const playlistThumbnail = interaction.guild.iconURL();
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
                const embed = new EmbedBuilder()
                    .setThumbnail(playlistThumbnail)
                    .setDescription(str)
                    .setColor("#0099E1")

                // return a message embed saying which playlist was added to the queue
                return await txtchannel.send({embeds: [embed]});
            } else if (input.includes('spotify') && input.includes('playlist')) {
                // get index of undefined song push to remove
                const remIndex = serverQueue.songs.length-1;

                // remove the undefined song
                serverQueue.songs.splice(remIndex, remIndex);

                // for each song, push it to the serverQueue
                for (i = 0; i <= videos.length - 1; i++) {
                    serverQueue.songs.push(videos[i]);
                }
            } else if (input.includes('spotify') && input.includes('album')) {
                // get index of undefined song push to remove
                const remIndex = serverQueue.songs.length-1;

                // remove the undefined song
                serverQueue.songs.splice(remIndex, remIndex);

                // for each song, push it to the serverQueue
                for (i = 0; i <= videos.length - 1; i++) {
                    serverQueue.songs.push(videos[i]);
                }
            } else if ((input.includes("https://") && input.includes('soundcloud') && input.includes('sets')) || (input.includes("https://") && input.includes('soundcloud') && input.includes('sets') && !input.includes("?"))) {
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
                const embed = new EmbedBuilder()
                    .setThumbnail(song.thumbnail)
                    .setDescription(str)
                    .setColor("#0099E1")
                // return a message embed saying which song was added to the queue
                await txtchannel.send({embeds: [embed]});
                return;
            }
        }

        // if (cmd === 'play' || cmd == 'p') {
        // }
        // else if (cmd === 'join') joinChannel(message, message.guild, queue);
        // else if (cmd === 'skip' || cmd === 'next') skipSong(message, serverQueue);
        // else if (cmd === 'skipto' || cmd === 'st') skipTo(message, args, serverQueue, message.guild, songQueue);
        // else if (cmd === "pause") pauseSong(message, serverQueue);
        // else if (cmd === "resume" || cmd === "unpause") resumeSong(message, serverQueue);
        // else if (cmd === 'leave' || cmd === 'stop') leaveChannel(message, serverQueue);
        // else if (cmd === 'queue' || cmd === 'q') getQueue(message, message.guild, queue);
        // else if (cmd === 'songinfo' || cmd === 'song' || cmd === 'info' || cmd === 'i') songInfo(message, message.guild, queue);
        // else if (cmd === 'shuffle') shuffle(message, message.guild, queue);
        // else if (cmd === 'remove' || cmd === 'rem') remove(message, args, serverQueue, message.guild, queue);
        // else if (cmd === 'qlength' || cmd === 'queuelength' || cmd === 'length') queueLength(message, message.guild, queue);
        // else if (cmd === 'loop' || cmd === 'repeat') loopSong (message, message.guild, queue);
        // else if (cmd === 'loopAll' || cmd === 'loopall' || cmd === 'repeatAll' || cmd === 'repeatall') loopAll (message, message.guild, queue);
        // else if (cmd == 'move' || cmd == 'm') moveSong(message, args, serverQueue, message.guild, queue);
    }
}
