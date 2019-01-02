const Command = require('../Command');
const request = require('node-superfetch');

module.exports = class GuessGenderCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'guess-gender',
			aliases: ['gender', 'gender-guess', 'guess-my-gender'],
			group: 'guessing',
			memberName: 'guess-gender',
			description: 'Guess the gender of a user.',
			examples: ['guess-gender', 'guess-age @user'],
			args: [
				{
					key: 'name',
					prompt: 'Who do you want me to guess the gender of?',
					type: 'string'
				}
			]
		});
	}

	async run(msg, { name }) {
		try {
			const { body } = await request
				.get(`https://api.genderize.io/`)
				.query({ name });
			if (user.id === this.client.user.id) return msg.reply('I\'m a robot. How can I have chromosomes?');
			if (!body.gender) return msg.say(`I have no idea what gender ${body.name} is.`);
			return msg.say(`I'm ${body.probability * 100}% sure ${body.name} is a ${body.gender} name.`);
		} catch (err) {
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};
