// Define and require modules
const { Command }      = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const config           = require("../../config");

const u = {
	"fahrenheit": ["f", "fahrenheit", "fahrenhiet", "farenheight", "farenhieght"],
	"celsius":    ["c", "celsius", "celcius"],
	"kelvin":     ["k", "kelvin"],
	"feet":       ["f", "feet", "foot"],
	"meters":     ["m", "meters", "meter", "metres", "metre"]
};

const conversions = [
	{
		"aliases": u.celsius,
		"to": [
			{
				"aliases": u.fahrenheit,
				"function": (u) => {return (u * 1.8) + 32}
			},
			{
				"aliases": u.kelvin,
				"function": (u) => {return u + 273.15}
			}
		]
	},
	{
		"aliases": u.fahrenheit,
		"to": [
			{
				"aliases": u.celsius,
				"function": (u) => {return (u - 32) * 0.55}
			},
			{
				"aliases": u.kelvin,
				"function": (u) => {return (u - 32) * 0.55 + 273.15}
			}
		]
	},
	{
		"aliases": u.feet,
		"to": [
			{
				"aliases": u.meters,
				"function": (u) => {return u / 3.281}
			}
		]
	},
	{
		"aliases": u.meters,
		"to": [
			{
				"aliases": u.feet,
				"function": (u) => {return u * 3.281}
			}
		]
	}
];

module.exports = class ConvertCommand extends Command {
	constructor(client) {
		super(client, {
			"name":        "convert",
			"memberName":  "convert",
			"group":       "misc",
			"description": "Convert one unit to another.",
			"details": stripIndents`
				Run \`${config.prefix.commands}unit <from> <to> <unit>\` to convert units.
				**Notes:**
				<from>: Required, what to convert the unit from.
				<to>: Required, what to convert the unit to.
				<unit>: Required, what the unit is.
			`,
			"aliases":           ["conv"],
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"args": [
				{
					"key":    "from",
					"prompt": "What is the unit being converted from?",
					"type":   "string"
				},
				{
					"key":    "to",
					"prompt": "What is the unit being converted to?",
					"type":   "string"
				},
				{
					"key":    "unit",
					"prompt": "What is the unit you would like to convert?",
					"type":   "string"
				}
			],
			"throttling": {
				"usages":   2,
				"duration": 5
			}
		});
	}

	run(message, { from, to, unit }) {
		conversions.some(e => {
			if (!e.aliases.includes(from)) return false;

			return e.to.some(i => {
				if (!i.aliases.includes(to)) return false;
				return message.channel.send(this.client.embed({
					"message": message,
					"title": `${this.client.firstUpper(e.aliases[1])} to ${this.client.firstUpper(i.aliases[1])} conversion:`,
					"description": `${i.function(unit).toFixed(2)} ${this.client.firstUpper(i.aliases[0])}`
				}));
			});
		});
	}
};