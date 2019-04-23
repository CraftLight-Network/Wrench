const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const Random = require('random-js');

module.exports = class guessCoolnessCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'guess-coolness',
			aliases: ['coolness', 'coolness-guess'],
			group: 'fun',
			memberName: 'guess-coolness',
			description: 'Guess a user\'s coolness amount.',
			examples: ['guess-coolness', 'guess-coolness @user'],
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
		if (user.id === this.client.user.id) return msg.reply('Me? I\'m the second coolest person ever.');
		const authorUser = user.id === msg.author.id;
		if (user.id == 272466470510788608) return msg.reply(`${authorUser ? 'you are' : `${user.username} is`} the most epic person. 👌`)
		const random = new Random(Random.engines.mt19937().seed(user.id));
		const number = new Random();
		const coolness = random.integer(1, 100) + number.integer(-25, 25);
		if (coolness < 50 ) {
			var embed = new RichEmbed()
				.setDescription(`${authorUser ? 'you have' : `${user.username} has`} ${coolness} points.`)
				.setColor(`#ff0000`)
				.setTimestamp();
			return msg.embed(embed);
		};
		if (coolness >= 50 ) {
			var embed = new RichEmbed()
				.setDescription(`${authorUser ? 'you have' : `${user.username} has`} ${coolness} points.`)
				.setColor(`#32CD32`)
				.setTimestamp();
			return msg.embed(embed);
		}
	}
};
