const { Command } = require('discord.js-commando');
const moment = require('moment-timezone');
const { firstUpperCase } = require('../util');
moment.tz.link('America/Vancouver|Neopia');

module.exports = class timeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'time',
			aliases: ['time-zone', 'times'],
			group: 'helpful',
			memberName: 'time',
			description: 'Calculates what time it is in different time zones.',
			details: '**Zones:** <http://cust.pw/wtz>',
			args: [
				{
					key: 'timeZone',
					label: 'time zone',
					prompt: 'What time zone?',
					type: 'string',
					parse: timeZone => timeZone.replace(/ /g, '_').toLowerCase()
				}
			]
		});
	}

	run(msg, { timeZone }) {
		if (!moment.tz.zone(timeZone)) {
			return msg.reply('Invalid time zone. Refer to <http://cust.pw/wtz>.');
		}
		const time = moment().tz(timeZone).format('h:mm A');
		const location = timeZone.split('/');
		const main = firstUpperCase(location[0], /[_ ]/);
		const sub = location[1] ? firstUpperCase(location[1], /[_ ]/) : null;
		const subMain = location[2] ? firstUpperCase(location[2], /[_ ]/) : null;
		const parens = sub ? ` (${subMain ? `${sub}, ` : ''}${main})` : '';
		return msg.say(`The current time in ${subMain || sub || main}${parens} is ${time}.`);
	}
};
