// Define and require modules
const { Command } = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");
const config = require("../../config.json");
const moment = require("moment");

const actions = ["standard", "advanced", "all"];
const verificationLevel = ["None", "Low", "Medium", "(╯°□°）╯︵ ┻━┻", "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻"];
const explicitContentFilter = ["Off", "On (No Role)", "On (All)"];

module.exports = class serverInfoCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "server-info",
			"memberName": "server-info",
			"group": "misc",
			"description": "View information about the server you are in.",
			"details": stripIndents`
				Run \`${config.prefix.commands}server-info [action]\` to view server info.
				**Notes:**
				[action]: What level to grab server info.
				${actions.join(", ")}
			`,
			"args": [
				{
					"key": "action",
					"prompt": "What would you like to search for?",
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

		const embed = new RichEmbed()
			.setDescription(`**${guild.name} Info:**`)
			.setFooter(`Requested by ${message.author.tag}`)
			.setColor("#E3E3E3");

		// Image links
		const iconURL = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
		if (guild.icon) {
			icon = `[Click](${iconURL})`;
			embed.setThumbnail(iconURL);
		} else icon = "None";

		const splashURL = `https://cdn.discordapp.com/icons/${guild.id}/${guild.splash}.png`;
		if (guild.splash) {
			splash = `[Click](${splashURL})`;
			embed.setImage(splashURL);
		} else splash = "None";

		if (actions.indexOf(action) > 0) {
			embed.addField("Name", guild.name, true)
				.addField("ID", guild.id, true)
				.addField("Owner", guild.owner, true)
				.addField("Created on", moment(guild.createdTimestamp).format("M/D/YY h:mm:ss A"), true)
				.addField("AFK Channel", guild.afkChannel ? guild.afkChannel : "None", true)
				.addField("AFK Timeout", guild.afkChannel ? guild.afkTimeout : "None", true)
				.addField("Region", guild.region, true)
				.addField("Icon", icon, true)
				.addField("Splash", splash, true);
		}

		if (actions.indexOf(action) > 1) {
			embed.addField("Verification", verificationLevel[guild.verificationLevel], true)
				.addField("2FA Requirement", guild.mfaLevel ? "On" : "Off", true)
				.addField("Content Filter", explicitContentFilter[guild.explicitContentFilter], true)
				.addField("Verified", guild.verified ? "Yes" : "No", true)
				.addField("System Channel", guild.systemChannel ? guild.systemChannel : "None", true)
				.addField("Notifications", defaultMessageNotifications, true);
		}

		embed.addField("Channels", guild.channels.size, true)
			.addField("Emojis", guild.emojis.size, true)
			.addField("Roles", guild.roles.size, true)
			.addField("Members", guild.members.filter(member => !member.user.bot).size, true)
			.addField("Bots", guild.members.filter(member => member.user.bot).size, true)
			.addField("Total users", guild.memberCount, true);

		return message.channel.send(embed);
	}
};