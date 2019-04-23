const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');
const Random = require('random-js');

const { activities } = require('../commandfiles/guess-activity');

module.exports = class GuessActivityCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'guess-activity',
			aliases: ['activity', 'activities', 'doing', 'guess-activities'],
			group: 'fun',
			memberName: 'guess-activity',
			description: 'Guess what a user is doing.',
			examples: ['guess-activity', 'guess-activity @user'],
			args: [
				{
					key: 'user',
					prompt: 'Who do you want me to guess the activity of?',
					type: 'user',
					default: msg => msg.author
				}
			]
		});
	}
	run(msg, { user }) {
		if (user.id === this.client.user.id) return msg.reply('Oh, I\'m just doing some coding, ~~taking over the government.~~ You know, just the normal stuff.');
		const authorUser = user.id === msg.author.id;
		const random = new Random();
		const activity = activities[random.integer(0, activities.length - 1)];
		if (user.id == 272466470510788608) return msg.reply(`I think ${authorUser ? 'you are' : `${user.username} is`} helping me ~~take over the government,~~ uh, I mean, code.`);
		return msg.reply(oneLine`
			I think ${authorUser ? 'you are' : `${user.username} is`} ${activity}
		`);
	}
};
