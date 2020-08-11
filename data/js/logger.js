// Define and require modules
const { stripIndents }    = require("common-tags");
const replacePlaceholders = require("./util").replacePlaceholders;
const commonPlaceholders  = require("./util").commonPlaceholders;
const getMessage          = require("./util").getMessage;
const configHandler       = require("./configHandler");
const sleep               = require("./util").sleep;
const embed               = require("./util").embed;
const winston             = require("winston");
require("winston-daily-rotate-file");

// Moment + sleep
const moment = require("moment");
require("moment-duration-format");

// Make the Winston logger
const levels = {
	"levels": {
		"ok":        0,
		"info":      1,
		"command":   2,
		"complete":  3,
		"translate": 4,
		"warning":   5,
		"error":     6
	},
	"colors": {
		"ok":        "green",
		"info":      "blue",
		"command":   "cyan",
		"complete":  "black cyanBG",
		"translate": "cyan",
		"warning":   "yellow",
		"error":     "red"
	}
};

const format = {
	"base": winston.format.combine(
		winston.format.timestamp({ "format": "M/D/YY h:mm:ss A" }),
		winston.format.printf(({ level, message, label, timestamp }) => {return `${timestamp} | ${level}: ${message}`})
	),
	get "console"() {
		return winston.format.combine(
			winston.format.colorize(),
			this.base
		);
	},
	get "file"() {
		return winston.format.combine(
			this.base
		);
	}
};

// eslint-disable-next-line new-cap
const log = new winston.createLogger({
	"level":       "error",
	"levels":      levels.levels,
	"exitOnError": false,
	"transports": [
		new winston.transports.Console({ "format": format.console }),
		new winston.transports.DailyRotateFile({
			"format":        format.file,
			"filename":      "data/private/logs/%DATE%.log",
			"datePattern":   "M-D-YY",
			"createSymlink": true,
			"symlinkName":   "data/private/logs/latest.log",
			"zippedArchive": true,
			"frequency":     "1d",
			"maxFiles":      "31d"
		})
	]
});
winston.addColors(levels.colors);

module.exports.log = log;
module.exports.logger = function logger(client) {
	/* ### Bot events ### */
	// Unhandled rejections
	process.on("unhandledRejection", (reason) => {console.trace(reason)});
	process.on("unhandledError",     (reason) => {console.trace(reason)});

	// Connection events
	client.on("reconnecting", () => log.info("Reconnecting to Discord..."));
	client.on("resume",       () => log.ok("Reconnected to Discord."));

	// Guild events
	client.on("guildCreate", guild => {
		log.info(`Added to ${guild.name} (ID: ${guild.id})`);
		configHandler.ensure(guild);
	});
	client.on("guildDelete", guild => log.info(`Removed from ${guild.name} (ID: ${guild.id})`));

	/* ### Guild events ### */
	// Join
	client.on("guildMemberAdd", async member => {
		const guildConfig = await configHandler.getConfig(member.guild.id);

		// Message
		if (guildConfig.join.message.enabled === "true") sendMessage({
			"placeholders": true,
			"channel": guildConfig.join.message.channelID,
			"message": guildConfig.join.message.message
		}, member);

		// Role
		if (guildConfig.join.role.enabled === "true") {
			guildConfig.join.role.roleIDs.forEach(e => {
				member.roles.add(e);
			});
		}
	});

	// Leave
	client.on("guildMemberRemove", async member => {
		const guildConfig = await configHandler.getConfig(member.guild.id);

		if (guildConfig.leave.message.enabled === "true") sendMessage({
			"placeholders": true,
			"channel": guildConfig.leave.message.channelID,
			"message": guildConfig.leave.message.message
		}, member);
	});

	/* ### Log events ### */
	// Member join
	client.on("guildMemberAdd", async member => {
		const guildConfig = await configHandler.getConfig(member.guild.id);

		if (guildConfig.channels.log.enabled === "true" || guildConfig.channels.log.modules.member === "true") {
			sendMessage({
				"channel": guildConfig.channels.log.channelID,
				"message": embed({
					"description": `**Member joined**`,
					"thumbnail": member.user.avatarURL({ "format": "png", "dynamic": true, "size": 512 }),
					"fields": [
						["Member",      member.displayName],
						["ID",          member.id],
						["Account age", getDuration(member.user.createdAt.getTime())]
					],
					"color": "#00ff00",
					"timestamp": true
				})
			});
		}
	});

	// Member leave
	client.on("guildMemberRemove", async member => {
		const guildConfig = await configHandler.getConfig(member.guild.id);

		if (guildConfig.channels.log.enabled === "true" || guildConfig.channels.log.modules.member === "true") {
			sendMessage({
				"channel": guildConfig.channels.log.channelID,
				"message": embed({
					"description": `**Member left**`,
					"thumbnail": member.user.avatarURL({ "format": "png", "dynamic": true, "size": 512 }),
					"fields": [
						["Member",         `${member.user.tag}`],
						["ID",             member.id],
						["Time in server", getDuration(member.joinedAt.getTime())]
					],
					"color": "#ff7700",
					"timestamp": true
				})
			});
		}
	});

	// Message deletion
	client.on("messageDelete", async message => {
		if (!message.guild) return;

		const guildConfig = await configHandler.getConfig(message.guild.id);
		if (guildConfig.channels.log.enabled === "false" || guildConfig.channels.log.modules.message === "false") return;

		try {message = await getMessage(message)}
		catch {return}

		await sleep(2000);
		let logs = await message.guild.fetchAuditLogs({
			"limit": 1,
			"type": "MESSAGE_DELETE"
		});
		logs = logs.entries.first();

		let description;
		if (logs.executor.id === message.author.id) description = stripIndents`
			User: ${message.author.tag}
			ID: ${message.author.id}
			Channel: <#${message.channel.id}>
		`;
		else description = stripIndents`
			By: ${logs.executor.tag}
			ID: ${logs.executor.id}

			User: ${message.author.tag}
			ID: ${message.author.id}
			Channel: <#${message.channel.id}>
		`;

		sendMessage({
			"channel": guildConfig.channels.log.channelID,
			"message": embed({
				"title":       `Message deleted (${message.author.username})`,
				"description": description,
				"thumbnail":   message.author.displayAvatarURL({ "format": "png", "dynamic": true, "size": 512 }),
				"fields": [
					["Message Content", message.content]
				],
				"color": "#ff0000",
				"timestamp": true
			})
		});
	});

	// Message edits
	client.on("messageUpdate", async (oldMessage, newMessage) => {
		if (!newMessage.guild) return;

		const guildConfig = await configHandler.getConfig(newMessage.guild.id);
		if (guildConfig.channels.log.enabled === "false" || guildConfig.channels.log.modules.message === "false") return;

		oldMessage = await getMessage(oldMessage);
		newMessage = await getMessage(newMessage);
		if (newMessage.author.bot) return;

		const messageLink = "https://discordapp.com/channels/" +
		oldMessage.guild.id + "/" +
		oldMessage.channel.id + "/" +
		oldMessage.id;

		sendMessage({
			"channel": guildConfig.channels.log.channelID,
			"message": embed({
				"title":       `Message edited (${newMessage.author.username})`,
				"description": stripIndents`
					User: ${newMessage.author.tag}
					ID: ${newMessage.author.id}
					Channel: <#${newMessage.channel.id}>
					Message: [Link](${messageLink})
				`,
				"thumbnail":   newMessage.author.displayAvatarURL({ "format": "png", "dynamic": true, "size": 512 }),
				"fields": [
					["Old Message", oldMessage.content === newMessage.content ? "⚠️ Message too old to check!" : oldMessage.content],
					["New Message", newMessage.content]
				],
				"color": "#ffff00",
				"timestamp": true
			})
		});
	});

	// Format durations to times
	function getDuration(then) {
		const time      = moment.duration((new Date()).getTime() - then);
		const formatted = time.format("y [years], M [months], d [days], h [hours], m [minutes], s [seconds].");
		return formatted.replace(/\D0 .*?[,.]/g, "").trim();
	}

	// Send messages to channels
	function sendMessage(options, object) {
		if (!checkValidChannel(options.channel)) return;

		let placeholders = [];

		if (options.placeholders === undefined) options.placeholders = false;
		if (!options.placeholders) options.commonPlaceholders = false;
		if (options.commonPlaceholders === undefined) options.commonPlaceholders = true;

		if (options.commonPlaceholders) placeholders = commonPlaceholders(object, "member");
		if (options.placeholders) options.message = replacePlaceholders(options.message, placeholders);

		client.channels.cache.get(options.channel).send(options.message);
	}

	function checkValidChannel(channel) {
		if (client.channels.cache.get(channel) === undefined) return false;
		else return true;
	}
};