/**
 * Clears a specified number of messages from the current text channel.
 * 
 * @author Robert Wood
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChatInputCommandInteraction} = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears a specified amount of messages from the text channel, may select specific user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false)
        .addNumberOption(options => options
            .setName('amount')
            .setDescription('Provide the number of messages to delete')
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)
        )
        .addStringOption(options => options
            .setName('reason')
            .setDescription('Provide the reason for deleting the messages')
            .setRequired(true)
        )
        .addUserOption(options => options
            .setName('target')
            .setDescription('Provide the member whose messages you want to delete')
        ),
    async execute(interaction) {
        const amount = interaction.options.getNumber('amount');
        const reason = interaction.options.getString('reason');
        const target = interaction.options.getUser('target');

        const channelMessages = await interaction.channel.messages.fetch();
        const responseEmbed = new EmbedBuilder().setColor("#0099E1");

        if (target) {
            let i = 0;
            let messagesToDelete = [];
            channelMessages.filter((message) => {
                if (message.author.id === target.id && amount > i) {
                    messagesToDelete.push(message);
                    i++;
                }
            })
            interaction.channel.bulkDelete(messagesToDelete, true).then((messages) => {
                interaction.reply({embeds: [responseEmbed.setDescription(`${messages.size} messages deleted`)], ephemeral: true})
                console.log("Messages deleted");
            })
        } else {
            interaction.channel.bulkDelete(amount, true).then((messages) => {
                interaction.reply({embeds: [responseEmbed.setDescription('Messages Cleared')], ephemeral: true})
                console.log("Messages deleted");
            })
            console.log(reason);
        }
    }
}