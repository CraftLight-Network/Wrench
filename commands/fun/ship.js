// Define and require modules
const { Command }      = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const embed            = require("../../data/js/util").embed;
const config           = require("../../config");
const seedrandom       = require("seedrandom");
const random           = require("random");

module.exports = class ShipCommand extends Command {
	constructor(client) {
		super(client, {
			"name":        "ship",
			"memberName":  "ship",
			"group":       "fun",
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
					"key":      "person1",
					"prompt":   "Who is the first person you would like to ship?",
					"type":     "string",
					"validate": arg => {
						if (arg.length < 150) return true;
						return "Please use under 150 characters!";
					}
				},
				{
					"key":      "person2",
					"prompt":   "",
					"default":  message => message.author.username,
					"type":     "string",
					"validate": arg => {
						if (arg.length < 150) return true;
						return "Please use under 150 characters!";
					}
				}
			],
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"throttling": {
				"usages":   2,
				"duration": 5
			}
		});
	}

	run(message, { person1, person2 }) {
		const seed = random.clone(seedrandom(person1 + person2));
		const ship = seed.int(0, 100);

		// Define the emote to be used
		let style            = { "emote": "two_hearts",      "color": "#9c36b5", "bar": "[===============   ]" };
		if (ship < 75) style = { "emote": "sparkling_heart", "color": "#da77f2", "bar": "[===========       ]" };
		if (ship < 50) style = { "emote": "heart",           "color": "#e64980", "bar": "[=======           ]" };
		if (ship < 25) style = { "emote": "broken_heart",    "color": "#c92a2a", "bar": "[===               ]" };

		// Max out/empty percent bar according to values
		if (ship > 95) style.bar = "[==================]";
		if (ship < 5)  style.bar = "[                  ]";

		// Send the ship
		return message.channel.send(embed({
			"message":     message,
			"attachments": [`data/img/emotes/${style.emote}.png`],
			"title":       "Ship results:",
			"description": stripIndents`
				**${person1} and ${person2} are ${ship}% compatible.**
				\`${style.bar}\`
			`,
			"thumbnail":   `attachment://${style.emote}.png`,
			"color":       style.color
		}));
	}
};