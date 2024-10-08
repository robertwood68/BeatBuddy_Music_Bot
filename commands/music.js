/**
 * Plays music in the current voice channel that the user who requested the song is in.
 *
 * @author Robert Wood
 */
// import Discord libraries
const Discord = require('discord.js');
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const discordVoice = require('@discordjs/voice');

// import libraries for pulling from YouTube and store cookie
const videoPlayer = require("../videoPlayer/videoPlayer");
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const ytpl = require('ytpl');
const ytCookie = `YSC=xrOrLy_mswk; VISITOR_INFO1_LIVE=fTo0vURBlEQ; wide=0; PREF=f4=4000000&tz=America.New_York&f6=40000000&f5=30000; LOGIN_INFO=AFmmF2swRgIhAIQraz_zdWZVz9vwUyyBB9K5QypB_EWEsc_Rx83WjCNmAiEApvQg-E8fTqw1pL9zN9gDTKN22_2TSOl7Lq7cIzWr2zk:QUQ3MjNmelRtb1EzNjNscnk2UEZrTkZBQzI5aGZfRWZ1c18yZmVxeXkyNjJQRkNDZEg3eUpEV21iemstWFNoTUpybWZCZC1KX19pNHhRNEJFLWU4UzZHQUExNmNFWVYyb1c1R0ljYnh3ZUFnRk9IczRSRDlDd0puQUVYYkt1SEx4eVNsenVNdkUtVlVFeEhJb19kR2VQdm95TmI4Z1VXbWVR; SID=JQjUJtTY7UFXuR5kdUY6ri1X8a4OTlfiWTAC9Jshq1z3htzCwBYfU6ndCAAULaE3YPKoMw.; __Secure-1PSID=JQjUJtTY7UFXuR5kdUY6ri1X8a4OTlfiWTAC9Jshq1z3htzCUBGT4tx4uvMTDfqbGO1mpw.; __Secure-3PSID=JQjUJtTY7UFXuR5kdUY6ri1X8a4OTlfiWTAC9Jshq1z3htzCDfxu5lphiZVSuOBUYo97aA.; HSID=AIcOpsLqfP1ptA6Gs; SSID=A2fbCMZwMVPQQ9C9d; APISID=QItfrcR2Iva__JgM/AXGikIg8xnITdlKks; SAPISID=swzssEsQqdq2bLD3/A0gdEuiqhy0yyMuYk; __Secure-1PAPISID=swzssEsQqdq2bLD3/A0gdEuiqhy0yyMuYk; __Secure-3PAPISID=swzssEsQqdq2bLD3/A0gdEuiqhy0yyMuYk; SIDCC=AJi4QfF50GVGxwQ1WWt-YRnRwuzdkn8blXK9BmethVZOprvx6A9b3RHX5y0BxDYv-1Px06H5FEc; __Secure-3PSIDCC=AJi4QfEhzm6JuecJt3eC_Qajm6dL08-DeHE2l_ZXsiuYLeJxSnMg-2nzD19p3BbcWJrkiii034w`;

// import libraries for pulling data from Spotify links
const fetch = require('isomorphic-unfetch');
const { getData, getPreview, getTracks } = require('spotify-url-info')(fetch);

// import libraries for scraping SoundCloud website from links
const soundcloud = require('soundcloud-scraper');
const { SoundCloud } = require("scdl-core");
SoundCloud.connect();
SoundCloud.client_id = (process.env.SOUNDCLOUD_API_KEY);
const scClient = new soundcloud.Client(process.env.SOUNDCLOUD_API_KEY);

// create the map that will serve as a list of all queues
const queue = new Map();

// begin module exports
module.exports = {
    // command fields setup
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

    // command execution setup
    async execute(client, interaction) {
        // create songQueue variable for use in external command
        const message = interaction;
        const songQueue = queue.get(interaction.guild.id);

        // create a variable for the current voice channel
        const voiceChannel = interaction.member.voice.channelId;
        let txtchannel = interaction.channel;

        // create the queue
        const serverQueue = queue.get(interaction.guild.id);
        queue.set(interaction.guild.id, serverQueue);

        // song or link requested
        let input = await interaction.options.getString('link-or-keywords');
        console.log(`Song Requested: ${input}`)

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

        // create song object to put in the map
        let song = {};

        // create videos array to hold each song from a playlist
        let videos = [];

        // if the requested song is a YouTube url, pull the song info from the link and set the details for the song
        if (ytdl.validateURL(input)) {
            // audio options for stream
            const options = {
                requestOptions: {
                    headers: {
                        cookie: ytCookie,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                },
                filter: 'audioonly',
                highWaterMark: 1<<20
            }
            const songInfo = await ytdl.getInfo(input, options);
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
            try{ 
                // retrieve the data for the song from the spotify link
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
                
                // if no results, send error message
                const responseEmbed = new EmbedBuilder()
                    .setColor("#0099E1")
                    .setDescription("Retrieving Song Info...");
                await txtchannel.send({embeds: [responseEmbed]});
                
                const video = await videoFinder(data.title + " " + data.artist + "lyrics");

                if (video) {
                    // set specific song information
                    song = { title: title, url: video.url, artist: artist, time: video.duration.timestamp, date: date, thumbnail: thumbnail, requester: interaction.user.username}
                } else {
                    // if no results, send error message
                    const responseEmbed = new EmbedBuilder()
                        .setAuthor({name: "Error"})
                        .setColor("#0099E1")
                        .setDescription("Couldn't find the requested song");
                    return await interaction.send({embeds: [responseEmbed]});
                }
            } catch (err) { console.log(err) }
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
                const albumThumbnail = albumData.coverArt.sources[0].url;
                // get owner of the playlist
                const albumArtist = albumData.subtitle;

                // function to handle YouTube searches
                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }

                // return a message embed saying that the playlist is being gotten
                const searchEmbed = new EmbedBuilder()
                    .setAuthor({name: `Retrieving the album ${albumName}`})
                    .setColor("#0099E1")
                    .setDescription("Please wait: This could take up to a minute...");

                await txtchannel.send({embeds: [searchEmbed]});
                // loop through each song in the playlist
                for (const track of album) {
                   
                    const video = await videoFinder(track.name + " " + track.artist + " lyrics");
                    // if there is a video, create the song object and add its details, then push it to the videos array.
                    if (video) {
                        // set specific song information
                        let song = { title: track.name, url: video.url, artist: track.artist, time: video.duration.timestamp, date: albumData.releaseDate, thumbnail: albumData.coverArt.sources[0].url, requester: interaction.user.username};
                        videos.push(song);
                    }
                }
                
                let str = "";
                str += `**${albumName}** has been added \n`;

                // return a message embed saying that the playlist was found
                const embed = new EmbedBuilder()
                    .setAuthor({name: "Success!"})
                    .setColor("#0099E1")
                    .setDescription(str + "\n" + "Artist: **" + albumArtist + "**")
                    .setThumbnail(albumThumbnail);
                await txtchannel.send({embeds: [embed]});
            } catch (err) {
                console.log(err);
                const embed = new EmbedBuilder()
                    .setAuthor({name: "Failure"})
                    .setColor("#0099E1")
                    .setDescription("Can't play the album requested");
                await txtchannel.send({embeds: [embed]});
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
                const playlistThumbnail = playlistData.coverArt.sources[0].url;
                // get owner of the playlist
                const owner = playlistData.subtitle;

                // function to handle YouTube searches
                const videoFinder = async (query) => {
                    const videoResult = await ytSearch(query);
                    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                }

                // // return a message embed saying that the playlist is being gotten
                const searching = new EmbedBuilder()
                    .setAuthor({name: `Retrieving the playlist ${playlistName}`})
                    .setDescription("This could take 1 - 2 minutes...")
                    .setColor("#0099E1")
                await txtchannel.send({embeds: [searching]});

                // loop through each song in the playlist
                for (const track of playlist) {
                    const video = await videoFinder(track.name + " " + track.artist + "lyrics");
                    // if there is a video, create the song object and add its details, then push it to the videos array.
                    if (video) {
                        // set specific song information
                        // retrieve the data for the song from the spotify link
                        let data = await getPreview(input).then(function(data) {
                            return data;
                        });
                        let thumbnail = data.image;
                        let date = data.date;
                        if (typeof date != 'undefined') {
                            date = data.date.replace(/\T.+/, '');
                        } else {
                            date = "Unavailable"
                        }
                        let song = { title: track.name, url: video.url, artist: track.artist, time: video.duration.timestamp, date: date, thumbnail: thumbnail, requester: interaction.user.username};
                        videos.push(song);
                    }
                }
                
                let str = "";
                str += `**${playlistName}** has been added \n`;

                // return a message embed saying that the playlist was found
                const embed = new EmbedBuilder()
                    .setThumbnail(playlistThumbnail)
                    .setAuthor({name: "Success!"})
                    .setDescription(str + "\n" + "Owner: **" + owner + "**")
                    .setColor("#0099E1")
                await txtchannel.send({embeds: [embed]});
            } catch (err) {
                console.log(err)
                if (url.includes("37")) {
                    const embed = new EmbedBuilder()
                        .setAuthor({name: "Error: Blend Detected"})
                        .setDescription("BeatBuddy does not support Spotify Blends.")
                        .setColor("#0099E1")
                    await txtchannel.send({embeds: [embed]});
                } else {
                    const embed = new EmbedBuilder()
                        .setAuthor({name: "Error: Couldn't Get Playlist"})
                        .setDescription("Try again, and make sure to not send commands until the playlist has been retrieved.")
                        .setColor("#0099E1")
                    await txtchannel.send({embeds: [embed]});
                }
            }
        } 
        else if (
            (input.includes("https://") && input.includes('soundcloud') && input.includes('sets') && input.includes('?in='))
             || (input.includes("https://") && input.includes('soundcloud') && !input.includes('sets') && input.includes("?")) 
             || (input.includes("https://") && input.includes('soundcloud') && !input.includes('sets') && !input.includes("?"))) { 
            try {
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
            } catch (err) { console.log(err); }
        }
        else if (
            (input.includes("https://") && input.includes('soundcloud') && input.includes('sets') && input.includes("?") && !input.includes("in=")) 
            || (input.includes("https://") && input.includes('soundcloud') && input.includes('sets') && !input.includes("?"))) { 

            try {
                let pURL = input;
                if (input.includes("?")) {
                    pURL = input.replace(/\?.+/, '');
                }
                
                let p;
                let getPlaylist = SoundCloud.playlists.getPlaylist(pURL)
                await getPlaylist.then(function(result) {
                    p = result;
                })

                const pName = p.title;
                const pThumb = p.artwork_url;
                let pThumbnail = "";
                if (pThumb != "") {
                    pThumbnail = pThumb;
                }
                const owner = p.user.username;

                // return a message embed saying that the playlist is being gotten
                const searching = new EmbedBuilder()
                    .setAuthor({name: `Retrieving the playlist/album ${pName}`})
                    .setDescription("This will take a minute or two...")
                    .setColor("#0099E1")
                await txtchannel.send({embeds: [searching]});

                // loop through each song in the playlist
                for (track in (await p).tracks) {
                    let plSong = (await p).tracks[track];

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
            } catch (err) { console.log(err); }
        }
        else {
            // if the song is not a URL, then use keywords to find that song on YouTube through a search query.
            const videoFinder = async (query) => {
                const videoResult = await ytSearch(query);
                return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
            }

            // add the info pulled from YouTube to the song variable
            const video = await videoFinder(input);
            if (video) {
                // set specific song information
                song = { title: video.title, url: video.url, artist: video.author.name, time: video.duration.timestamp, date: "Couldn't retrieve date", thumbnail: video.thumbnail, requester: interaction.user.username};
                console.log(`Song Retrieved: ${song.title}`);
            } else {
                // if no results, send error message
                const responseEmbed = new EmbedBuilder()
                    .setAuthor({name: "Error"})
                    .setColor("#0099E1")
                    .setDescription("Couldn't find the requested song");
                return await txtchannel.send({embeds: [responseEmbed]});
            }
        }

        // if there is no serverQueue
        if (!serverQueue) {
            // create a new constructor for the queue
            let queueConstructor = {
                voice_channel: voiceChannel,
                //text_channel: message.channel,
                connection: null,
                songs: []
            }
            
            // set values in the map as guild id number and queueConstructor
            queue.set(interaction.guild.id, queueConstructor);
            
            // push playlist items into queue if playlist is requested
            try {
                 // push the song item regardless
                queueConstructor.songs.push(song);
                
                if (ytpl.validateID(input)) {
                    queueConstructor.songs.push(song);
                    for (let i = 0; i <= videos.length - 1; i++) {
                        queueConstructor.songs.push(videos[i]);
                    }
                    queueConstructor.songs.shift();
                } else if (input.includes('spotify') && input.includes('album')) {
                    for (let i = 0; i <= videos.length - 1; i++) {
                        queueConstructor.songs.push(videos[i]);
                    }
                    queueConstructor.songs.shift();
                } else if (input.includes('spotify') && input.includes('playlist')) {
                    for (let i = 0; i <= videos.length - 1; i++) {
                        queueConstructor.songs.push(videos[i]);
                    }
                    queueConstructor.songs.shift();
                } else if ((input.includes("https://") && input.includes('soundcloud') && input.includes('sets')) || (input.includes("https://") && input.includes('soundcloud') && input.includes('sets') && !input.includes("?"))) {
                    for (let i=0; i <= videos.length - 1; i++) {
                        queueConstructor.songs.push(videos[i]);
                    }
                    queueConstructor.songs.shift();
                }
            } catch (err) { console.log(err) }

            try {
                const connection = discordVoice.joinVoiceChannel(
                    {
                        channelId: voiceChannel,
                        guildId: interaction.guild.id,
                        adapterCreator: interaction.guild.voiceAdapterCreator
                    });
                const networkStateChangeHandler = (oldNetworkState, newNetworkState) => {
                    const newUdp = Reflect.get(newNetworkState, 'udp');
                    clearInterval(newUdp?.keepAliveInterval);
                }
                connection.on('stateChange', (oldState, newState) => {
                    Reflect.get(oldState, 'networking')?.off('stateChange', networkStateChangeHandler);
                    Reflect.get(newState, 'networking')?.on('stateChange', networkStateChangeHandler);
                });
                queueConstructor.connection = connection;
                client.queue = queue;
                videoPlayer(client, message, message.guild, queueConstructor.songs[0], queue, queueConstructor.connection);
            } catch (err) {
                queue.delete(interaction.guild.id);
                const embed = new EmbedBuilder()
                    .setAuthor({name: "Error"})
                    .setDescription("There was an error connecting")
                    .setColor("#0099E1")
                await interaction.send({embeds: [embed]});
                console.log(err)
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

                // get index of undefined push of song above for removal
                const elementToRemove = serverQueue.songs.length-1;

                // remove the undefined song push from earlier
                serverQueue.songs.splice(elementToRemove, elementToRemove);

                // for each video, push it to the server queue
                for (let i = 0; i <= videos.length - 1; i++) {
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
                for (let i = 0; i <= videos.length - 1; i++) {
                    serverQueue.songs.push(videos[i]);
                }
            } else if (input.includes('spotify') && input.includes('album')) {
                // get index of undefined song push to remove
                const remIndex = serverQueue.songs.length-1;

                // remove the undefined song
                serverQueue.songs.splice(remIndex, remIndex);

                // for each song, push it to the serverQueue
                for (let i = 0; i <= videos.length - 1; i++) {
                    serverQueue.songs.push(videos[i]);
                }
            } else if ((input.includes("https://") && input.includes('soundcloud') && input.includes('sets')) || (input.includes("https://") && input.includes('soundcloud') && input.includes('sets') && !input.includes("?"))) {
                const remIndex = serverQueue.songs.length-1;

                // remove the undefined song
                serverQueue.songs.splice(remIndex, remIndex);

                // for each song, push it to the serverQueue
                for (let i = 0; i <= videos.length - 1; i++) {
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
                await txtchannel.send({embeds: [embed]});
            }
        }
    }
}
