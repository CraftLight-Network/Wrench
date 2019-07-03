const { Command } = require('discord.js-commando');
const config = require("../../config.json");
const auth = require("../../auth.json");
const { RichEmbed } = require('discord.js');
const RateLimiter = require('limiter').RateLimiter;
const TokenBucket = require('limiter').TokenBucket;
const { stripIndents } = require('common-tags');

if (config.translator === 'enabled') {
	if (config.provider === 'yandex') {
		var translate = require('yandex-translate')(auth.yandex); // Get Yandex API key
		var link = 'http://cust.pw/tl'
	} else if (config.provider === 'google') {
		var translate = require('google-translate')(auth.google); // Get Google API key
		var link = 'http://cust.pw/gl'
	}
};

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
			if (config.provider === 'yandex') {
				translate.translate(`${langTran}`, { from: `${langFrom}`, to: `${langTo}` }, (err, res) => {
					if (`${res.text}` == 'undefined') {
						msg.reply('you entered an invalid language! Go to http://cust.pw/tl to see availible languages!')
					} else {
						const embed = new RichEmbed()
						.setDescription(`**${res.text}**`)
						.setAuthor(`${msg.author.username} (${res.lang})`, msg.author.displayAvatarURL)
						.setColor(0x2F5EA3)
						.setFooter('Translations from Yandex.Translate (http://cust.pw/y)')
						return msg.channel.send(embed);
					}
				});
			}
			if (config.provider === 'google') {
				const limiter = new RateLimiter(100, 100000);
				limiter.removeTokens(1, function(err, remainingRequests) {
					var FILL_RATE = 1024 * 1024 * 1048576;
					const bucket = new TokenBucket(FILL_RATE, 'day', null);
					bucket.removeTokens(`${langTran}`, function() {
						translate.translate(`${langTran}`, `${langFrom}`, `${langTo}`, (err, translation) => {
							try {
								if (`${translation.translatedText}` == 'undefined') {return;}
							} catch (e) {
								msg.reply('you entered an invalid language! Go to http://cust.pw/gl to see availible languages!')
								return
							};
							const embed = new RichEmbed()
							.setDescription(`**${translation.translatedText}**`)
							.setAuthor(`${msg.author.username} (${langFrom}-${langTo})`, msg.author.displayAvatarURL)
							.setColor(0x2F5EA3)
							return msg.channel.send(embed);
						});
					});
				});
			}
		} else {
			return;
		}
	}
};
