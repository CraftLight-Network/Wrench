// Define and require modules
const getUserInput = require("../../data/js/getUserInput.js");
const { Command } = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");
const config = require("../../config.json");

// Get Enmap
const { tags } = require("../../data/js/enmap.js");
const defaultTag = [{
	"name": "default",
	"content": "This is a default tag."
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
				Run \`${config.prefix}tag [action] [args] [tag]\` to use commands.
				**Notes:**
				[action]: Required, run \`${config.prefix}tag actions\` for actions.
				[args]: Required, data for specified action to use.
				[tag]: Required depending on action, what the tag will say.
			`,
			"args": [
				{
					"key": "action",
					"prompt": "What would you like to do? (Do `actions` for list.)",
					"default": "",
					"type": "string"
				},
				{
					"key": "args",
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

	async run(message, { action, args, tag }) {
		tags.ensure(message.guild.id, defaultTag);
		tags.fetchEverything();

		// Get action variable if not defined
		if (!action) action = await getUserInput(message, { "question": "What action or tag do you want to use?" });
		if (action === "cancel") return message.reply("Cancelled command.");

		// Get list of tag names
		const names = [];
		await tags.get(message.guild.id).forEach((tag, i) => {names[i] = tag.name});

		if (action === "create") {
			// Get args variable if not defined
			if (!args) args = await getUserInput(message, { "question": "What is the name of the tag?" });
			if (args === "cancel") return message.reply("Cancelled command.");

			if (names.some(n => args.includes(n))) return message.reply(`The tag ${args} already exists.`);

			// Get tag variable if not defined
			if (!tag) tag = await getUserInput(message, { "question": "What is the content of the tag?" });
			if (tag === "cancel") return message.reply("Cancelled command.");

			// Push the tag to the database
			tags.push(message.guild.id, { "name": args, "content": tag });

			return message.reply(`The tag \`${args}\` has been created.`);
		}

		if (action === "delete") {
			// Get args variable if not defined
			if (!args) args = await getUserInput(message, { "question": "What is the name of the tag?" });
			if (args === "cancel") return message.reply("Cancelled command.");

			if (!names.some(n => args.includes(n))) return message.reply(`The tag ${args} does not exist.`);

			// Delete the tag
			tags.get(message.guild.id).some((tag, i) => {
				if (tag.name !== args) return false;

				tags.delete(message.guild.id, i);
				message.reply(`The tag \`${args}\` has been deleted.`);
				return true;
			});
			return;
		}

		if (action === "list") {
			const embed = new RichEmbed()
				.setDescription("**Available tags:**\n")
				.setFooter(`Requested by ${message.author.tag}`)
				.setColor("#E3E3E3");

			if (names.length > 0) embed.description += `\`${names.join("`, `")}\``;
			else embed.description += "None";

			return message.channel.send(embed);
		}

		// Get arg variable if not defined
		if (!args) args = action;
		if (!names.some(n => args.includes(n))) {return message.reply(`The tag \`${args}\` does not exist.`)};

		tags.get(message.guild.id).some(tag => {
			if (args !== tag.name) return false;

			return message.say(tag.content);
		});
	}
};