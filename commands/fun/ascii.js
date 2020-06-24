// Define and require modules
const { Command }	   = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const userInput		   = require("../../data/js/util").getUserInput;
const embed			   = require("../../data/js/util").embed;
const config		   = require("../../config");
const hastebin		   = require("hastebin");
const figlet		   = require("figlet");

const fonts = ["fonts"].concat(figlet.fontsSync().map(function(i) {return i.replace(" ", "_").toLowerCase()}));

module.exports = class asciiCommand extends Command {
	constructor(client) {
		super(client, {
			"name":		   "ascii",
			"memberName":  "ascii",
			"group":	   "fun",
			"description": "Turn text in to figlet art.",
			"details": stripIndents`
				Run \`${config.prefix.commands}ascii <action> (args)\` to make figlet art.
				**Notes:**
				<action>: Required, \`fonts\` to list fonts, or \`<font>\`.
				(args): Required depending on action, text the art will be made of.
				Arguments must be under 100 characters.
				Run \`${config.prefix.commands}ascii fonts\` to list all fonts.
			`,
			"args": [
				{
					"key":		"action",
					"prompt":	`What font would you like to use? (Run \`${config.prefix.commands}ascii fonts\` for list.)`,
					"type":		"string",
					"oneOf":	fonts
				},
				{
					"key":		"args",
					"prompt":	"",
					"type":		"string",
					"default":	"",
					"validate": arg => {
						if (arg.length < 100) return true;
						return "Please use under 100 characters!";
					}
				}
			],
			"aliases":			 ["figlet"],
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"throttling": {
				"usages":	2,
				"duration":	5
			}
		});
	}

	async run(message, { action, args }) {
		// Return link to fonts if specified
		if (action === "fonts") {
			const embedMessage = embed({ "message": message, "title": "Available Fonts:", "description": "https://dl.encode42.dev/data/txt/wrenchbot-fonts.txt" });
			return message.channel.send(embedMessage);
		} else {
			// Take input if not specified
			if (!args) args = await userInput(message, { "question": "What would you like to make ascii art of?" });
			if (args === "cancel") return message.reply("Cancelled command.");

			// Create and upload figlet to hastebin
			hastebin.createPaste(figlet.textSync(args, action.replace("_", " ")), {
				"raw":		   true,
				"contentType": "text/plain",
				"server":	   "https://hastebin.com"
			}).then(function(link) {
				const embedMessage = embed({ "message": message, "title": "Figlet link:", "description": link });
				return message.channel.send(embedMessage);
			});
		}
	}
};