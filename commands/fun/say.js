const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
module.exports = class sayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'say',
			aliases: ['copycat', 'repeat', 'echo', 'parrot'],
            group: 'fun',
            memberName: 'say',
            description: 'Make the bot say things.',
            examples: ['say Hello', 'say The bot is talking!'],
			guildOnly: true,
			clientPermissions: ['MANAGE_MESSAGES'],
			throttling: {
				usages: 1,
				duration: 3
			},
			args: [
				{
					key: 'text',
					prompt: 'What would you like me to say?',
					type: 'string',
					validate: text => {
						if (text.length < 151) return true;
						return 'Command is too long! Please use less than 150 characters!';
					}
				}
			]
        });
    }
	run(msg, { text }) {
		msg.delete();
		return msg.say(text);
	}
};