const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');

module.exports = class botinfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'bot-info',
			group: 'info',
			memberName: 'bot-info',
			description: 'Displays information about this bot.',
			throttling: {
				usages: 2,
				duration: 3
			}
		});
	}

	run(msg) {
		return msg.embed({
			color: 3447003,
			description: stripIndents`
				This is a bot made for use in the CustomCraft Network.
				If you would like to see this bot in action, go to https://customcraft.online
				
				Command prefix: ]
				Use ]help for help
				Report bugs to owner@customcraft.online
			`
		});
	}
};
