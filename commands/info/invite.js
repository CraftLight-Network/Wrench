const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');

module.exports = class inviteCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'invite',
			group: 'info',
			memberName: 'invite',
			description: 'Invite the bot to your server!',
			throttling: {
				usages: 2,
				duration: 3
			}
		});
	}
	run(msg) {
		return msg.embed({
			color: 4021408,
			description: stripIndents`
				__**Invite me to your server!**__
				
				http://bit.ly/WrenchBot
			`
		});
	}
};
