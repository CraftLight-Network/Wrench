const { Command } = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const config = require("../../config.json");

module.exports = class sayCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "say",
			"memberName": "say",
			"group": "misc",
			"description": "Make the bot say stuff.",
			"details": stripIndents`
				Run \`${config.prefix}say [args]\` to make the bot say anything.
				**Notes:**
				[args]: Required, what the bot will say.
				Arguments must be under 400 characters.
			`,
			"args": [
				{
					"key": "toSay",
					"prompt": "What would you like me to say?",
					"default": "",
					"type": "string",
					"validate": arg => {
						if (arg.length < 400) return true;
						return "please use under 400 characters!";
					}
				}
			]
		});
	}

	run(message, { toSay }) {
		if (toSay.length < 1) return;

		if (message.guild) {message.delete()};
		return message.say(toSay);
	}
};