// Define and require modules
const { Random, MersenneTwister19937 } = require("random-js");
const { Command } = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");
const config = require("../../config.json");
const hastebin = require("hastebin");
const figlet = require("figlet");

const fonts = ["fonts"].concat(figlet.fontsSync().map(function(i) {return i.replace(" ", "_").toLowerCase()}));

module.exports = class asciiCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "ascii",
			"memberName": "ascii",
			"aliases": ["figlet"],
			"group": "fun",
			"description": "Turn text in to figlet art.",
			"details": stripIndents`
				Run \`${config.prefix}ascii [font] [args]\` to make figlet art.
				**Notes:**
				[arg1]: Required, what font the figlet will use, or use \`fonts\` to list all fonts.
				[args]: Required, what the bot will make art of.
				Arguments must be under 100 characters.
				Run \`${config.prefix}ascii fonts\` to list all fonts.
			`,
			"args": [
				{
					"key": "arg1",
					"prompt": `What font would you like to use? (Run \`${config.prefix}ascii fonts\` for list)`,
					"type": "string",
					"oneOf": fonts
				},
				{
					"key": "arg2",
					"prompt": "What would you like to make figlet art of?",
					"type": "string",
					"default": "",
					"validate": arg => {
						if (arg.length < 100) return true;
						return "Please use under 100 characters!";
					}
				}
			],
			"throttling": {
				"usages": 2,
				"duration": 5
			}
		});
	}

	async run(message, { arg1, arg2 }) {
		// Return link to fonts if specified
		if (arg1 === "fonts") {
			const embed = new RichEmbed()
				.setDescription(stripIndents`
					**Available Fonts:**
					https://hastebin.com/raw/aqihuvepem
				`)
				.setFooter(`Requested by ${message.author.tag}`)
				.setColor("#E3E3E3");

			return message.channel.send(embed);
		} else {
			// Start making the figlet
			let toFiglet;
			let exit = true;

			// Ask for toFiglet if not specified
			while (arg2 === "" && exit) {
				message.reply(stripIndents`
					What would you like to make figlet art of?
					Respond with \`cancel\` to cancel the command. The command will automatically be cancelled in 30 seconds.
				`);

				// Take user input
				const filter = res => {
					const value = res.content.toLowerCase();
					return res.author.id === message.author.id;
				};
				arg2 = await message.channel.awaitMessages(filter, {
					"max": 1,
					"time": 30000
				}).catch(function() {exit = false; arg2 = " "});

				// Set toFiglet to inputted value
				arg2.find(i => {toFiglet = i.content});
			}
			if (!toFiglet) toFiglet = arg2;
			if (toFiglet === "cancel") return message.reply("Cancelled command.");

			// Create and upload figlet to hastebin
			hastebin.createPaste(figlet.textSync(toFiglet, arg1), {
				"raw": true,
				"contentType": "text/plain",
				"server": "https://hastebin.com"
			}).then(function(link) {
				const embed = new RichEmbed()
					.setDescription(stripIndents`
						**Figlet link:**
						${link}
					`)
					.setFooter(`Requested by ${message.author.tag}`)
					.setColor("#E3E3E3");

				return message.channel.send(embed);
			});
		}
	}
};