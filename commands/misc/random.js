// Define and require modules
const embed = require("../../data/js/util.js").embed;
const { Random, nativeMath } = require("random-js");
const { Command } = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const config = require("../../config");

module.exports = class randomCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "random",
			"memberName": "random",
			"aliases": ["rng"],
			"group": "misc",
			"description": "Choose a random number.",
			"details": stripIndents`
				Run \`${config.prefix.commands}random <min> <max>\` to choose a random number.
				**Notes:**
				<min>: Required, minimum number.
				<max>: Required, maximum number.
			`,
			"args": [
				{
					"key": "min",
					"prompt": "What is the minimum number?",
					"type": "integer"
				},
				{
					"key": "max",
					"prompt": "What is the maximum number?",
					"type": "integer"
				}
			],
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"throttling": {
				"usages": 2,
				"duration": 5
			}
		});
	}

	run(message, { min, max }) {
		// Make sure min is less than max
		if (min > max) [min, max] = [max, min];
		const random = new Random(nativeMath);

		const embedMessage = { "title": `Random Number ${min} - ${max}:`, "description": random.integer(min, max) };
		return message.channel.send(embed(embedMessage, message));
	}
};