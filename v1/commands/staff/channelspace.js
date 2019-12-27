const { Command } = require('discord.js-commando');

module.exports = class channelSpaceCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'channelspace',
			group: 'staff',
			aliases: ['space'],
			memberName: 'channelspace',
			description: 'Replaces all dashes with spaces in the channel name.',
			examples: ['channelspace'],
			guildOnly: true
		});
	}
	run(msg) {
	    var channel = msg.channel.name.replace(/-/g, "  ");
	    msg.channel.setName(channel);
	    msg.delete();
	}
};