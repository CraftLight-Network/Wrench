// Define and require modules
const { Command } = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");
const config = require("../../config.json");
const moment = require("moment");

const actions = ["", "advanced", "all"];

module.exports = class serverInfoCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "server-info",
			"memberName": "server-info",
			"group": "misc",
			"description": "View information about the server you are in.",
			"details": stripIndents`
				Run \`${config.prefix}server-info [action]\` to view server info.
				**Notes:**
				[action]: What level to grab server info.
				${actions.join(", ")}
			`,
			"args": [
				{
					"key": "action",
					"prompt": "What would you like to search for?",
					"type": "string",
					"default": "",
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

		// Format variables
		let afkChannel, afkTimeout, verificationLevel, mfaLevel, explicitContentFilter, defaultMessageNotifications;

		// AFK Channel
		if (!guild.afkChannel) afkChannel = afkTimeout = "None";

		// Verification Level
		switch (guild.verificationLevel) {
			case 0: verificationLevel = "None"; break;
			case 1: verificationLevel = "Low"; break;
			case 2: verificationLevel = "Medium"; break;
			case 3: verificationLevel = "(╯°□°）╯︵ ┻━┻"; break;
			case 4: verificationLevel = "┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻"; break;
		}

		// Authentication
		if (guild.mfaLevel === 0) mfaLevel = "Off";
		else mfaLevel = "On";

		// Content filter
		switch (guild.explicitContentFilter) {
			case 0: explicitContentFilter = "Off"; break;
			case 1: explicitContentFilter = "On (No Role)"; break;
			case 2: explicitContentFilter = "On (All)"; break;
		}

		// Notifications
		if (guild.defaultMessageNotifications === "MENTIONS") defaultMessageNotifications = "@mentions";
		else defaultMessageNotifications = "All";

		// System Channel
		if (!guild.systemChannel) guild.systemChannel = "None";

		const iconURL = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
		const splashURL = `https://cdn.discordapp.com/icons/${guild.id}/${guild.splash}.png`;
		const embed = new RichEmbed()
			.setDescription(`**${guild.name} Info:**`)
			.setFooter(`Requested by ${message.author.tag}`)
			.setColor("#E3E3E3");

		// Image links
		let icon, splash;
		if (guild.icon) {
			icon = `[Click](${iconURL})`;
			embed.setThumbnail(iconURL);
		} else icon = "None";
		if (guild.splash) {
			splash = `[Click](${splashURL})`;
			embed.setImage(splashURL);
		} else splash = "None";

		if (actions.indexOf(action) > 0) {
			embed.addField("Name", guild.name, true)
				.addField("ID", guild.id, true)
				.addField("Owner", guild.owner, true)
				.addField("Created on", moment(guild.createdTimestamp).format("M/D/YY h:mm:ss A"), true)
				.addField("AFK Channel", afkChannel, true)
				.addField("AFK Timeout", afkTimeout, true)
				.addField("Region", guild.region, true)
				.addField("Icon", icon, true)
				.addField("Splash", splash, true);
		}

		if (actions.indexOf(action) > 1) {
			embed.addField("Verification", verificationLevel, true)
				.addField("2FA Requirement", mfaLevel, true)
				.addField("Content Filter", explicitContentFilter, true)
				.addField("Verified", guild.verified, true)
				.addField("System Channel", guild.systemChannel, true)
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