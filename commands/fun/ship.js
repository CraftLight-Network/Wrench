const { Command } = require('discord.js-commando');
const Random = require('random-js');
const { stripIndents } = require('common-tags');

module.exports = class shipCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ship',
			aliases: ['relation', 'relationship', 'love'],
			group: 'fun',
			memberName: 'ship',
			description: 'Determines the love between two users.',
			guildOnly: true,
			args: [
				{
					key: 'first',
					label: 'first user',
					prompt: 'Who is the first user in the ship?',
					type: 'user'
				},
				{
					key: 'second',
					label: 'second user',
					prompt: 'Who is the second user in the ship?',
					type: 'user',
					default: msg => msg.author
				}
			]
		});
	}

	run(msg, { first, second }) {
		if (first.id === second.id) return msg.reply('I know it\'s the 21st century, but nobody can be biologically asexual.');
		const botText = first.id === this.client.user.id || second.id === this.client.user.id
			? `But ${first.id === msg.author.id || second.id === msg.author.id ? 'you\'re' : 'they\'re'} not a robot. So, it doesn't work out.`
			: '';
		const random = new Random(Random.engines.mt19937().seed(Math.abs(first.id - second.id)));
		const level = random.integer(0, 100);
		if (level >= 50) {
			var color = 0x32CD32
			var emoji = "💓"
		};
		if (level < 50) {
			var color = 0xff0000
			var emoji = "💔"
		};
		return msg.embed({
			color: color,
			description: stripIndents`
				${first.id === this.client.user.id ? 'Me' : first.username} and ${second.id === this.client.user.id ? 'me' : second.username} have a compatability of... **${level}%**! ${botText} ${emoji}
			`
		});
	}
};
