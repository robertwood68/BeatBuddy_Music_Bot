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
		// Listener that clears the queue if manually disconnected by user.
		client.on('voiceStateUpdate', (oldState, newState) => {
			try {
				// check if someone connects or disconnects
				if (oldState.channel === null || typeof oldState.channel === 'undefined' || oldState.channel.id === null || typeof oldState.channel.id == 'undefined') return;
				// check if the bot is disconnecting
				if (newState.id !== client.user.id) return;
				if (typeof client.queue != 'undefined') {
					return client.queue.delete(`${oldState.guild.id}`);
				}
			} catch (err) {
				console.log(err);
			}
		});
		// generates dependency report for djs voice
		// const { generateDependencyReport } = require('@discordjs/voice');
		// console.log(generateDependencyReport());
	},
};