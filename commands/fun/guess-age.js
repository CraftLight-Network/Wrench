const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');
const Random = require('random-js');

module.exports = class GuessAgeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'guess-age',
			aliases: ['guess-my-age', 'age-guess'],
			group: 'fun',
			memberName: 'guess-age',
			description: 'Guess a users age.',
			examples: ['guess-age', 'guess-age @user'],
			args: [
				{
					key: 'user',
					prompt: 'Who do you want me to guess the age of?',
					type: 'user',
					default: msg => msg.author
				}
			]
		});
	}
	run(msg, { user }) {
		if (user.id === this.client.user.id) return msg.reply('Me? Why do you want to know?');
		const authorUser = user.id === msg.author.id;
		if (user.id == 272466470510788608) return msg.reply(`I know ${authorUser ? 'you are' : `${user.username} is`} at least a year old, Edude.`)
		const random = new Random(Random.engines.mt19937().seed(user.id));
		const age = random.integer(10, 100);
		return msg.reply(oneLine`
			I think ${authorUser ? 'you are' : `${user.username} is`} ${age} years old.
		`);
	}
};
