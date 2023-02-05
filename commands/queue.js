const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

/**
 * Outputs the current song and the next ten songs following it as an embed.
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Outputs the current and next ten songs in the queue')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages, PermissionFlagsBits.Connect, PermissionFlagsBits.SendMessages)
        .setDMPermission(false),
    async execute (client, interaction) {
        if (typeof client.queue === 'undefined') { // if queue doesn't exist
            const embed = new EmbedBuilder()
                .setColor('#0099E1')
                .setDescription('There are no songs in the queue');
            return await interaction.reply({embeds: [embed]});
        }
        const songQueue = client.queue.get(`${interaction.guild.id}`);

        let index = 1;
        let str = "";

        try {
            if (songQueue.songs[0]) str += `**Currently playing:**\n ${songQueue.songs[0].title}\n\n`;

            if (songQueue.songs[1]) str += `**Next Songs In Queue:**\n ${songQueue.songs.slice(1, 11).map(x => `**${index++})** ${x.title}\n Artist: **${x.artist}** \n Requested by: **${x.requester}**`).join("\n\n")}`;
        } catch {
            const embed = new EmbedBuilder()
                .setColor('#0099E1')
                .setDescription('There are no songs in the queue');
            return await interaction.reply({embeds: [embed]});
        }

        const embed = new EmbedBuilder()
            .setAuthor({name: `${interaction.guild.name}'s Queue`})
            .setColor('#0099E1')
            .setDescription(str)
            .setThumbnail(songQueue.songs[0].thumbnail);
        await interaction.reply({embeds: [embed]});
    }
}