const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits} = require("discord.js");

/**
 * Returns the number of songs in the queue.
 */
module.exports = {
    data: new SlashCommandBuilder() 
        .setName("queuelength")
        .setDescription("Shows the total number of songs in the queue")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),
    async execute(client, interaction) {
        try {
            // create variable for embed
            const embed = new EmbedBuilder();

            // if queue exists
            if (typeof client.queue != 'undefined') {
                if (typeof client.queue.get(`${interaction.guild.id}`) != 'undefined') { // if songqueue exists
                    // store song queue in variable
                    const songQueue = client.queue.get(`${interaction.guild.id}`);
                    try {
                        // if no songs in songqueue
                        if (typeof songQueue.songs === 'undefined') return;
                        // send success message
                        return await interaction.reply({embeds: [embed.setAuthor({name: "Success"}).setDescription(`There are ${songQueue.songs.length} songs in the queue`).setColor("#0099E1")]});
                    } catch (err) {
                        console.log(err)
                        // send error embed
                        return await interaction.reply({embeds: [embed.setAuthor({name: "Error"}).setDescription(`Couldn't show length of the queue`).setColor("#0099E1")]});
                    }
                } else {
                    // return embed
                    return await interaction.reply({embeds: [embed.setColor("#0099E1").setDescription("There are no songs in the queue")]});
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
}