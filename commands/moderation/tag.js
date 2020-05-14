// Define and require modules
const userInput = require("../../data/js/util").getUserInput;
const { Command } = require("discord.js-commando");
const embed = require("../../data/js/util").embed;
const { stripIndents } = require("common-tags");
const config = require("../../config");

// Get Enmap
const actions = ["list", "create", "delete", "view", "[tag name]"];
const { tags } = require("../../data/js/enmap");
const defaultTag = [{
	"title": "default",
	"description": "This is a default tag."
}];

module.exports = class tagCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "tag",
			"memberName": "tag",
			"aliases": ["shortcut"],
			"group": "moderation",
			"description": "Create tags/shortcuts for longer or special messages.",
			"details": stripIndents`
				Run \`${config.prefix.commands}tag <action> (name) (content)\` to use commands.
				**Notes:**
				<action>: Required, what to do.
				(name): Required depending on action, name of the tag.
				(content): Required depending on action, what the tag will say.

				Actions: \`${actions.join("`, `")}\`
			`,
			"args": [
				{
					"key": "action",
					"prompt": "",
					"default": "",
					"type": "string"
				},
				{
					"key": "name",
					"prompt": "",
					"default": "",
					"type": "string"
				},
				{
					"key": "tag",
					"prompt": "",
					"default": "",
					"type": "string"
				}
			],
			"guildOnly": true,
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"throttling": {
				"usages": 2,
				"duration": 5
			}
		});
	}

	async run(message, { action, name, tag }) {
		tags.ensure(message.guild.id, defaultTag);
		tags.fetchEverything();

		// Get action variable if not defined
		if (!action) action = await userInput(message, { "question": "What action or tag do you want to use?" });
		if (action === "cancel") return message.reply("Cancelled command.");

		// Get list of tag names
		const names = [];
		await tags.get(message.guild.id).forEach((tag, i) => {names[i] = tag.name});

		if (action === "create") {
			// Get args variable if not defined
			if (!name) name = await userInput(message, { "question": "What is the name of the tag?" });
			if (name === "cancel") return message.reply("Cancelled command.");

			if (names.some(n => name.includes(n))) return message.reply(`The tag ${name} already exists.`);

			// Get tag variable if not defined
			if (!tag) tag = await userInput(message, { "question": "What is the content of the tag?" });
			if (tag === "cancel") return message.reply("Cancelled command.");

			// Push the tag to the database
			tags.push(message.guild.id, { "name": name, "content": tag });

			return message.reply(`The tag \`${name}\` has been created.`);
		}

		if (action === "delete") {
			// Get args variable if not defined
			if (!name) name = await userInput(message, { "question": "What is the name of the tag?" });
			if (name === "cancel") return message.reply("Cancelled command.");

			if (!names.some(n => name.includes(n))) return message.reply(`The tag ${name} does not exist.`);

			// Delete the tag
			tags.get(message.guild.id).some((tag, i) => {
				if (tag.name !== name) return false;

				tags.delete(message.guild.id, i);
				message.reply(`The tag \`${name}\` has been deleted.`);
				return true;
			});
			return;
		}

		if (action === "list") {
			const embedMessage = {
				"title": "Available tags:",
				"description": `**${names.length > 0 ? "None" : `\`${names.join("`, `")}\``}**`
			};

			return message.channel.send(embed(embedMessage));
		}

		// Get arg variable if not defined
		if (!name) name = action;
		if (!names.some(n => name.includes(n))) {return message.reply(`The tag \`${name}\` does not exist.`)};

		tags.get(message.guild.id).some(tag => {
			if (name !== tag.name) return false;

			return message.channel.send(tag.content);
		});
	}
};