const { Command } = require('discord.js-commando');
const { Random, MersenneTwister19937 } = require("random-js");
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
	    const date = new Date();
	    const day = date.getDay();
	    const month = date.getMonth() + 1;
	    let color;
	    let emoji;
	    
		if (first.id === second.id) return msg.reply('You can\'t ship yourself. It never works out.');
		const botText = first.id === this.client.user.id || second.id === this.client.user.id
			? `But ${first.id === msg.author.id || second.id === msg.author.id ? 'you\'re' : 'they\'re'} not a robot. So, it doesn't work out.`
			: '';
		
		const random = new Random(MersenneTwister19937.seed(Math.abs(first.id - second.id)));
		const randomDate = new Random(MersenneTwister19937.seed(Math.abs(month - day)));
		const level = (random.integer(0, 100) - randomDate.integer(0, 15));
		if (level < 30) {color = 0xFF0000; emoji = "❌"}
		if (level >= 30) {color = 0xFF7700; emoji = "💔"}
		if (level >= 50) {color = 0xFFFF00; emoji = "❤"}
		if (level >= 75) {color = 0x7FFF00; emoji = "💓"}
		if (level >= 90) {color = 0x00FF00; emoji = "💕"}
		
		return msg.embed({
			color: color,
			description: stripIndents`
				${first.id === this.client.user.id ? 'Me' : first.username} and ${second.id === this.client.user.id ? 'me' : second.username} have a compatability of... **${level}%**! ${botText} ${emoji}
			`
		});
	}
};