// Define and require modules
const winston = require("winston");
require("winston-daily-rotate-file");

// Set the Moment format
const moment = require("moment");
const date = moment().format("M/D/YY h:mm:ss A");

// Make the Winston logger
const log = new (winston.Logger)({
	"levels": {
		"ok": 0,
		"info": 1,
		"command": 2,
		"translate": 3,
		"warning": 4,
		"error": 5
	},
	"colors": {
		"ok": "green",
		"info": "blue",
		"command": "cyan",
		"translate": "cyan",
		"warning": "yellow",
		"error": "red"
	},
	"handleExceptions": true,
	"transports": [
		// Console logging
		new (winston.transports.Console)({
			"name": "console",
			"timestamp": function() {return date},
			"colorize": true,
			"level": "error"
		}),

		// File logging
		new (winston.transports.DailyRotateFile)({
			"name": "file",
			"json": false,
			"datePattern": "M-D-YY",
			"timestamp": function() {return date},
			"filename": "data/private/logs/log-%DATE%.log",
			"zippedArchive": true,
			"maxSize": "128m",
			"maxFiles": "30d",
			"level": "error"
		})
	]
});

module.exports.log = log;
module.exports.logger = function logger(mode, client, date, guildConfig, defaultConfig) {
	// Unhandled rejections
	process.on("unhandledRejection", (err, p) => {log.error(`Rejected Promise: ${p} / Rejection: ${err}`)});

	// Connection events
	client.on("reconnecting", () => log.info("Reconnecting to Discord..."));
	client.on("resume", () => log.ok("Reconnected to Discord."));

	// Guild events
	client.on("guildCreate", guild => {
		log.info(`Added to ${guild.name} (ID: ${guild.id})`);
		guildConfig.ensure(guild.id);
	});
	client.on("guildDelete", guild => log.info(`Removed from ${guild.name} (ID: ${guild.id})`));

	// TODO: MODERATION AND OTHER LOG EVENTS
};