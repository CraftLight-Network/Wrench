// Define and require modules
const { Command } = require("discord.js-commando");
const embed = require("../../data/js/util").embed;
const { stripIndents } = require("common-tags");
const config = require("../../config");
const moment = require("moment");

const actions = ["standard", "advanced", "all"];
const verificationLevel = ["None", "Low", "Medium", "(╯°□°）╯︵ ┻━┻", "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻"];
const explicitContentFilter = ["Off", "On (No Role)", "On (All)"];

module.exports = class serverInfoCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "server-info",
			"memberName": "server-info",
			"group": "search",
			"description": "View information about the server you are in.",
			"details": stripIndents`
				Run \`${config.prefix.commands}server-info [level]\` to view server info.
				**Notes:**
				[action]: Optional, what level to grab server info at.

				Levels: \`${actions.join("`, `")}\`
			`,
			"args": [
				{
					"key": "action",
					"prompt": "",
					"type": "string",
					"default": "standard",
					"oneOf": actions
				}
			],
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"throttling": {
				"usages": 2,
				"duration": 5
			}
		});
	}

	run(message, { action }) {
		const guild = message.guild;
		let defaultMessageNotifications, icon, splash;

		// Notifications
		if (guild.defaultMessageNotifications === "MENTIONS") defaultMessageNotifications = "@mentions";
		else defaultMessageNotifications = "All";

		const embedMessage = { "title": `${guild.name} Info:`, "fields": [] };

		// Image links
		const iconURL = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
		if (guild.icon) {
			icon = `[Click](${iconURL})`;
			embedMessage.thumbnail = iconURL;
		} else icon = "None";

		const splashURL = `https://cdn.discordapp.com/icons/${guild.id}/${guild.splash}.png`;
		if (guild.splash) {
			splash = `[Click](${splashURL})`;
			embedMessage.image = splashURL;
		} else splash = "None";

		if (actions.indexOf(action) > 0) {
			embedMessage.fields.push(
				["name", guild.name, true],
				["ID", guild.id, true],
				["Owner", guild.owner, true],
				["Created on", moment(guild.createdTimestamp).format("M/D/YY h:mm:ss A"), true],
				["AFK Channel", guild.afkChannel ? guild.afkChannel : "None", true],
				["AFK Timeout", guild.afkChannel ? guild.afkTimeout : "None", true],
				["Region", guild.region, true],
				["Icon", icon, true],
				["Splash", splash, true]
			);
		}

		if (actions.indexOf(action) > 1) {
			embedMessage.fields.push(
				["Verification", verificationLevel[guild.verificationLevel], true],
				["2FA Requirement", guild.mfaLevel ? "On" : "Off", true],
				["Content Filter", explicitContentFilter[guild.explicitContentFilter], true],
				["Verified", guild.verified ? "Yes" : "No", true],
				["System Channel", guild.systemChannel ? guild.systemChannel : "None", true],
				["Notifications", defaultMessageNotifications, true]
			);
		}

		embedMessage.fields.push(
			["Channels", guild.channels.size, true],
			["Emojis", guild.emojis.size, true],
			["Roles", guild.roles.size, true],
			["Members", guild.members.filter(member => !member.user.bot).size, true],
			["Bots", guild.members.filter(member => member.user.bot).size, true],
			["Total users", guild.memberCount, true]
		);

		console.log(embedMessage.fields);

		return message.channel.send(embed(embedMessage, message));
	}
};