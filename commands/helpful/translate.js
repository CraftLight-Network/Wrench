const { Command } = require('discord.js-commando');
const auth = require("../../auth.json");
const { RichEmbed } = require('discord.js');
const translate = require('yandex-translate')(auth.yandex);

module.exports = class translateCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'translate',
			group: 'helpful',
			aliases: ['tran'],
			memberName: 'translate',
			description: 'Translate text to another language.',
			examples: ['translate de Hello!', 'translate de es Hallo!'],
			guildOnly: true,
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
};
