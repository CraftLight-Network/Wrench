const { Command } = require('discord.js-commando');
module.exports = class helloCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'hello',
            group: 'group1',
            memberName: 'hello',
            description: 'Says hello.',
            examples: [']hello']
        });
    }
    run(msg) {
        return msg.say('Hello');
    }
};