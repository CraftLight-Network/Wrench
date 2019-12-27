// Define and require modules
const moment = require("moment");
const date = moment().format("M/D/YY h:mm:ss A");

// Winston logger
const winston = require("winston");
require("winston-daily-rotate-file");

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
		new (winston.transports.DailyRotateFile)({ // File logging
			"name": "file",
			"json": false,
			"datePattern": "M-D-YY_h.mm.ss_A",
			"timestamp": function() {return date},
			"filename": "data/private/logs/log-%DATE%.log",
			"zippedArchive": true,
			"maxSize": "128m",
			"maxFiles": "14d",
			"level": "error"
		})
	]
});

module.exports.log = log;
module.exports.logger = function logger(mode, client, date, guildConfig, defaultConfig) {
	// Logger events

	// Disconnect events
	client.on("disconnect", event => {
		log.error(`DISCONNECT: ${event.code}`);
		process.exit(0);
	});

	// Bot added to server
	client.on("guildCreate", guild => {
		log.INFO(`Added to ${guild.name} (ID: ${guild.id})`);
		guildConfig.ensure(guild.id);
	});

	// Bot removed from server
	client.on("guildDelete", guild => {
		log.INFO(`Removed from ${guild.name} (ID: ${guild.id})`);
		guildConfig.delete(guild.id);
	});

	// TODO: MODERATION AND OTHER LOG EVENTS
};