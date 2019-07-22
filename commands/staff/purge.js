const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

module.exports = class purgeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'purge',
			aliases: ['prune'],
			group: 'staff',
			memberName: 'purge',
			description: 'Delete a specified number of messages',
			examples: ['purge 25'],
			guildOnly: true,
			userPermissions: ['MANAGE_GUILD', 'MANAGE_MESSAGES'],
			args: [
				{
					key: 'number',
					prompt: 'How many messages would you like to purge? Max: 99',
					type: 'integer',
					validate: text => {
						if (text <= 99 && text > 2) return true;
						return 'please keep under 99 and over 2 messages!';
					}
				}
			]
		});
	}
	run(msg, { number }) {
		msg.channel.bulkDelete(number + 1)
	}
};