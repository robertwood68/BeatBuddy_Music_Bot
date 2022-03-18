/**
 * Sends 3 messages.  The first contains a list of general commands and their functions, the second contains a list of music-specific commands and their functions, and the third contains warnings, disclaimers, and thank yous from the creator (RWood)
 * 
 * @author Robert Wood
 */
module.exports = {
    name: 'help',
    aliases: 'h',
    description: "Outputs a list of commands available for the bot",
    execute(message, args, cmd, client, Discord) {
        if (cmd === 'help' || cmd === 'h') {

            // channel variable for easy sending
            const ch = message.channel;

            // basic commands
            const str1 = ` - **//clear (int)**, **//delete (int)**, or **//del (int)** --> Clears the specified number of messages if under 14 days old. \n\n - **//hello**, **//hey**, or **//hi** --> Responds to the user with 'hey (username)'. \n\n - **//help** --> sends a list of all available commands. \n\n - **//ping** --> Responds with 'pong'. \n\n - **//servercount** or **//sc** --> Outputs the number of servers that BeatBuddy is currently in.`;

            // music commands
            const str2 = ` - **//play (song details or url)** or **//p (song details or url)** --> Plays the requested song or video in the voice channel if nothing is playing, otherwise adds the song or video to the queue. \n\n - **//skip** or **//next** --> Skips to the next song in the queue. \n\n - **//pause** --> Pauses the song. \n\n - **//resume** or **//unpause** --> Resumes the song if paused prior. \n\n - **//queue** or **//q** --> Outputs the current track and the name and requester of the next 10 songs in the queue. \n\n - **//leave** or **//stop** --> Leaves the voice channel and clears the queue. \n\n - **//join** --> Joins the voice channel without audio until //play is invoked. \n\n - **//shuffle** --> Shuffles the current queue (song playing atm is not included). \n\n - **//songinfo**, **//song**, or **//info** --> Outputs the title, artist, length, and date published of the song playing.`;

            // disclaimer and warning
            const str3 = `**Disclaimer:**  BeatBuddy can play songs from YouTube links and keyword searches, along with links from YouTube Playlists and Mixes. However, Spotify and SoundCloud links are not yet supported.\n\n**WARNING:**  If a YouTube Mix is requested, the mix will be added to the queue as a single video of the songs.  Links from any audio provider besides YouTube will not be added or played.\n\n**Thanks for the support, now enjoy your time with BeatBuddy!**\n ~ Rob Wood`;

            // message embed for basic commands
            const embed1 = new Discord.MessageEmbed()
                .setAuthor("List of my basic commands:")
                .setThumbnail(message.guild.iconURL())
                .setDescription(str1);

            // message embed for music commands
            const embed2 = new Discord.MessageEmbed()
                .setAuthor("List of my audioplayer commands:")
                .setThumbnail(message.guild.iconURL())
                .setDescription(str2);

            // message embed for disclaimer, warning, and thanks
            const embed3 = new Discord.MessageEmbed()
                .setAuthor("Caution:")
                .setThumbnail(message.guild.iconURL())
                .setDescription(str3);

            // send all embeds
            ch.send(embed1);
            ch.send(embed2);
            ch.send(embed3);

            // code to easily change the bots avatar.  Image must be in the top level of the project.
            /*
            client.user.setAvatar('BB.JPG');
            console.log(client.user.setAvatar('BB.JPG'));
            */
        }
    }
}