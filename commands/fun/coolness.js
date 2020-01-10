// Define and require modules
const { Random, MersenneTwister19937 } = require("random-js");
const { Command } = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");
const config = require("../../config.json");
const date = new Date();

module.exports = class coolnessCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "coolness",
			"memberName": "coolness",
			"group": "fun",
			"description": "Calculate the coolness of a user.",
			"details": stripIndents`
				Run \`${config.prefix}coolness [user]\` to calculate a user's coolness.
				**Notes:**
				[user]: Required, who's coolness will be calculated.
				Valid format: \`@User#0000\`, \`User#0000\`, \`User\`. 
			`,
			"args": [
				{
					"key": "toCalculate",
					"prompt": "Who would you like me to calculate the coolness of?",
					"default": message => message.author,
					"type": "user"
				}
			],
			"throttling": {
				"usages": 2,
				"duration": 5
			}
		});
	}

	run(message, { toCalculate }) {
		// Calculate random numbers for coolness based on date and user ID
		const seed = new Random(MersenneTwister19937.seed(toCalculate.id));
		const random = new Random(MersenneTwister19937.seed(date.getDate() - date.getDay()));
		// Daily RNG
		const difference100 = seed.integer(0, 100) - 100;
		const differenceRest = 100 - seed.integer(0, 100);
		const coolness = seed.integer(0, 100) - random.integer(difference100, differenceRest);

		// Define the emote to be used
		let style =					{ "emote": "shades",	"color": "#00FF00", "bar": "[===============   ]" };
		if (coolness < 75) style =	{ "emote": "check",		"color": "#FFFF00", "bar": "[===========       ]" };
		if (coolness < 50) style =	{ "emote": "meh",		"color": "#FF7700", "bar": "[=======           ]" };
		if (coolness < 25) style =	{ "emote": "cross",		"color": "#FF0000", "bar": "[===               ]" };

		// Max out/empty percent bar according to values
		if (coolness === 100) style.bar = "[==================]";
		if (coolness === 0) style.bar = "[                  ]";

		const embed = new RichEmbed()
			.attachFiles([`data/img/emotes/${style.emote}.png`])
			.setAuthor(`${toCalculate.username} is ${coolness}% cool.`, `attachment://${style.emote}.png`)
			.setDescription(`\`${style.bar}\``)
			.setFooter(`Requested by ${message.author.tag}`)
			.setColor(style.color);
		return message.channel.send(embed);
	}
};