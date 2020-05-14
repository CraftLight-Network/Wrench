// Define and require modules
const { Command } = require("discord.js-commando");
const embed = require("../../data/js/util").embed;
const { stripIndents } = require("common-tags");
const config = require("../../config");

const values = ["author", "author.name", "author.picture", "title", "url", "thumbnail", "description", "footer", "color", "fields", "image"];

module.exports = class embedCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "embed",
			"memberName": "embed",
			"group": "misc",
			"description": "Create an embedded message.",
			"details": stripIndents`
				Run \`${config.prefix.commands}embed <JSON>\` to make an embed
				**Notes:**
				<JSON>: Required, the contents of the embed.
				How to format JSON: JSON always starts and ends with \`{\`/\`}\`
				For an example on how to format the JSON for this command,
				look a bit below these notes.

				JSON elements: \`${values.join("`, `")}\`
			`,
			"examples": [
				`${config.prefix.commands}embed {"footer": "Hello"}`,
				`
\`\`\`json
{
	"author": {
		"name": "Encode42",
		"picture": "me"
	},
	"title": "Embed title",
	"description": "Embed description"
}
\`\`\`
				`, `
\`\`\`json
{
	"author": { "name": "Cool Guy" }
	"fields": [
		["Field 1", "This is a field that is next to another", true],
		["Field 2", "This is a field that is next to another", true],
		["Field 3", "This is a field that isn't next to another"]
	]
}
\`\`\`
			`],
			"args": [
				{
					"key": "embedJSON",
					"prompt": "What is the JSON you would like to embed?",
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

	run(message, { embedJSON }) {
		const embedMessage = JSON.parse(embedJSON.match(/{[^]+}/));
		return message.channel.send(embed(embedMessage, message));
	}
};