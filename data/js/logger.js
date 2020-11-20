// Define and require modules
const { stripIndents } = require("common-tags");
const Config           = require("./config");
const winston          = require("winston");
require("winston-daily-rotate-file");

// Moment + sleep
const moment = require("moment");
require("moment-duration-format");

// Logger levels
const levels = {
	"levels": {
		"ok":        0,
		"info":      1,
		"command":   2,
		"complete":  3,
		"translate": 4,
		"warning":   5,
		"error":     6,
		"verbose":   7
	},
	"colors": {
		"ok":        "green",
		"info":      "blue",
		"command":   "cyan",
		"complete":  "black cyanBG",
		"translate": "cyan",
		"warning":   "yellow",
		"error":     "red",
		"verbose":   "purple"
	}
};

// Logger format
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

// Create the logger
// eslint-disable-next-line new-cap
const log = new winston.createLogger({
	"level":       "error",
	"levels":      levels.levels,
	"exitOnError": false,
	"transports": [
		new winston.transports.Console({ "format": format.console }),
		new winston.transports.DailyRotateFile({
			"format":        format.file,
			"level":         "verbose",
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
module.exports.logger = function logger(client/* , totals */) {
	// // Bot events
	// Unhandled rejections
	process.on("unhandledRejection", (reason) => {console.trace(reason)});
	process.on("unhandledError",     (reason) => {console.trace(reason)});

	// Connection events
	client.on("reconnecting", () => log.info("Reconnecting to Discord..."))
	      .on("resume",       () => log.ok("Reconnected to Discord."))

	// Guild events
	.on("guildCreate", guild => {
		getConfig(guild);
		log.info(`Added to ${guild.name} (ID: ${guild.id})`);
	})

	.on("guildDelete", guild => {
		getConfig(guild.id).reset();
		log.info(`Removed from ${guild.name} (ID: ${guild.id})`);
	})

	// // Guild events
	// Join
	.on("guildMemberAdd", async member => {
		const guildConfig = await getConfig(member.guild);
		if (!guildConfig) return;

		// Message
		if (guildConfig.join.message.enabled) sendMessage({
			"placeholders": true,
			"channel": guildConfig.join.message.channelID,
			"message": guildConfig.join.message.message
		}, member);

		// Role
		if (guildConfig.join.role.enabled) {
			guildConfig.join.role.roleID.forEach(e => {
				member.roles.add(e);
			});
		}
	})

	// Leave
	.on("guildMemberRemove", async member => {
		const guildConfig = await getConfig(member.guild);
		if (!guildConfig) return;

		if (!guildConfig.leave.message.enabled) sendMessage({
			"placeholders": true,
			"channel": guildConfig.leave.message.channelID,
			"message": guildConfig.leave.message.message
		}, member);
	})

	// // Log events
	// Member join
	.on("guildMemberAdd", async member => {
		const guildConfig = await getConfig(member.guild);
		if (!guildConfig) return;

		if (!guildConfig.log.enabled || !guildConfig.log.modules.member) return;
		sendMessage({
			"channel": guildConfig.log.channelID,
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
	})

	// Member leave
	.on("guildMemberRemove", async member => {
		const guildConfig = await getConfig(member.guild);
		if (!guildConfig) return;

		if (!guildConfig.log.enabled || !guildConfig.log.modules.member) return;
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
			"channel": guildConfig.log.channelID,
			"message": client.embed(embedMessage)
		});
	})

	// Message deletion
	.on("messageDelete", async message => {
		if (!message.guild || !message.content) return;

		const guildConfig = await getConfig(message.guild);
		if (!guildConfig) return;

		if (!guildConfig.log.enabled || !guildConfig.log.modules.message) return;

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
		const description = message.author.id !== logs.executor.id &&
			message.author.id === logs.target.id &&
			logs.createdAt > new Date().getTime() - 20000 ? stripIndents`
			By: <@${logs.executor.id}>
			Tag: ${logs.executor.tag}
			ID: ${logs.executor.id}

			User: <@${message.author.id}>
			Tag: ${message.author.tag}
			ID: ${message.author.id}
			
			Channel: <#${message.channel.id}>
		` : stripIndents`
			User: <@${message.author.id}>
			Tag: ${message.author.tag}
			ID: ${message.author.id}

			Channel: <#${message.channel.id}>
		`;

		// Send the log
		sendMessage({
			"channel": guildConfig.log.channelID,
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
	})

	// Message edits
	.on("messageEdit", async (oldMessage, newMessage) => {
		if (!newMessage.guild || newMessage.author.bot) return;

		const guildConfig = await getConfig(newMessage.guild);
		if (!guildConfig) return;

		if (!guildConfig.log.enabled || !guildConfig.log.modules.message) return;

		// Construct the message link
		const messageLink = `https://discord.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${oldMessage.id}`;

		// Send the log
		sendMessage({
			"channel": guildConfig.log.channelID,
			"message": client.embed({
				"title":       `Message edited (${newMessage.author.username})`,
				"description": stripIndents`
					User: <@${newMessage.author.id}>
					Tag: ${newMessage.author.tag}
					ID: ${newMessage.author.id}

					Channel: <#${newMessage.channel.id}>
					Message: [Link](${messageLink})
				`,
				"thumbnail": newMessage.author.displayAvatarURL({ "format": "png", "dynamic": true, "size": 512 }),
				"fields": [
					["Old Message", client.truncate(oldMessage.content, 1000)]
				],
				"color": "#fcc419",
				"timestamp": true
			})
		});
	})

	// Commands ran
	.on("commandRun", async (command, promise, message) => {
		log.command(`${(message.guild  ? "" : "(DM) ") + message.author.tag} | ${client.truncate(message.content, 442)}`);

		const complete = await promise;
		if (complete)
			log.complete(`${(message.guild ? "" : "(DM) ") + message.author.tag} | ${client.truncate(message.content, 442)} -> ${client.embedToString(await promise)}`);

		// totals.inc("commands");
	});

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
		return client.channels.cache.get(channel) !== undefined;
	}
};

// Format durations to times
function getDuration(then) {
	const time      = moment.duration((new Date()).getTime() - then);
	const formatted = time.format("y [years], M [months], d [days], h [hours], m [minutes], s [seconds].");
	return formatted.replace(/\D0 .*?[,.]/g, "").trim();
}

async function getConfig(guild) {
	const config = new Config("guild", guild);
	return await config.get();
}