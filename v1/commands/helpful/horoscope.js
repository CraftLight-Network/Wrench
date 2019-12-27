const { Command } = require('discord.js-commando');
const Discord = require("discord.js");
const request = require('node-superfetch');
const cheerio = require('cheerio');
const { list, firstUpperCase } = require('../util');
const signs = require('../../data/json/horoscope');

module.exports = class horoscopeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'horoscope',
			group: 'helpful',
			memberName: 'horoscope',
			description: 'Calculates today\'s horoscope.',
			details: `**Signs:** ${signs.join(', ')}`,
			clientPermissions: ['EMBED_LINKS'],
			guildOnly: true,
			args: [
				{
					key: 'sign',
					prompt: `What sign? Either ${list(signs, 'or')}.`,
					type: 'string',
					oneOf: signs,
					parse: sign => sign.toLowerCase()
				}
			]
		});
	}

	async run(msg, { sign }) {
		try {
			const horoscope = await this.fetchHoroscope(sign);
			const embed = new Discord.RichEmbed()
			.setColor(0x2F5EA3)
			.setTitle(`Horoscope for ${firstUpperCase(sign)}...`)
			.setURL(`https://new.theastrologer.com/${sign}/`)
			.setFooter('© Kelli Fox, The Astrologer')
			.setTimestamp()
			.setDescription(horoscope);
			msg.channel.send(embed)
		} catch (err) {
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}

	async fetchHoroscope(sign) {
		const { text } = await request.get(`https://new.theastrologer.com/${sign}/`);
		const $ = cheerio.load(text);
		return $('#today').find('p').first().text();
	}
};
