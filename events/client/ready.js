module.exports = (Discord, client) => {
    // tell console that the bot is online
    console.log('BeatBuddy reporting for duty!');

    // sets the activity of the bot to how many servers it is currently in.
    client.user.setActivity(`over the music in ${client.guilds.cache.size} servers`, {
        type: "WATCHING",
        name: "ittt"
    });

    client.queue = {};
    if (typeof client.guilds == 'object' && typeof client.guilds[Symbol.iterator] == 'function') {
        for (guild of client.guilds) client.queue[guild.id] = new Map();
    }
    
};