// Define and require modules
const { Command }      = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const embed            = require("../../data/js/util").embed;
const config           = require("../../config");

module.exports = class CharactersCommand extends Command {
	constructor(client) {
		super(client, {
			"name":        "characters",
			"memberName":  "characters",
			"group":       "misc",
			"description": "Count how many characters are in a message.",
			"details": stripIndents`
				Run \`${config.prefix.commands}characters <args>\` to count the characters in your message.
				**Notes:**
				<args>: Required, what the bot will count.
			`,
			"aliases":           ["chars", "count", "length"],
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"args": [
				{
					"key":    "toCount",
					"prompt": "What is the message you would like to count?",
					"type":   "string"
				}
			],
			"throttling": {
				"usages":   2,
				"duration": 5
			}
		});
	}

	run(message, { toCount }) {
		return message.channel.send(embed({ "message": message, "title": "Character Count:", "description": toCount.length }));
	}
};