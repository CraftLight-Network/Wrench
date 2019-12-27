const { Command } = require('discord.js-commando');

module.exports = class AgeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'age',
			group: 'helpful',
			aliases: ['calc-age', 'calcage', 'whatage', 'what-age'],
			memberName: 'age',
			description: 'Calculates how old a person is, or when they were born.',
			examples: ['age 2012', 'age 23'],
			guildOnly: true,
			args: [
				{
					key: 'year',
					prompt: 'What age or year?',
					type: 'integer',
					min: 1
				}
			]
		});
	}
	run(msg, { year }) {
		const currentYear = new Date().getFullYear();
		if (year < 175) {
			msg.say(`Someone who is ${year} would be born in ${currentYear - year}.`);
		} else {
		msg.say(`Someone born in ${year} would be ${currentYear - year} years old.`);
		}
	}
};
