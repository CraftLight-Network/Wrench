const { Command } = require('discord.js-commando');
const signs = require('../../data/chinese-zodiac');

module.exports = class ChineseZodiacCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'chinese-zodiac',
			aliases: ['chinese-zodiac-sign', 'zodiac-chinese', 'chinesezodiac', 'cz'],
			group: 'helpful',
			memberName: 'chinese-zodiac',
			description: 'Calculates your Chinese Zodiac sign.',
			examples: ['cz 2012', 'cz 1994'],
			guildOnly: true,
			args: [
				{
					key: 'year',
					prompt: 'What year?',
					type: 'integer',
					min: 1
				}
			]
		});
	}
	run(msg, { year }) {
		return msg.say(`The Chinese Zodiac Sign for ${year} is ${signs[year % signs.length]}.`);
	}
};
