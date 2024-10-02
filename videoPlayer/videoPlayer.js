const ytdl = require('@distube/ytdl-core'); // Updated import statement
const ytpl = require('ytpl');
const soundcloud = require('soundcloud-scraper');
const scClient = new soundcloud.Client(process.env.SOUNDCLOUD_API_KEY);
const ytCookie = "VISITOR_PRIVACY_METADATA=CgJVUxIEGgAgIw%3D%3D; __Secure-3PSID=g.a000oQhLjmcGoWO00UT2j8frE_OWPnlHLNezILGxRshuzbWGP35uRs5GuNB1fVcMkgymLK3LIwACgYKAZASARMSFQHGX2MirjlJBb2joxsWCK_DELaCuRoVAUF8yKrIA23yuBfpLNTVrSpEFXUd0076; __Secure-1PSIDTS=sidts-CjEBQlrA-Jwp_Oo3DFfpYxtox4qvoE8kx5P2K009qWzKJKsxXTOA7bmZSGad9eXMQizZEAA; SAPISID=VvuPQsVQczuGuzAO/ANkBEKeTdZTht_F_g; __Secure-1PSIDCC=AKEyXzV5XqhJJWlWhYq9MgNja0NWI2aYn3gE-xYzXoFFFnrCyves-msswZFN5aAWGkgzdxmU; SSID=AGDJBqXJ0OP3uMt96; __Secure-1PAPISID=VvuPQsVQczuGuzAO/ANkBEKeTdZTht_F_g; __Secure-1PSID=g.a000oQhLjmcGoWO00UT2j8frE_OWPnlHLNezILGxRshuzbWGP35u_vGarMFHYSsZRMB1sPVk1gACgYKAdESARMSFQHGX2MiHgL1g3JRF2HtiUZhvQ6tSRoVAUF8yKrAQ7EBo8C2wIOlish2KA2U0076; __Secure-3PAPISID=VvuPQsVQczuGuzAO/ANkBEKeTdZTht_F_g; __Secure-3PSIDCC=AKEyXzUWo5boQ-T3t4V7VkA8fRqAaZ3KreyHljUDPuvmX3uyHPOuKmWaDjY_vefUXVqHExO8RoQ; __Secure-3PSIDTS=sidts-CjEBQlrA-Jwp_Oo3DFfpYxtox4qvoE8kx5P2K009qWzKJKsxXTOA7bmZSGad9eXMQizZEAA; LOGIN_INFO=AFmmF2swRAIgXWGd8NzVvlEBMxk00POSBQInJ9YfBN6slY8hNIrbqHYCIDm64qqsDrrnGI8sc4Ge0at-kVIpFn2FLChpv6f0RguP:QUQ3MjNmekZKSVFIcGlET01tRFFpUUpGaTh6NW9yNE9UTzRMeWhWV3A1OWtLeXMtWnBna3FlS09iY2ZFMHZsRFF5S3R1YkZSUUdaUWphLUNVWEpJWTdLTVRibGkzVklZQ0lQTm9VRDlCX003OWp2UEZZZ1VWTmtNS1NIdHRaWk1hNDRnTWRGR0JtTGJOZ3l6dGlCSThXS1d3RGdtZHhrOUFR; PREF=f4=4000000&f6=40000000&tz=America.New_York";
const {EmbedBuilder} = require("discord.js");
const {createAudioPlayer, createAudioResource} = require('@discordjs/voice');

/**
 * Configures the options for the music and plays the music in the voice channel.
 *
 * FULLY FUNCTIONAL
 *
 * @returns null if no song, or "Now playing ${song.title}" if the song is detected and found.
 */
const videoPlayer = async (client, message, guild, song, queue, connection) => {
    try {
        let songQueue = queue.get(guild.id);
        const voice = require('@discordjs/voice');

        if (!song) {
            const responseEmbed = new EmbedBuilder()
                .setAuthor({name: "No more songs in the queue."})
                .setColor("#0099E1")
            await message.channel.send({embeds: [responseEmbed]});
            voice.getVoiceConnection(guild.id).disconnect();
            queue.delete(guild.id);
            return;
        }
        if (ytdl.validateURL(song.url) || ytpl.validateID(song.url)) {
            try {
                const player = createAudioPlayer();
                // audio options for stream
                const options = {
                    requestOptions: {
                        headers: {
                            cookie: ytCookie,
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    },
                    filter: 'audioonly',
                    highWaterMark: 1 << 20
                }
                const stream = await ytdl(song.url, options); // Updated stream handling
                const music = createAudioResource(stream);
                connection.subscribe(player);
                player.play(music);
                player.on('idle', () => {
                    songQueue.songs.shift();
                    videoPlayer(client, message, guild, songQueue.songs[0], queue, connection);
                })

                // string to set as description in embed
                let str = "";
                str += `**Now Playing:**\n ${song.title}`;

                // create embed to hold current song
                const responseEmbed = new EmbedBuilder()
                    .setColor("#0099E1")
                    .setDescription(str)
                    .setThumbnail(song.thumbnail);

                // return now playing embed
                await message.channel.send({embeds: [responseEmbed]});
                return;
            } catch (err) {
                const responseEmbed = new EmbedBuilder()
                    .setAuthor({name: "Failure!"})
                    .setDescription("Unable to play the song.  Attempting to skip to the next one.")
                    .setColor("#0099E1");

                songQueue.songs.shift();
                videoPlayer(client, message, guild, songQueue.songs[0], queue, connection);

                // return error message
                console.log(err);
                await message.channel.send({embeds: [responseEmbed]});
                return;
            }
        } else {
            try {
                const player = createAudioPlayer();
                const stream = await scClient.getSongInfo(song.url).then(function(data) {
                    return data.downloadProgressive();
                });
                const music = createAudioResource(stream);
                connection.subscribe(player);
                player.play(music);
                player.on('idle', () => {
                    songQueue.songs.shift();
                    videoPlayer(client, message, guild, songQueue.songs[0], queue, connection);
                });

                // string to set as description in embed
                let str = "";
                str += `**Now Playing:**\n ${song.title}`;

                // create embed to hold current song
                const responseEmbed = new EmbedBuilder()
                    .setColor("#0099E1")
                    .setDescription(str)
                    .setThumbnail(song.thumbnail);

                // return now playing embed
                await message.channel.send({embeds: [responseEmbed]});
                return;
            } catch (err) {
                const responseEmbed = new EmbedBuilder()
                    .setAuthor({name: "Failure!"})
                    .setDescription("Unable to play the song.  Attempting to skip to the next one.")
                    .setColor("#0099E1");

                songQueue.songs.shift();
                videoPlayer(client, message, guild, songQueue.songs[0], queue, connection);

                // return error message
                console.log(err);
                await message.channel.send({embeds: [responseEmbed]});
                return;
            }
        }
    } catch (err) {
        console.log(err);
        const responseEmbed = new EmbedBuilder()
            .setColor("#0099E1")
            .setDescription("Couldn't play the song");

        // // return now playing embed
        try {
            if (typeof message !== 'undefined') {
                if (typeof message.channel !== 'undefined') {
                    return await message.channel.send({embeds: [responseEmbed]});
                }
            }
        } catch (err) {
            return console.log(err);
        }
    }
}
module.exports = videoPlayer;
