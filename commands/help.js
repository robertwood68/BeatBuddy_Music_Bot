/**
 * Sends 3 messages.  The first contains a list of general commands and their functions, the second contains a list of music-specific commands and their functions, and the third contains warnings, disclaimers, and thank yous from the creator (RWood)
 * 
 * @author Robert Wood
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows helpful information about BeatBuddy')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),
    async execute(client, interaction) {
        const responseEmbed1 = new EmbedBuilder().setColor("#0099E1").setAuthor({name: "List of my basic commands:"}).setThumbnail(interaction.guild.iconURL());
        const responseEmbed2 = new EmbedBuilder().setColor("#0099E1").setAuthor({name: "List of my audioplayer commands:"}).setThumbnail(interaction.guild.iconURL());
        const responseEmbed3 = new EmbedBuilder().setColor("#0099E1").setAuthor({name: "Caution:"}).setThumbnail(interaction.guild.iconURL());

        const str1 = ` - **/clear** --> Clears the specified number of messages if under 14 days old. \n\n - **/hello** --> Greets the user that sent the command. \n\n - **//help** --> Sends helpful info about BeatBuddy. \n\n - **//ping** --> Replies with 'pong'. \n\n - **//servercount** --> Shows the number of servers that BeatBuddy is currently in.`;
        const str2 = ` **BeatBuddy supports YouTube, Spotify, and SoundCloud links!** \n\n - **/play** --> Plays the requested song or video in the voice channel if nothing is playing, otherwise adds the song or video to the queue. \n\n - **/skip** --> Skips to the next song in the queue. \n\n - **/skipto** --> Skips to the song at the specified number in the queue. \n\n - **/remove** --> Removes the song at the specified index from the queue. \n\n - **/pause** --> Pauses the song. \n\n - **/resume** --> Resumes the song if paused prior. \n\n - **/queue** --> Outputs the current track and the name and requester of the next 10 songs in the queue. \n\n - **/queuelength** --> Outputs the length of the queue. \n\n - **/leave** --> Leaves the voice channel and clears the queue. \n\n - **/join** --> Joins the voice channel without audio until /play is invoked. \n\n - **/repeat** --> Repeats the song currently playing. \n\n - **/repeatall** --> Repeats the entirety of the current queue. \n\n - **/shuffle** --> Shuffles the current queue (current song excluded). \n\n - **/move** --> Moves the song at the index requested to the next song in the queue. \n\n - **/songinfo** --> If info is obtainable, outputs the title, artist, length, and date published of the song playing.`;
        const str3 = `**Disclaimer:**  BeatBuddy can play songs from YouTube, Spotify, and SoundCloud links, YouTube keyword searches, along with links for YouTube playlists, YouTube Mixes, Spotify playlists, and SoundCloud playlists.\n\n**WARNING:**  If a YouTube Mix is requested, the mix will be added to the queue as a single video of the songs.  Links from any audio provider besides YouTube, Spotify, or SoundCloud will not be added or played.\n\n**Thanks for the support, now enjoy your time with BeatBuddy!**\n ~ Rob Wood`;

        interaction.reply({embeds: [responseEmbed1.setDescription(str1), responseEmbed2.setDescription(str2), responseEmbed3.setDescription(str3)]})

        // code to easily change the bots avatar -- Image must be in the top level of the project.
        /* client.user.setAvatar('BB.JPG'); console.log(client.user.setAvatar('BB.JPG')); */
    }
}