const { Command } = require('discord.js-commando');
const config = require("../../config.json");
const auth = require("../../auth.json");
const { RichEmbed } = require('discord.js');
const RateLimiter = require('limiter').RateLimiter;
const TokenBucket = require('limiter').TokenBucket;
const { stripIndents } = require('common-tags');

const Enmap = require("enmap");
const { commandsRead, messagesRead, translationsDone, settings } = require('../../data/js/enmap.js');

if (config.translator === 'enabled') {
	if (config.provider === 'yandex') {
		var translator = require('yandex-translate')(auth.yandex);
		var link = 'http://cust.pw/yl';
	}
	if (config.provider === 'google') {
		var translator = require('google-translate')(auth.google);
		var link = 'http://cust.pw/gl';
	}
	if (config.provider === 'baidu') {
		var translator = require("baidu-translate-api");
		var link = 'http://cust.pw/bl';
	}
}

module.exports = class translateCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'translate',
			group: 'helpful',
			aliases: ['tran'],
			memberName: 'translate',
			description: 'Translate text to another language.',
			examples: ['translate en de Hello!', 'translate de es Hallo!'],
			guildOnly: true,
			details: stripIndents`
				**Languages** ${link}
				**To translate** Run \`translate <from> <to> <text to translate>\`
			`,

			args: [
				{
					key: 'langFrom',
					prompt: 'What language do you want to translate from?',
					type: 'string',
				},
				{
					key: 'langTo',
					prompt: 'What language do you want to translate to?',
					type: 'string',
				},
				{
					key: 'langTran',
					prompt: 'What do you want to translate?',
					type: 'string',
				}

			]
		});
	}
	run(msg, { langFrom, langTo, langTran }) {
		if (config.translator === 'enabled') {
			translationsDone.ensure("number", 0);
			let translate = `${langTran}`;
			if (msg.guild !== null) {
				let users = msg.guild.roles.get(msg.guild.id).members.map(m => m.user.username).join('|');
				translate = translate.replace(new RegExp(users, "gi"), '');
			}
	
			translate = translate.replace(/http.[^\s]*/gu, '')		// Links
			.replace(/<@.*>|@[^\s]+/gu, '')							// Mentions
			.replace(/<:.*>|:.*:/gu, '')							// Emojis
			.replace(/[^\p{L}1-9.,!?'"\-+\s]/giu, '')				// Symbols
			.replace(/`|\s+/gu, ' ').trim();						// Trimming
			
			if (config.provider === 'yandex') {
				translator.translate(translate, { from: `${langFrom}`, to: `${langTo}` }, (err, translated) => {
					if (`${translated.text}` === undefined) return msg.reply('you entered an invalid language! Go to http://cust.pw/tl to see availible languages!');
					translationsDone.inc("number");
					
					const embed = new RichEmbed()
					.setDescription(`**${translated.text}**`)
					.setAuthor(`${msg.author.username} (${translated.lang})`, msg.author.displayAvatarURL)
					.setColor(0x2F5EA3)
					.setFooter('Translations from Yandex.Translate (http://cust.pw/y)');
					return msg.channel.send(embed);
				});
			}
			if (config.provider === 'google') {
				const monthBucket = new TokenBucket('10000000', 'month', null);
				if (!monthBucket.tryRemoveTokens(msg.length)) return;
				const dayBucket = new TokenBucket('322580', 'day', null);
				if (!dayBucket.tryRemoveTokens(msg.length)) return;
				
				translator.translate(translate, `${langFrom}`, `${langTo}`, (err, translated) => {
					try {
						if (`${translated.translatedText}` === undefined) {return;}
					} catch (e) {return msg.reply('you entered an invalid language! Go to http://cust.pw/gl to see availible languages!')}
					translationsDone.inc("number");
					
					const embed = new RichEmbed()
					.setDescription(`**${translated.translatedText}**`)
					.setAuthor(`${msg.author.username} (${langFrom}-${langTo})`, msg.author.displayAvatarURL)
					.setColor(0x2F5EA3)
					.setFooter('Translations from Google Translate.');
					return msg.channel.send(embed);
				});
			}
			if (config.provider === 'baidu') {
				translator(translate, {from: `${langFrom}`, to: `${langTo}`}).then(translated => {
					if (translate === `${translated.trans_result.dst}`) return;
					translationsDone.inc("number");
	
					const embed = new RichEmbed()
					.setAuthor(`${msg.author.username} (${langFrom}-${langTo})`, msg.author.displayAvatarURL)
					.setDescription(`**${translated.trans_result.dst}**`)
					.setFooter('Translations from Baidu.')
					.setColor(0x2F5EA3);
					return msg.channel.send(embed);
				}).catch(function (error) {return msg.reply('you entered an invalid language! Go to http://cust.pw/bl to see availible languages!')});
			}
		} else return;
	}
};