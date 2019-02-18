const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');

module.exports = class disclaimerCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'disclaimer',
			group: 'info',
			memberName: 'disclaimer',
			description: 'Disclaimer about the bot's data usage.',
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
				__**!! DISCLAIMER !!**__
				
				This bot logs all commands used. The reason is to defend against hackers and monitor command usage. We do not and cannot (BY LAW) sell your data to advertisers or any companies. If you would not like to be logged, contact edude@edude.xyz.
			`
		});
	}
};
