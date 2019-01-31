const { Command } = require('discord.js-commando');
const { formatNumber } = require('../util');

module.exports = class CharacterCountCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'character-count',
			aliases: ['characters', 'chars', 'length', 'char'],
			group: 'fun',
			memberName: 'character-count',
			description: 'How many characters are in your argument.',
			examples: ['char Hello', 'char This has 17 chars'],
			args: [
				{
					key: 'text',
					prompt: 'What text would you like to get the character count of?',
					type: 'string'
				}
			]
		});
	}
	run(msg, { text }) {
		return msg.reply(formatNumber(text.length));
	}
};
