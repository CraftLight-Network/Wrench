const { Command } = require('discord.js-commando');
const { Random, MersenneTwister19937 } = require("random-js");
const { stripIndents } = require('common-tags');

module.exports = class GuessIQCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'guess-iq',
			aliases: ['iq'],
			group: 'fun',
			memberName: 'guess-iq',
			description: 'Guesses a user\'s IQ.',
			examples: ['guess-iq', 'guess-iq @user'],
			guildOnly: true,
			args: [
				{
					key: 'user',
					prompt: 'Who do you want me to guess the IQ of?',
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
		
		if (user.id === this.client.user.id) return msg.reply('I have the power of code and the internet. So basically, ∞');
		const authorUser = user.id === msg.author.id;
		if (user.id == 272466470510788608) return msg.reply(`${user.id === msg.author.id ? 'Your' : `${user.username}'s`} IQ is over the 64 bit integer limit.`);
		
		const random = new Random(MersenneTwister19937.seed(Math.abs(user.id)));
		const randomDate = new Random(MersenneTwister19937.seed(Math.abs(month - day)));
		const iq = (random.integer(25, 228) - randomDate.integer(-25, 25));
		if (iq < 50) {color = 0xFF0000; emoji = "❌"}
		if (iq >= 50) {color = 0xFF7700; emoji = "😒"}
		if (iq >= 100) {color = 0xFFFF00; emoji = "🤓"}
		if (iq >= 150) {color = 0x7FFF00; emoji = "👓"}
		if (iq >= 200) {color = 0x00FF00; emoji = "🧠"}
		
		return msg.embed({
			color: color,
			description: stripIndents`
				${authorUser ? 'your' : `${user.username}'s`} IQ is ${iq}. ${emoji}
			`
		});
	}
};
