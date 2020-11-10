// Define and require modules
const { Command }      = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const Config           = require("../../data/js/config");
const conf             = require("../../config");

const actions = ["<tag name>", "view", "add", "remove", "reset"];

module.exports = class TagCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "tag",
			"memberName": "tag",
			"aliases": ["tags"],
			"group": "moderation",
			"description": "Create tags/shortcuts for longer or special messages.",
			"details": stripIndents`
				Run \`${conf.prefix.commands}tag <action> (property) (value)\` to interact with the tags.
				**Notes:**
				<action>: Required, what to do. (OR tag name)
				(name): Required depending on action, what property to take action on.
				(content): Required depending on action, what to set the value of property to.

				Actions: \`${actions.join("`, `")}\`
			`,
			"args": [
				{
					"key":     "action",
					"prompt":  "What would you like to do?",
					"default": "",
					"type":    "string"
				},
				{
					"key":     "property",
					"prompt":  "",
					"default": "",
					"type":    "string"
				},
				{
					"key":     "value",
					"prompt":  "",
					"default": "",
					"type":    "string"
				}
			],
			"guildOnly": true,
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"throttling": {
				"usages":   2,
				"duration": 5
			}
		});
	}

	async run(message, { action, property, value }) {
		const config = new Config("guild", message.guild.id);
		const guildConfig = await config.get();

		const configTags = new Config("tags", message.guild.id);
		const tagConfig  = await configTags.get();

		// Get all names of tags
		const names = [];
		await tagConfig.tags.forEach(tag => names.push(tag.name));

		// Send tag if not command
		if (!actions.includes(action)) {
			if (message.content.charAt(0) !== conf.prefix.tags) if (names.includes(action)) return message.reply(`The tag \`${action}\` does not exist.`);

			tagConfig.tags.forEach(tag => {
				if (action !== tag.name) return;
				message.channel.send(tag.description);
			});
			return;
		}

		// View command
		if (action === "view") {
			const embedMessage = {
				"title": `${message.guild.name}'s tags:`,
				"description": `${names.length > 0 ? `\`${names.join("`, `")}\`` : "**None**"}`
			};

			if (property === "advanced") embedMessage.description = `
\`\`\`json
${JSON.stringify(tagConfig, null, 2)}
\`\`\`
			`; else embedMessage.description = names.length > 0 ? `\`${names.join("`, `")}\`` : "**None**";

			return message.channel.send(this.client.embed(embedMessage));
		}

		// Permission check
		if (!this.client.checkRole(message, guildConfig.automod.modRoleIDs)) return message.reply("You do not have permission to use this command.");

		// Reset command
		if (action === "reset") {
			configTags.reset();
			return message.reply("Successfully reset the tags.");
		}

		// Get the property if not set
		if (!property) property = await this.client.userInput(message, { "question": "What is the name of the tag?" });
		if (property === "cancel") return message.reply("Cancelled command.");

		// Sanitize property
		property = property.replace(/[^\w.]/, "");

		// Add command
		if (action === "add") {
			// Get the value if not set
			if (!value) value = await this.client.userInput(message, { "question": "What is the content of the tag?" });
			if (value === "cancel") return message.reply("Cancelled command.");

			configTags.add("tags", {
				"name": property,
				"description": value
			});

			return message.reply(`Added tag ${property}`);
		}

		// Remove command
		if (action === "remove") {
			configTags.remove("tags", v => v.name === value);

			return message.reply(`Removed tag ${property}`);
		}
	}
};