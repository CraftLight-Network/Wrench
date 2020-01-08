// Define and require modules
const { Random, nativeMath } = require("random-js");
const { Command } = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");
const config = require("../../config.json");

module.exports = class randomCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "random",
			"memberName": "random",
			"aliases": ["rng"],
			"group": "misc",
			"description": "Choose a random number.",
			"details": stripIndents`
				Run \`${config.prefix}random [args]\` to choose a random number.
				**Notes:**
				[min]: Required, minimum number.
				[max]: Required, maximum number.
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
			"throttling": {
				"usages": 2,
				"duration": 5
			}
		});
	}

	run(message, { min, max }) {
		// Get the random number
		const random = new Random(nativeMath);
		const number = random.integer(min, max);

		const embed = new RichEmbed()
			.setDescription(stripIndents`
				**Random Number:**
				${number}
			`)
			.setFooter(`Requested by ${message.author.tag}`)
			.setColor("#E3E3E3");

		return message.channel.send(embed);
	}
};