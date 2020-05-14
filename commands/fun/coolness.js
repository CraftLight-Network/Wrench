// Define and require modules
const { Random, MersenneTwister19937 } = require("random-js");
const { Command } = require("discord.js-commando");
const embed = require("../../data/js/util").embed;
const { stripIndents } = require("common-tags");
const config = require("../../config");
const binary = require("binstring");
const date = new Date();

module.exports = class coolnessCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "coolness",
			"memberName": "coolness",
			"group": "fun",
			"description": "Calculate the coolness of a user.",
			"details": stripIndents`
				Run \`${config.prefix.commands}coolness [person]\` to calculate a user's coolness.
				**Notes:**
				[person]: Optional, who's coolness will be calculated.
				Arguments must be under 150 characters.
			`,
			"args": [
				{
					"key": "person",
					"prompt": "",
					"default": message => message.author.username,
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

	run(message, { person }) {
		// Calculate random numbers for coolness based on date and user ID
		const seed = new Random(MersenneTwister19937.seed(binary(person, { "out": "hex" }).replace(/[^0-9]/g, ""))).engine.data[0] +
		new Random(MersenneTwister19937.seed(date.getDate() - date.getDay())).engine.data[0];

		// Daily RNG
		const coolness = new Random(MersenneTwister19937.seed(seed)).integer(0, 100);

		// Define the emote to be used
		let style =					{ "emote": "shades",	"color": "#00FF00", "bar": "[===============   ]" };
		if (coolness < 75) style =	{ "emote": "check",		"color": "#FFFF00", "bar": "[===========       ]" };
		if (coolness < 50) style =	{ "emote": "meh",		"color": "#FF7700", "bar": "[=======           ]" };
		if (coolness < 25) style =	{ "emote": "cross",		"color": "#FF0000", "bar": "[===               ]" };

		// Max out/empty percent bar according to values
		if (coolness > 95) style.bar = "[==================]";
		if (coolness < 5) style.bar = "[                  ]";

		// Send the coolness
		const embedMessage = {
			"attachments": [`data/img/emotes/${style.emote}.png`],
			"title": "Coolness results:",
			"description": stripIndents`
				**${person} is ${coolness}% cool.**
				\`${style.bar}\`
			`,
			"color": style.color,
			"thumbnail": `attachment://${style.emote}.png`
		};
		return message.channel.send(embed(embedMessage, message));
	}
};