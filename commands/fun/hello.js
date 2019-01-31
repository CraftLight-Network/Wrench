const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

module.exports = class helloCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'hello',
			aliases: ['helloworld', 'test', 'commandtest', 'world'],
            group: 'fun',
            memberName: 'hello',
            description: 'Says hello.',
            examples: ['hello']
        });
    }
    run(msg) {
		const color = ((1 << 24) * Math.random() | 0).toString(16);
        const embed = new RichEmbed()
            .setDescription('Hello World!')
            .setColor(`#${color}`)
            .setTimestamp();
        return msg.embed(embed);
    }
};