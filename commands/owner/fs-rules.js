const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

const embed = {
  "description": "*Make sure to read these!*",
  "url": "https://fs.customcraft.online/rules",
  "color": 13391104,
  "timestamp": "2019-01-02T02:14:37.177Z",
  "footer": {
    "text": "Changes last made on"
  },
  "author": {
    "name": "FS: WNC Rules",
    "icon_url": "https://i.imgur.com/20dLU7r.png"
  },
  "fields": [
    {
      "name": "-=General Rules=-",
      "value": "***1.***  *Do not post ANY nsfw or self harm content.*\n***2.*** *Do not make offensive comments.*\n***3.*** *Only RP in RP channels. (Check information)*\n***4.*** *Obey the staff.*\n***5.*** *Do not spam.*\n***6.*** *Only use bot commands in #robots*\n***7.*** *Do not advertise, unless showing off a FS video.*\n***8.*** *Please use common sense.\n    If you're unsure, ask or don't do it.*)\n \u200b​ "
    },
    {
      "name": "-=Order of Warnings=-",
      "value": "***• Muted for 15 minutes after 3 infractions\n• Muted for a week after 10 infractions\n• Ban for a month after 15 infractions\n• Ban after 20 infractions***\n \u200b​ "
    },
    {
      "name": "-=Admin Rules=-",
      "value": "***1.*** *Do not abuse bots.*\n***2.*** *Do not abuse your powers.*\n***3.*** *Obey the member rules.*\n**!!!** *If you are found violating these rules,\n     your admin rank will permanently be removed.*\n \u200b ​"
    }
  ]
};

module.exports = class fsrulesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'fs-rules',
			aliases: ['fs rules'],
            group: 'owner',
            memberName: 'fs-rules',
            description: 'Embed FS: WNC\'s rules',
            examples: ['fs-rules'],
			guildOnly: false,
			userPermissions: ['ADMINISTRATOR'],
			clientPermissions: ['ADMINISTRATOR'],
			throttling: {
				usages: 1,
				duration: 60
			},
        });
    }
	run(msg) {
		msg.delete();
		return msg.say({embed});
	}
};


