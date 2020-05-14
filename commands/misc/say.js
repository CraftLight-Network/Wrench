// Define and require modules
const { Command } = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const config = require("../../config");

module.exports = class sayCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "say",
			"memberName": "say",
			"group": "misc",
			"description": "Make the bot say stuff.",
			"details": stripIndents`
				Run \`${config.prefix.commands}say <message>\` to make the bot say anything.
				**Notes:**
				<message>: Required, what the bot will say.
				Arguments must be under 400 characters.
			`,
			"args": [
				{
					"key": "toSay",
					"prompt": "What would you like me to say?",
					"type": "string",
					"validate": arg => {
						if (arg.length < 400 || arg.length > 0) return true;
						return "Please use under 400 characters!";
					}
				}
			],
			"clientPermissions": ["MANAGE_MESSAGES", "SEND_MESSAGES"],
			"throttling": {
				"usages": 2,
				"duration": 5
			}
		});
	}

	run(message, { toSay }) {
		if (toSay.length < 1) return;

		if (message.guild) {message.delete()};
		return message.say(toSay);
	}
};