const { Command } = require('discord.js-commando');
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
        if (!this.client.isOwner(msg.author)) return 'According to my records, you are NOT the owner.'
		return true;
    }
	run(msg) {
		return msg.say('You are an owner of this bot. Just in case you didn\'t know.');
	}
};