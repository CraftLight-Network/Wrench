// Define and require modules
const { Command } = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");
const config = require("../../config.json");

module.exports = class charactersCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "characters",
			"memberName": "characters",
			"aliases": ["chars"],
			"group": "misc",
			"description": "Count how many characters are in a message.",
			"details": stripIndents`
				Run \`${config.prefix}character [args]\` to count the characters in your message.
				**Notes:**
				[args]: Required, what the bot will count.
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
		const embed = new RichEmbed()
			.setDescription(stripIndents`
				**Character count:**
				${toCount.length}
			`)
			.setFooter(`Requested by ${message.author.tag}`)
			.setColor("#E3E3E3");

		return message.channel.send(embed);
	}
};