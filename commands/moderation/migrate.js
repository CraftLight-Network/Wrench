// Define and require modules
const { Command }      = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const Config           = require("../../data/js/config");
const options          = require("../../config");

module.exports = class MigrateCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "migrate",
			"memberName": "migrate",
			"group": "moderation",
			"description": "Migrate the server configuration.",
			"details": stripIndents`
				Run \`${options.prefix.commands}migrate\` to migrate your config to a newer version.
				**Notes:**
				You must be the owner, or have the \`Manage Server\` permission.
				I am not responsible for any config data you lose!
				Your old config will be sent in the chat.
			`,
			"guildOnly": true,
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"throttling": {
				"usages":   2,
				"duration": 5
			}
		});
	}

	async run(message) {
		// Permission check
		if (!this.client.checkRole(message)) return message.reply("You do not have permission to use this command.");

		const config = new Config("guild", message.guild);

		// Make sure the config is not already up-to-date
		const configDetails = await config.getDetails();
		if (configDetails.version.local === configDetails.version.current)
			return message.reply("This server's config is already up-to-date!");

		// Send the server's old config in case of any lost data
		const oldConfig = this.client.embed({
			"message":     message,
			"title":       `${message.guild.name}'s old config:`,
			"description": `
\`\`\`json
${JSON.stringify(await config.getRaw(), null, 2)}
\`\`\`
			`
		});
		message.reply("Migration starting! Here's your old config so you can copy over any lost data:", { "embed": oldConfig });

		// Migrate the config
		await config.check(true);

		// Send the latest migration's changelog
		const changelog = {
			"message":     message,
			"title":       `guildConfig v${configDetails.version.current}'s migration details:`,
			"fields": [
				["Changelog", configDetails.info.changelog.join("\n")]
			]
		};
		if (configDetails.info.breaking) changelog.fields.push(["Breaking Reason", configDetails.info.reason]);
		message.reply(`Migration complete! You are now running guildConfig v${configDetails.version.current} (From v${configDetails.version.local})`, { "embed": this.client.embed(changelog) });
	}
};