/**
 * Replies with hey to whichever user sent the command.
 * 
 * @author Robert Wood
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder() 
        .setName('servercount')
        .setDescription('shows the number of servers that BeatBuddy is in')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),
    async execute(client, interaction) {
        const responseEmbed = new EmbedBuilder().setColor("#0099E1");
        interaction.reply({embeds: [responseEmbed.setDescription(`I'm currently being used in ${client.guilds.cache.size} servers`)]})
    }
}
