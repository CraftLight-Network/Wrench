// Define and require modules
const truncate = require("../../data/js/truncate.js");
const { Command } = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");
const config = require("../../config.json");
const wikipedia = require("wikijs").default;

module.exports = class wikipediaCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "wikipedia",
			"memberName": "wikipedia",
			"aliases": ["wiki"],
			"group": "search",
			"description": "Search Wikipedia.",
			"details": stripIndents`
				Run \`${config.prefix.commands}wikipedia [args]\` to search Wikipedia.
				**Notes:**
				[args]: Required, what will be searched.
				Arguments must be links, slugs, or titles. 
			`,
			"args": [
				{
					"key": "toSearch",
					"prompt": "What would you like to search for?",
					"type": "string"
				}
			],
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"throttling": {
				"usages": 2,
				"duration": 5
			}
		});
	}

	async run(message, { toSearch }) {
		wikipedia().page(toSearch).then(async result => {
			const embed = new RichEmbed()
				.attachFiles(["data/img/wikipedia.png"])
				.setThumbnail("attachment://wikipedia.png")
				.setURL(result.url())
				.setTitle(result.raw.title)
				.setDescription(" ")
				.setFooter(`Requested by ${message.author.tag}`)
				.setColor("#E3E3E3");

			const summary = await result.summary();
			if (summary.match(/may refer to:/)) {
				embed.description += stripIndents`
					**Multiple results found:**
					${truncate((await result.links()).join(", "), 250)}
				`;
			} else {embed.description += truncate(summary, 250)}

			return message.channel.send(embed);
		}).catch(function() {message.reply(`I cannot find any article related to ${toSearch}.`)});
	}
};