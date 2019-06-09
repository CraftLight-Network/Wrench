const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');
const { list } = require('../util');
const sentences = require('../../data/typing-test');
const difficulties = ['easy', 'medium', 'hard', 'extreme', 'impossible'];
const times = {
	easy: 25000,
	medium: 20000,
	hard: 15000,
	extreme: 10000,
	impossible: 5000
};

module.exports = class typingTestCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'typing-test',
			group: 'fun',
			aliases: ['typing'],
			memberName: 'typing-test',
			description: 'See how fast you can type a sentence in a given time limit.',
			examples: ['typing-test easy', 'typing-test hard'],
			details: `**Difficulties:** ${difficulties.join(', ')}`,
			guildOnly: true,
			args: [
				{
					key: 'difficulty',
					prompt: `What should the difficulty be? Either ${list(difficulties, 'or')}.`,
					type: 'string',
					oneOf: difficulties,
					parse: difficulty => difficulty.toLowerCase()
				}
			]
		});
	}

	async run(msg, { difficulty }) {
		const sentence = sentences[Math.floor(Math.random() * sentences.length)];
		const time = times[difficulty];
		await msg.reply(stripIndents`
			**You have ${time / 1000} seconds to type this sentence.**
			${sentence}
		`);
		const now = Date.now();
		const msgs = await msg.channel.awaitMessages(res => res.author.id === msg.author.id, {
			max: 1,
			time
		});
		if (!msgs.size || msgs.first().content !== sentence) return msg.reply('Sorry! You lose!');
		return msg.reply(`You are correct! (${(Date.now() - now) / 1000} seconds)`);
	}
};
