const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
module.exports = class ownercheckCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ownercheck',
            group: 'admin',
            memberName: 'ownercheck',
            description: 'Check if you are an owner or not.',
            examples: ['ownercheck'],
        });
    }
    hasPermission(msg) {
        if (!this.client.isOwner(msg.author)) {
				const embedred = new RichEmbed()
					.setDescription('According to my records, you are NOT the owner.')
					.setAuthor(`${msg.author.username},`)
					.setColor(0xff0000)
				return msg.embed(embedred);
			}
		return true;
    }
	
	run(msg) {
		const embedgreen = new RichEmbed()
            .setDescription('You are an owner of this bot. Just in case you didn\'t know.')
            .setAuthor(`${msg.author.username},`)
            .setColor(0x32CD32)
        return msg.embed(embedgreen);
	}
};