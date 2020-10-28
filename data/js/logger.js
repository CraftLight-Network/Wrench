// Define and require modules
const { stripIndents }    = require("common-tags");
const Config              = require("./config");
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
module.exports.logger = function logger(client, totals) {
	/* ### Bot events ### */
	// Unhandled rejections
	process.on("unhandledRejection", (reason) => {console.trace(reason)});
	process.on("unhandledError",     (reason) => {console.trace(reason)});

	// Connection events
	client.on("reconnecting", () => log.info("Reconnecting to Discord..."));
	client.on("resume",       () => log.ok("Reconnected to Discord."));

	// Guild events
	client.on("guildCreate", guild => {
		getConfig(guild.id).ensure();
		log.info(`Added to ${guild.name} (ID: ${guild.id})`);
	});

	client.on("guildDelete", guild => {
		getConfig(guild.id).reset();
		log.info(`Removed from ${guild.name} (ID: ${guild.id})`);
	});

	/* ### Guild events ### */
	// Join
	client.on("guildMemberAdd", async member => {
		const guildConfig = await getConfig(member.guild.id);

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
		const guildConfig = await getConfig(member.guild.id);

		if (guildConfig.leave.message.enabled === "true") sendMessage({
			"placeholders": true,
			"channel": guildConfig.leave.message.channelID,
			"message": guildConfig.leave.message.message
		}, member);
	});

	/* ### Log events ### */
	// Member join
	client.on("guildMemberAdd", async member => {
		const guildConfig = await getConfig(member.guild.id);
		if (guildConfig.channels.log.enabled === "false" || guildConfig.channels.log.modules.member === "false") return;

		sendMessage({
			"channel": guildConfig.channels.log.channelID,
			"message": client.embed({
				"title": `Member joined (${member.user.username})`,
				"description": stripIndents`
					User: <@${member.id}>
					Tag: ${member.user.tag}
					ID: ${member.id}
				`,
				"thumbnail": member.user.displayAvatarURL({ "format": "png", "dynamic": true, "size": 512 }),
				"fields": [
					["Account age", getDuration(member.user.createdAt.getTime())]
				],
				"color": "#40c057",
				"timestamp": true
			})
		});
	});

	// Member leave
	client.on("guildMemberRemove", async member => {
		const guildConfig = await getConfig(member.guild.id);
		if (guildConfig.channels.log.enabled === "false" || guildConfig.channels.log.modules.member === "false") return;

		const roles = member.roles.cache.map(r => r.name === "@everyone" ? "" : r.name)
			.filter(Boolean);

		const embedMessage = {
			"title": `Member left (${member.user.username})`,
			"description": stripIndents`
				User: <@${member.id}>
				Tag: ${member.user.tag}
				ID: ${member.id}
			`,
			"thumbnail": member.user.displayAvatarURL({ "format": "png", "dynamic": true, "size": 512 }),
			"fields": [
				["Time in server", getDuration(member.joinedAt.getTime())]
			],
			"color": "#ff7700",
			"timestamp": true
		};

		if (roles.length > 0) embedMessage.fields.push(["Roles", `\`${roles.join("`, `")}\``]);

		sendMessage({
			"channel": guildConfig.channels.log.channelID,
			"message": client.embed(embedMessage)
		});
	});

	// Message deletion
	client.on("messageDelete", async message => {
		if (!message.guild || !message.content) return;

		const guildConfig = await getConfig(message.guild.id);
		if (guildConfig.channels.log.enabled === "false" || guildConfig.channels.log.modules.message === "false") return;

		// Grab the message if the bot can
		try {message = await client.getMessage(message)}
		catch {return}

		// Check audit logs for who deleted the message
		await client.sleep(2000);
		let logs = await message.guild.fetchAuditLogs({
			"limit": 1,
			"type": "MESSAGE_DELETE"
		});
		logs = logs.entries.first();

		// Return results from audit log
		let description;
		if (logs.executor.id === message.author.id && logs.createdAt < (new Date()).getTime() - 2000) description = stripIndents`
			User: <@${message.author.id}>
			Tag: ${message.author.tag}
			ID: ${message.author.id}

			Channel: <#${message.channel.id}>
		`;
		else description = stripIndents`
			By: ${logs.executor.tag}
			ID: ${logs.executor.id}

			User: <@${message.author.id}>
			Tag: ${message.author.tag}
			ID: ${message.author.id}
			
			Channel: <#${message.channel.id}>
		`;

		// Send the log
		sendMessage({
			"channel": guildConfig.channels.log.channelID,
			"message": client.embed({
				"title":       `Message deleted (${message.author.username})`,
				"description": description,
				"thumbnail":   message.author.displayAvatarURL({ "format": "png", "dynamic": true, "size": 512 }),
				"fields": [
					["Message Content", message.content]
				],
				"color": "#fa5252",
				"timestamp": true
			})
		});
	});

	// Message edits
	client.on("messageEdit", async (oldMessage, newMessage) => {
		// Make sure the message exists, isn't a link, and isn't a pin
		if (oldMessage.pinned === undefined) oldMessage.pinned = false;
		if (!newMessage.guild || oldMessage.pinned !== newMessage.pinned) return;

		const guildConfig = await getConfig(newMessage.guild.id);
		if (guildConfig.channels.log.enabled === "false" || guildConfig.channels.log.modules.message === "false") return;

		// Grab the messages
		oldMessage = await client.getMessage(oldMessage);
		newMessage = await client.getMessage(newMessage);
		if (newMessage.author.bot) return;

		// Make sure the update isn't an embed
		if (oldMessage.embeds.length < newMessage.embeds.length) return;

		// Construct the message link
		const messageLink = `https://discord.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${oldMessage.id}`;

		// Send the log
		sendMessage({
			"channel": guildConfig.channels.log.channelID,
			"message": client.embed({
				"title":       `Message edited (${newMessage.author.username})`,
				"description": stripIndents`
					User: <@${newMessage.author.id}>
					Tag: ${newMessage.author.tag}
					ID: ${newMessage.author.id}

					Channel: <#${newMessage.channel.id}>
					Message: [Link](${messageLink})
				`,
				"thumbnail":   newMessage.author.displayAvatarURL({ "format": "png", "dynamic": true, "size": 512 }),
				"fields": [
					["Old Message", oldMessage.content === newMessage.content ? "⚠️ Message too old to check!" : client.truncate(oldMessage.content, 1024)]
				],
				"color": "#fcc419",
				"timestamp": true
			})
		});
	});

	// Commands ran
	client.on("commandRun", async (command, promise, message) => {
		log.command(`${(message.guild  ? "" : "(DM) ") + message.author.tag} | ${client.truncate(message.content, 442)}`);

		const complete = await promise;
		if (complete)
			log.complete(`${(message.guild ? "" : "(DM) ") + message.author.tag} | ${client.truncate(message.content, 442)} -> ${client.embedToString(await promise)}`);

		totals.inc("commands");
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

		if (options.commonPlaceholders) placeholders = client.commonPlaceholders(object, "member");
		if (options.placeholders) options.message = client.placeholders(options.message, placeholders);

		client.channels.cache.get(options.channel).send(options.message);
	}

	function checkValidChannel(channel) {
		if (client.channels.cache.get(channel) === undefined) return false;
		else return true;
	}

	// Get the config
	async function getConfig(guild) {
		const config = new Config("guild", guild);
		return await config.get();
	}
};