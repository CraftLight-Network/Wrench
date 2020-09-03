// Define and require modules
const { Command }      = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const Config           = require("../../data/js/config");
const checkRole        = require("../../data/js/util").checkRole;
const util             = require("../../data/js/util");
const config           = require("../../config");

module.exports = class PurgeCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "purge",
			"memberName": "purge",
			"group": "moderation",
			"description": "Purge messages from chat or from a specific user.",
			"details": stripIndents`
				Run \`${config.prefix.commands}purge <amount> [user]\` to purge messages.
				**Notes:**
				<amount>: Required, how many messages to delete. Use "\`all\`" to remove all messages.
				[user]: Optional, what user to delete messages for.
			`,
			"args": [
				{
					"key":      "amount",
					"prompt":   "How many messages would you like to purge?",
					"type":     "string",
					"validate": arg => {
						if (arg < 3) return "You must purge at least 3 messages!";
						else if (arg > 99) return "You must purge less than 99 messages!";
						return true;
					}
				},
				{
					"key":     "user",
					"prompt":  "",
					"default": "",
					"type":    "string",
					"parse": arg => {return util.translate(arg, "mentions")}
				}
			],
			"guildOnly": true,
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS", "MANAGE_MESSAGES"],
			"throttling": {
				"usages":   2,
				"duration": 5
			}
		});
	}

	async run(message, { amount, user }) {
		if (!isNaN(parseInt(amount))) amount = parseInt(amount);
		const config = new Config("guild", message.guild.id);
		const guildConfig = await config.get();

		// Permission check
		if (!checkRole(message, guildConfig.automod.modRoleIDs)) return message.reply("You do not have permission to use this command.");

		// Purge entire channel
		if (amount === "all") {
			await message.channel.clone({ "reason": "Channel purged." });
			return message.channel.delete("Channel purged.");
		}

		// Purge some messages
		if (!user) return message.channel.bulkDelete(amount + 1, true);

		// Purge messages from user
		const allMessages = await message.channel.messages.fetch({ "limit": amount + 1 });
		const messages    = allMessages.filter(m => m.author.username === user);

		return message.channel.bulkDelete(messages);
	}
};