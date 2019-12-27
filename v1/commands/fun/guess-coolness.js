const { Command } = require('discord.js-commando');
const { Random, MersenneTwister19937 } = require("random-js");
const { stripIndents } = require('common-tags');

module.exports = class guessCoolnessCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'guess-coolness',
			aliases: ['coolness'],
			group: 'fun',
			memberName: 'guess-coolness',
			description: 'Guess a user\'s coolness amount.',
			examples: ['guess-coolness', 'guess-coolness @user'],
			guildOnly: true,
			args: [
				{
					key: 'user',
					prompt: 'Who do you want me to guess the coolness of?',
					type: 'user',
					default: msg => msg.author
				}
			]
		});
	}
	run(msg, { user }) {
		let color;
		let emoji;
		
		const date = new Date();
		const day = date.getDay();
		const month = date.getMonth() + 1;
		
		if (user.id === this.client.user.id) return msg.reply('Me? I\'m the second coolest person ever.');
		const authorUser = user.id === msg.author.id;
		if (user.id == 272466470510788608) return msg.reply(`${authorUser ? 'you are' : `${user.username} is`} the most epic person. 👌`);
			
		const random = new Random(MersenneTwister19937.seed(Math.abs(user.id)));
		const randomDate = new Random(MersenneTwister19937.seed(Math.abs(month - day)));
		const coolness = (random.integer(0, 100) - randomDate.integer(-25, 25));
		if (coolness < 30) {color = 0xFF0000; emoji = "❌"}
		if (coolness >= 30) {color = 0xFF7700; emoji = "😒"}
		if (coolness >= 50) {color = 0xFFFF00; emoji = "😏"}
		if (coolness >= 75) {color = 0x7FFF00; emoji = "👓"}
		if (coolness >= 90) {color = 0x00FF00; emoji = "🕶️"}
		
		return msg.embed({
			color: color,
			description: stripIndents`
				${authorUser ? 'you have' : `${user.username} has`} ${coolness} points. ${emoji}
			`
		});
	}
};
