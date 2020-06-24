// Define and require modules
const { Command }					   = require("discord.js-commando");
const { stripIndents }				   = require("common-tags");
const embed							   = require("../../data/js/util").embed;
const config						   = require("../../config");
const seedrandom					   = require("seedrandom");
const random						   = require("random");

module.exports = class probabilityCommand extends Command {
	constructor(client) {
		super(client, {
			"name":		   "probability",
			"memberName":  "probability",
			"group":	   "fun",
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
					"key":		"topic1",
					"prompt":	"What is the first topic?",
					"type":		"string",
					"validate":	arg => {
						if (arg.length < 150) return true;
						return "Please use under 150 characters!";
					}
				},
				{
					"key":		"topic2",
					"prompt":	"What is the second topic?",
					"type":		"string",
					"default":	"",
					"validate":	arg => {
						if (arg.length < 150) return true;
						return "Please use under 150 characters!";
					}
				}
			],
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"throttling": {
				"usages":	2,
				"duration":	5
			}
		});
	}

	run(message, { topic1, topic2 }) {
		// RNG based on topics
		let				   seed	= random.clone(seedrandom(topic1));
		if (topic2 !== "") seed	= random.clone(seedrandom(seed + topic2));
		const probability		= seed.int(0, 100);

		// Define the emote to be used
		let style =						{ "emote": "good_percentage",	  "color": "#00FF00", "bar": "[===============   ]" };
		if (probability < 75) style =	{ "emote": "okay_percentage",	  "color": "#FFFF00", "bar": "[===========       ]" };
		if (probability < 50) style =	{ "emote": "bad_percentage",	  "color": "#FF7700", "bar": "[=======           ]" };
		if (probability < 25) style =	{ "emote": "terrible_percentage", "color": "#FF0000", "bar": "[===               ]" };

		// Max out/empty percent bar according to values
		if (probability > 95) style.bar = "[==================]";
		if (probability < 5)  style.bar = "[                  ]";

		// >3 topics
		let topic3;
		topic2 = topic2.split("\" \"");
		if (topic2.length > 1) {
			topic3 = topic2.slice(0, topic2.length - 1);
			topic2 = topic2.slice(1, topic2.length);
		}

		// Send the probability
		return message.channel.send(embed({
			"message":	   message,
			"attachments": [`data/img/emotes/${style.emote}.png`],
			"title":	   "Probability results:",
			"description": stripIndents`
				**The probability of ${topic1}${topic2 ? `${topic3 ? `, ${topic3.join(", ")}, ` : " "}and ${topic2.join()} ` : ""}is ${probability}%.**
				\`${style.bar}\`
			`,
			"thumbnail":  `attachment://${style.emote}.png`,
			"color":	  style.color
		}));
	}
};