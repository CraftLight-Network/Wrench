const { Command } = require('discord.js-commando');
const request = require('node-superfetch');

module.exports = class genderCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'gender',
			group: 'helpful',
			memberName: 'gender',
			description: 'Grab the gender of a real name.',
			guildOnly: true,
			args: [
				{
					key: 'name',
					prompt: 'What\'s the name you want to grab the gender of?',
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
			if (!body.gender) return msg.say(`I really don\'t know what gender ${body.name} is.`);
			return msg.say(`I'm ${body.probability * 100}% sure ${body.name} is a ${body.gender}`);
		} catch (err) {
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};
