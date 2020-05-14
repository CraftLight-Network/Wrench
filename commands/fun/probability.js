// Define and require modules
const { Random, MersenneTwister19937 } = require("random-js");
const { Command } = require("discord.js-commando");
const embed = require("../../data/js/util").embed;
const { stripIndents } = require("common-tags");
const config = require("../../config");
const binary = require("binstring");

module.exports = class probabilityCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "probability",
			"memberName": "probability",
			"group": "fun",
			"description": "Calculate the probability between two topics.",
			"details": stripIndents`
				Run \`${config.prefix.commands}probability <topic1> <topic2>\` to calculate compatibility.
				**Notes:**
                <topic1>: Required, first topic to calculate.
                <topic2>: Required, second topic to calculate.
                Arguments must be under 150 characters.
			`,
			"args": [
				{
					"key": "topic1",
					"prompt": "What is the first topic?",
					"type": "string",
					"validate": arg => {
						if (arg.length < 150) return true;
						return "Please use under 150 characters!";
					}
				},
				{
					"key": "topic2",
					"prompt": "What is the second topic?",
					"type": "string",
					"validate": arg => {
						if (arg.length < 150) return true;
						return "Please use under 150 characters!";
					}
				}
			],
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"throttling": {
				"usages": 2,
				"duration": 5
			}
		});
	}

	run(message, { topic1, topic2 }) {
		// Calculate seed based on binary of persons
		const seed = new Random(MersenneTwister19937.seed(binary(topic1, { "out": "hex" }).replace(/[^0-9]/g, ""))).engine.data[0] +
		new Random(MersenneTwister19937.seed(binary(topic2, { "out": "hex" }).replace(/[^0-9]/g, ""))).engine.data[0];

		// Calculate number from 0 to 100 based on seed
		const probability = new Random(MersenneTwister19937.seed(seed)).integer(0, 100);

		// Define the emote to be used
		let style =						{ "emote": "two_hearts",		"color": "#00FF00", "bar": "[===============   ]" };
		if (probability < 75) style =	{ "emote": "sparkling_heart",	"color": "#FFFF00", "bar": "[===========       ]" };
		if (probability < 50) style =	{ "emote": "heart",				"color": "#FF7700", "bar": "[=======           ]" };
		if (probability < 25) style =	{ "emote": "broken_heart",		"color": "#FF0000", "bar": "[===               ]" };

		// Max out/empty percent bar according to values
		if (probability > 95) style.bar = "[==================]";
		if (probability < 5) style.bar = "[                  ]";

		// Send the probability
		const embedMessage = {
			"attachments": [`data/img/emotes/${style.emote}.png`],
			"title": "Ship results:",
			"description": stripIndents`
				**The probability of ${topic1} and ${topic2} is ${probability}%.**
				\`${style.bar}\`
			`,
			"thumbnail": `attachment://${style.emote}.png`,
			"color": style.color
		};
		return message.channel.send(embed(embedMessage, message));
	}
};