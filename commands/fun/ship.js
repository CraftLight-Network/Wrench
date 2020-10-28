// Define and require modules
const { Command }      = require("discord.js-commando");
const { stripIndents } = require("common-tags");
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
					},
					"parse": arg => {return this.client.translate(arg, "mentions")}
				},
				{
					"key":      "person2",
					"prompt":   "",
					"default":  message => message.author.username,
					"type":     "string",
					"validate": arg => {
						if (arg.length < 150) return true;
						return "Please use under 150 characters!";
					},
					"parse": arg => {return this.client.translate(arg, "mentions")}
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
		const seed = random.clone(seedrandom(person1.toLowerCase() + person2.toLowerCase()));
		const ship = seed.int(0, 100);

		// Define the emote to be used
		let style            = { "emote": "good", "color": "#9c36b5", "bar": "[===============   ]" };
		if (ship < 75) style = { "emote": "fine", "color": "#da77f2", "bar": "[===========       ]" };
		if (ship < 50) style = { "emote": "fair", "color": "#e64980", "bar": "[=======           ]" };
		if (ship < 25) style = { "emote": "bad",  "color": "#c92a2a", "bar": "[===               ]" };

		// Make sure the bar is always "accurate"
		if (ship > 95) style.bar = "[==================]";
		if (ship < 5)  style.bar = "[                  ]";

		// Send the ship
		return message.channel.send(this.client.embed({
			"message":     message,
			"attachments": [`data/img/emotes/ship/${style.emote}.png`],
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