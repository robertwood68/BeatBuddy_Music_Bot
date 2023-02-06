const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const soundcloud = require('soundcloud-scraper');
const scClient = new soundcloud.Client(process.env.SOUNDCLOUD_API_KEY);
const ytCookie = "YSC=xrOrLy_mswk; VISITOR_INFO1_LIVE=fTo0vURBlEQ; wide=0; PREF=f4=4000000&tz=America.New_York&f6=40000000&f5=30000; LOGIN_INFO=AFmmF2swRgIhAIQraz_zdWZVz9vwUyyBB9K5QypB_EWEsc_Rx83WjCNmAiEApvQg-E8fTqw1pL9zN9gDTKN22_2TSOl7Lq7cIzWr2zk:QUQ3MjNmelRtb1EzNjNscnk2UEZrTkZBQzI5aGZfRWZ1c18yZmVxeXkyNjJQRkNDZEg3eUpEV21iemstWFNoTUpybWZCZC1KX19pNHhRNEJFLWU4UzZHQUExNmNFWVYyb1c1R0ljYnh3ZUFnRk9IczRSRDlDd0puQUVYYkt1SEx4eVNsenVNdkUtVlVFeEhJb19kR2VQdm95TmI4Z1VXbWVR; SID=JQjUJtTY7UFXuR5kdUY6ri1X8a4OTlfiWTAC9Jshq1z3htzCwBYfU6ndCAAULaE3YPKoMw.; __Secure-1PSID=JQjUJtTY7UFXuR5kdUY6ri1X8a4OTlfiWTAC9Jshq1z3htzCUBGT4tx4uvMTDfqbGO1mpw.; __Secure-3PSID=JQjUJtTY7UFXuR5kdUY6ri1X8a4OTlfiWTAC9Jshq1z3htzCDfxu5lphiZVSuOBUYo97aA.; HSID=AIcOpsLqfP1ptA6Gs; SSID=A2fbCMZwMVPQQ9C9d; APISID=QItfrcR2Iva__JgM/AXGikIg8xnITdlKks; SAPISID=swzssEsQqdq2bLD3/A0gdEuiqhy0yyMuYk; __Secure-1PAPISID=swzssEsQqdq2bLD3/A0gdEuiqhy0yyMuYk; __Secure-3PAPISID=swzssEsQqdq2bLD3/A0gdEuiqhy0yyMuYk; SIDCC=AJi4QfF50GVGxwQ1WWt-YRnRwuzdkn8blXK9BmethVZOprvx6A9b3RHX5y0BxDYv-1Px06H5FEc; __Secure-3PSIDCC=AJi4QfEhzm6JuecJt3eC_Qajm6dL08-DeHE2l_ZXsiuYLeJxSnMg-2nzD19p3BbcWJrkiii034w";
const {EmbedBuilder} = require("discord.js");
const {createAudioPlayer, createAudioResource} = require('@discordjs/voice');
/**
 * Configures the options for the music and plays the music in the voice channel.
 * 
 * FULLY FUNCTONAL
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
                const stream = ytdl(song.url, {requestOptions: { headers: { cookie: ytCookie } }, filter: 'audioonly', highWaterMark: 1<<25 }); // audio options for stream
                const music = createAudioResource(stream)
                connection.subscribe(player)
                player.play(music)
                player.on('idle', () => {
                    songQueue.songs.shift();
                    videoPlayer(message, guild, songQueue.songs[0], queue, connection);
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
            } catch (err){
                const responseEmbed = new EmbedBuilder()
                    .setAuthor({name: "Failure!"})
                    .setDescription("Unable to play the song.  Attempting to skip to the next one.")
                    .setColor("#0099E1");

                songQueue.songs.shift();
                videoPlayer(message, guild, songQueue.songs[0], queue, connection);

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
                const music = createAudioResource(stream)
                connection.subscribe(player)
                player.play(music)
                player.on('finish', () => {
                    songQueue.songs.shift();
                    videoPlayer(message, guild, songQueue.songs[0], queue, connection);
                });

                // string to set as description in embed
                let str = "";
                str += `**Now Playing:**\n ${song.title}`;

                // create embed to hold current song
                const responseEmbed = new EmbedBuilder()
                    .setColor("#0099E1")
                    .setDescription(str)
                    .setThumbnail(song.thumbnail);

                // // return now playing embed
                await message.channel.send({embeds: [responseEmbed]});
                return;
            } catch (err) {
                const responseEmbed = new EmbedBuilder()
                    .setAuthor({name: "Failure!"})
                    .setDescription("Unable to play the song.  Attempting to skip to the next one.")
                    .setColor("#0099E1");

                songQueue.songs.shift();
                videoPlayer(message, guild, songQueue.songs[0], queue, connection);

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
        await message.channel.send({embeds: [responseEmbed]});
    }
}
module.exports = videoPlayer;