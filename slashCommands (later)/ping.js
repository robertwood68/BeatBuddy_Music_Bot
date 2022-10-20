
/**
 * Responds to "//ping" with "Pong".
 * 
 * Mainly a test command, however it is left in for fun.
 * 
 * @author Robert Wood
 */
 const { SlashCommandBuilder } = require('@discordjs/builders', 'discord.js');

 module.exports = {
     data: new SlashCommandBuilder()
         .setName('ping')
         .setDescription('Replies with Pong!'),
     async execute(interaction) {
         await interaction.reply('Pong!');
     },
 };