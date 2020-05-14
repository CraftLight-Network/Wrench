// Define and require modules
const { Command } = require("discord.js-commando");
const embed = require("../../data/js/util").embed;
const { stripIndents } = require("common-tags");
const config = require("../../config");

module.exports = class charactersCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "characters",
			"memberName": "characters",
			"aliases": ["chars", "count"],
			"group": "misc",
			"description": "Count how many characters are in a message.",
			"details": stripIndents`
				Run \`${config.prefix.commands}characters <args>\` to count the characters in your message.
				**Notes:**
				<args>: Required, what the bot will count.
			`,
			"args": [
				{
					"key": "toCount",
					"prompt": "What is the message you would like to count?",
					"type": "string"
				}
			],
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"throttling": {
				"usages": 2,
				"duration": 5
			}
		});
	}

	run(message, { toCount }) {
		const embedMessage = { "title": "Character Count:", "description": toCount.length };
		return message.channel.send(embed(embedMessage, message));
	}
};