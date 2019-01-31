const { Command } = require('discord.js-commando');
const Random = require('random-js');

module.exports = class GuessIQCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'guess-iq',
			aliases: ['intelligence-quotient', 'smart', 'howsmart', 'iq'],
			group: 'fun',
			memberName: 'guess-iq',
			description: 'Guesses a user\'s IQ.',
			examples: ['iq @user', 'iq @Edude42#2222'],
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
		if (user.id === this.client.user.id) return msg.reply('I have the power of code and the internet. So basically, ∞');
		if (user.id == 272466470510788608) return msg.reply(`${user.id === msg.author.id ? 'Your' : `${user.username}'s`} IQ is over the 64 bit integer limit.`);
		const random = new Random(Random.engines.mt19937().seed(user.id));
		const score = random.integer(20, 170);
		return msg.reply(`${user.id === msg.author.id ? 'Your' : `${user.username}'s`} IQ is ${score}.`);
	}
};
