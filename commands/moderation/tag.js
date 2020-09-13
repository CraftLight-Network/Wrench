// Define and require modules
const { Command }      = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const userInput        = require("../../data/js/util").getUserInput;
const checkRole        = require("../../data/js/util").checkRole;
const embed            = require("../../data/js/util").embed;
const Config           = require("../../data/js/config");
const util             = require("../../data/js/util");
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
		// Get the config
		const config = new Config("guild", message.guild.id);
		const guildConfig = await config.get();

		const configTags = new Config("tags", message.guild.id);
		const tagConfig  = await configTags.get();

		// Get all names of tags
		const names = [];
		await tagConfig.tags.forEach(tag => names.push(tag.name));

		// Send tag if not command
		if (!util.check(action, actions)) {
			if (message.content.charAt(0) !== conf.prefix.tags) if (!util.check(action, names)) return message.reply(`The tag \`${action}\` does not exist.`);

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

			return message.channel.send(embed(embedMessage));
		}

		// Permission check
		if (!checkRole(message, guildConfig.automod.modRoleIDs)) return message.reply("You do not have permission to use this command.");

		// Reset command
		if (action === "reset") {
			configTags.reset();
			return message.reply("Successfully reset the tags.");
		}

		// Get the property if not set
		if (!property) property = await userInput(message, { "question": "What is the name of the tag?" });
		if (property === "cancel") return message.reply("Cancelled command.");

		// Sanitize property
		property = property.replace(/[^\w\d.]/, "");

		// Add command
		if (action === "add") {
			// Get the value if not set
			if (!value) value = await userInput(message, { "question": "What is the content of the tag?" });
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

/*
// Define and require modules
const { Command }      = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const userInput        = require("../../data/js/util").getUserInput;
const checkRole        = require("../../data/js/util").checkRole;
const Config           = require("../../data/js/config");
const embed            = require("../../data/js/util").embed;
const conf             = require("../../config");

const actions = ["list", "create", "delete", "view", "[tag name]"];

module.exports = class TagCommand extends Command {
	constructor(client) {
		super(client, {
			"name":        "tag",
			"memberName":  "tag",
			"group":       "moderation",
			"description": "Create tags/shortcuts for longer or special messages.",
			"guildOnly":   true,
			"details": stripIndents`
				Run \`${conf.prefix.commands}tag <action> (name) (content)\` to use commands.
				**Notes:**
				<action>: Required, what to do. (\`create\`, \`delete\`, \`list\`)
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
			"aliases": ["tags", "shortcut"],
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"throttling": {
				"usages":   2,
				"duration": 5
			}
		});
	}

	async run(message, { action, name, tag }) {
		// Get the config
		const configTags = new Config("tags", message.guild.id);
		const tagConfig  = await configTags.get();

		const config      = new Config("guild", message.guild.id);
		const guildConfig = await config.get();

		// Get action variable if not defined
		if (!action) action = await userInput(message, { "question": `What action or tag do you want to use? (${actions.join(", ")})` });
		if (action === "cancel") return message.reply("Cancelled command.");

		// Get list of tag names
		const names = [];
		await tagConfig.tags.forEach(tag => names.push(tag.name));

		if (action === "create") {
			// Permission check
			if (!checkRole(message, guildConfig.automod.modRoleIDs)) return message.reply("You do not have permission to use this command.");

			// Get args variable if not defined
			if (!name) name = await userInput(message, { "question": "What is the name of the tag?" });
			if (name === "cancel") return message.reply("Cancelled command.");

			if (names.some(n => name.includes(n))) return message.reply(`The tag ${name} already exists.`);

			// Get tag variable if not defined
			if (!tag) tag = await userInput(message, { "question": "What is the content of the tag?" });
			if (tag === "cancel") return message.reply("Cancelled command.");

			// Push the tag to the database
			configTags.add("tags", { "name": name, "content": tag });

			return message.reply(`The tag \`${name}\` has been created.`);
		}

		if (action === "delete") {
			// Permission check
			if (!checkRole(message, guildConfig.automod.modRoleIDs)) return message.reply("You do not have permission to use this command.");

			// Get args variable if not defined
			if (!name) name = await userInput(message, { "question": "What is the name of the tag?" });
			if (name === "cancel") return message.reply("Cancelled command.");

			if (!names.some(n => name.includes(n))) return message.reply(`The tag ${name} does not exist.`);

			// Delete the tag
			tagConfig.tags.some((tag, i) => {
				if (tag.name !== name) return false;

				configTags.delete("tags", i);
				message.reply(`The tag \`${name}\` has been deleted.`);
				return true;
			});
			return;
		}

		if (action === "list") {
			return message.channel.send(embed({ "title": "Available tags:", "description": `${names.length > 0 ? `\`${names.join("`, `")}\`` : "**None**"}` }));
		}

		// Get arg variable if not defined
		if (!name) name = action;
		if (message.content.charAt(0) !== conf.prefix.tags) if (!names.some(n => name.includes(n))) {return message.reply(`The tag \`${name}\` does not exist.`)};

		tagConfig.tags.some(tag => {
			if (name !== tag.name) return false;

			return message.channel.send(tag.description);
		});
	}
};
*/