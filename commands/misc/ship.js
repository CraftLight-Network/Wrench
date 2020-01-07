// Define and require modules
const { Random, MersenneTwister19937 } = require("random-js");
const { Command } = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");
const config = require("../../config.json");
const binary = require("binstring");

module.exports = class shipCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "ship",
			"memberName": "ship",
			"group": "misc",
			"description": "Calculate the compatibility between two users.",
			"details": stripIndents`
				Run \`${config.prefix}ship [person1] [person2]\` to calculate compatibility.
				**Notes:**
                [user1]: Required, first person to calculate.
                [user2]: Required, second person to calculate.
                Valid format: \`@User#0000\`, \`User\`.
                Arguments must be under 25 characters.
			`,
			"args": [
				{
					"key": "person1",
					"prompt": "Who is the first person you would like to ship?",
					"type": "string",
					"validate": arg => {
						if (arg.length < 25) return true;
						return "please use under 25 characters!";
					}
				},
				{
					"key": "person2",
					"prompt": "Who is the second person you would like to ship?",
					"type": "string",
					"validate": arg => {
						if (arg.length < 25) return true;
						return "Please use under 25 characters!";
					}
				}
			],
			"throttling": {
				"usages": 2,
				"duration": 5
			}
		});
	}

	run(message, { person1, person2 }) {
		// Turn mentions into strings
		if (person1.match(/<@![0-9]*>/)) {
			if (!message.guild) return message.reply("Do not use mentions in DM's!");
			try {person1 = message.guild.member(person1.replace(/[<@!>]/g, "")).displayName} catch (error) {message.reply("I'm not sure who person 1 is.")};
		}

		if (person2.match(/<@![0-9]*>/)) {
			if (!message.guild) return message.reply("Do not use mentions in DM's!");
			try {person2 = message.guild.member(person2.replace(/[<@!>]/g, "")).displayName} catch (error) {message.reply("I'm not sure who person 2 is.")};
		}

		// Calculate seed based on binary of persons
		const seed = new Random(MersenneTwister19937.seed(binary(person1, { "out": "hex" }).replace(/[^0-9]/g, ""))).engine.data[0] +
		new Random(MersenneTwister19937.seed(binary(person2, { "out": "hex" }).replace(/[^0-9]/g, ""))).engine.data[0];

		// Calculate number from 0 to 100 based on seed
		const ship = new Random(MersenneTwister19937.seed(seed)).integer(0, 100);

		// Define the emote to be used
		let style =				{ "emote": "two_hearts",		"color": "#9000FF" };
		if (ship < 75) style =	{ "emote": "sparkling_heart",	"color": "#FF00FD" };
		if (ship < 50) style =	{ "emote": "heart",				"color": "#FF007F" };
		if (ship < 25) style =	{ "emote": "broken_heart",		"color": "#FF0000" };

		const embed = new RichEmbed()
			.attachFiles([`data/img/emotes/${style.emote}.png`])
			.setAuthor(`${person1} and ${person2} are ${ship}% compatible.`, `attachment://${style.emote}.png`)
			.setFooter(`Requested by ${message.author.tag}`)
			.setColor(style.color);
		return message.channel.send(embed);
	}
};