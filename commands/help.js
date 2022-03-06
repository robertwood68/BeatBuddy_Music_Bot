/**
 * Sends two messages.  The first contains a list of general commands and their functions, and the second contains a list of music-specific commands and their functions.
 * 
 * @author Robert Wood
 */
module.exports = {
    name: 'help',
    description: "Outputs a list of commands available for the bot",
    execute(message, args, cmd, client, Discord) {
        if (cmd === 'help') {
            console.log('Sending commands list');
            const ch = message.channel;

            // Basic commands list
            ch.send("```\nList of my basic commands:\n - //clear (int), //delete (int), or //del (int) --> Clears the specified number of messages if under 14 days old. \n - //hello, //hey, or //hi --> Responds to the user with 'hey (username)'. \n - //help --> sends a list of all available commands. \n - //ping --> Responds with 'pong'.\n\nList of my audioplayer commands:\n - //play (song details or url) or //p (song details or url) --> Plays the requested song or video in the voice \n   channel if nothing is playing, otherwise adds the song or video to the queue. \n - //skip or //next --> Skips to the next song in the queue. \n - //pause --> Pauses the song. \n - //resume or //unpause --> Resumes the song if paused prior. \n - //queue or //q --> Outputs the track number and name of each song in the queue. \n - //leave or //stop --> Leaves the voice channel and clears the queue. \n - //join --> Joins the voice channel without audio until //play is invoked. \n - //shuffle --> Shuffles the current queue (song playing atm is not included). \n - //songinfo, //song, or //info --> Outputs the title, artist, length, and date published of the song playing.\n\nDisclaimer:  BeatBuddy only supports youtube links and searches at this time and does not have the ability to play any playlists.\n\nWARNING:  If a youtube playlist is requested, or a url from any other audio provider is requested, BeatBuddy will crash and be unusable until further notice.\n\nEnjoy your time with BeatBuddy!\n```");
        }
    }
}