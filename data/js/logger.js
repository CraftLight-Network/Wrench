// Define and require modules
const replacePlaceholders = require("./util").replacePlaceholders;
const configHandler       = require("./configHandler");
const winston             = require("winston");
require("winston-daily-rotate-file");

// Make the Winston logger
const levels = {
	"levels": {
		"ok":        0,
		"info":      1,
		"command":   2,
		"translate": 3,
		"warning":   4,
		"error":     5
	},
	"colors": {
		"ok":        "green",
		"info":      "blue",
		"command":   "cyan",
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
module.exports.logger = function logger(client, options) {
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

		const placeholders = [
			["%memberName%",  member.displayName],
			["%memberID%",    member.id],
			["%memberTag%",   member.user.tag],
			["%server%",      member.guild],
			["%serverCount%", member.guild.memberCount]
		];

		if (guildConfig.join.message.enabled === "true") {
			client.channels.cache.get(guildConfig.join.message.channelID)
				.send(
					replacePlaceholders(guildConfig.join.message.message, placeholders)
				);
		}

		if (guildConfig.join.role.enabled === "true") {
			guildConfig.join.role.roleIDs.forEach(e => {
				member.roles.add(e);
			});
		}
	});

	// Leave
	client.on("guildMemberRemove", async member => {
		const guildConfig = await configHandler.getConfig(member.guild.id);

		const placeholders = [
			["%memberName%",  member.displayName],
			["%memberID%",    member.id],
			["%memberTag%",   member.user.tag],
			["%server%",      member.guild],
			["%serverCount%", member.guild.memberCount]
		];

		if (guildConfig.leave.message.enabled === "true") {
			client.channels.cache.get(guildConfig.leave.message.channelID)
				.send(
					replacePlaceholders(guildConfig.leave.message.message, placeholders)
				);
		}
	});
};