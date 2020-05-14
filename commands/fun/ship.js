// Define and require modules
const { Random, MersenneTwister19937 } = require("random-js");
const { Command } = require("discord.js-commando");
const embed = require("../../data/js/util").embed;
const { stripIndents } = require("common-tags");
const config = require("../../config");
const binary = require("binstring");

module.exports = class shipCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "ship",
			"memberName": "ship",
			"group": "fun",
			"description": "Calculate the compatibility between two users.",
			"details": stripIndents`
				Run \`${config.prefix.commands}ship [person1] [person2]\` to calculate compatibility.
				**Notes:**
                [person1]: Required, first person to calculate.
                [person2]: Required, second person to calculate.
                Valid format: \`@User#0000\`, \`User\`.
                Arguments must be under 25 characters.
			`,
			"args": [
				{
					"key": "person1",
					"prompt": "Who is the first person you would like to ship?",
					"type": "string",
					"validate": arg => {
						if (arg.length < 150) return true;
						return "Please use under 150 characters!";
					}
				},
				{
					"key": "person2",
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

	run(message, { person1, person2 }) {
		// Calculate seed based on binary of persons
		const seed = new Random(MersenneTwister19937.seed(binary(person1, { "out": "hex" }).replace(/[^0-9]/g, ""))).engine.data[0] +
		new Random(MersenneTwister19937.seed(binary(person2, { "out": "hex" }).replace(/[^0-9]/g, ""))).engine.data[0];

		// Calculate number from 0 to 100 based on seed
		const ship = new Random(MersenneTwister19937.seed(seed)).integer(0, 100);

		// Define the emote to be used
		let style =				{ "emote": "two_hearts",		"color": "#9000FF", "bar": "[===============   ]" };
		if (ship < 75) style =	{ "emote": "sparkling_heart",	"color": "#FF00FD", "bar": "[===========       ]" };
		if (ship < 50) style =	{ "emote": "heart",				"color": "#FF007F", "bar": "[=======           ]" };
		if (ship < 25) style =	{ "emote": "broken_heart",		"color": "#FF0000", "bar": "[===               ]" };

		// Max out/empty percent bar according to values
		if (ship > 95) style.bar = "[==================]";
		if (ship < 5) style.bar = "[                  ]";

		// Send the ship
		const embedMessage = {
			"attachments": [`data/img/emotes/${style.emote}.png`],
			"title": "Ship results:",
			"description": stripIndents`
				**${person1} and ${person2} are ${ship}% compatible.**
				\`${style.bar}\`
			`,
			"thumbnail": `attachment://${style.emote}.png`,
			"color": style.color
		};
		return message.channel.send(embed(embedMessage, message));
	}
};