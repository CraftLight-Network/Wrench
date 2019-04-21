const discord = require('discord.js');
const Command = require('../base');

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'eval',
			group: 'util',
			memberName: 'eval',
			description: 'Executes JavaScript code.',
			details: 'Only the bot owner(s) may use this command.',
			ownerOnly: true,
		});
		this.lastResult = null;
	}

	run(msg) {
		msg.reply('Error: Executing JavaScript code is disabled. (eval disabled)')
	}
};
