// Define and require modules
const { Command }      = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const embed            = require("../../data/js/util").embed;
const util             = require("../../data/js/util");
const config           = require("../../config");
const seedrandom       = require("seedrandom");
const random           = require("random");

module.exports = class CoolnessCommand extends Command {
	constructor(client) {
		super(client, {
			"name":        "coolness",
			"memberName":  "coolness",
			"group":       "fun",
			"description": "Calculate the coolness of a user.",
			"details": stripIndents`
				Run \`${config.prefix.commands}coolness [person]\` to calculate a user's coolness.
				**Notes:**
				[person]: Optional, who's coolness will be calculated.
				Arguments must be under 150 characters.
			`,
			"args": [
				{
					"key":      "person",
					"prompt":   "",
					"default":  message => message.author.username,
					"type":     "string",
					"validate": arg => {
						if (arg.length < 100) return true;
						return "Please use under 100 characters!";
					},
					"parse": arg => {
						if (arg.indexOf("<@!") !== 0) return arg;
						else return this.client.users.cache.get(arg.replace(/<@!(\d+)>/, "$1")).username;
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

	run(message, { person }) {
		// RNG based on person and day
		const date   = new Date();
		const seed   = random.clone(seedrandom(person.toLowerCase() + date.getMonth().toString() + date.getDate().toString()));
		let coolness = seed.int(0, 100);

		// Easter-egg
		// Detect if a person was specified
		let int = person.split(" ");
		if (int.length > 1) {
			person = int[0];
			int    = int[1];
		}

		// Egg payload
		if (util.range(parseInt(int), 0, 100)) {
			coolness = parseInt(int);
			if (person === int[0]) person = message.author.username;
		}

		// Define the emote to be used
		let style                = { "emote": "good_shades",  "color": "#8ce99a", "bar": "[===============   ]" };
		if (coolness < 75) style = { "emote": "okay_check",   "color": "#ffe066", "bar": "[===========       ]" };
		if (coolness < 50) style = { "emote": "bad_unamused", "color": "#fd7e14", "bar": "[=======           ]" };
		if (coolness < 25) style = { "emote": "cross",        "color": "#f03e3e", "bar": "[===               ]" };

		// Make sure the bar is always "accurate"
		if (coolness > 95) style.bar = "[==================]";
		if (coolness < 5)  style.bar = "[                  ]";

		// Send the coolness
		return message.channel.send(embed({
			"message":     message,
			"attachments": [`data/img/emotes/${style.emote}.png`],
			"title":       "Coolness results:",
			"description": stripIndents`
				**${person} is ${coolness}% cool.**
				\`${style.bar}\`
			`,
			"color":       style.color,
			"thumbnail":   `attachment://${style.emote}.png`
		}));
	}
};