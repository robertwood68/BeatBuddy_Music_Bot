/**
 * Replies with hey to whichever user sent the command.
 * 
 * @author Robert Wood
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Greets you back!')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false),
    async execute(interaction) {
        const responseEmbed = new EmbedBuilder().setColor("#0099E1");
        const username = interaction.user.username;
        interaction.reply({embeds: [responseEmbed.setDescription(`Hello ${username}!`)]})
    },
}