/**
 * Prints startup message and sets the bot's activity.
 * 
 * @author Robert Wood 2023
 */
const { Events, ActivityType } = require('discord.js');
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log('BeatBuddy reporting for duty!');
        // sets the activity of the bot to how many servers it is currently in.
        client.user.setActivity(`over the music in ${client.guilds.cache.size} servers`, { type: ActivityType.Watching });
		
		// generates dependency report for djs voice
		// const { generateDependencyReport } = require('@discordjs/voice');
		// console.log(generateDependencyReport());
	},
};