// // Bot setup
const { CommandoClient } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const { oneLine } = require('common-tags');
const path = require('path');
const config = require("./config.json")

// Commando
const client = new CommandoClient({
	commandPrefix: config.prefix,
	owner: config.owners,
	unknownCommandResponse: config.unknowncommand,
	disableEveryone: true
});
client.registry
	.registerDefaultTypes()
	.registerTypesIn(path.join(__dirname, 'types'))
	.registerGroups([
		['fun', 'Fun'],
		['editing', 'Editing'],
		['helpful', 'Helpful'],
		['moderation', 'Moderation'],
		['info', 'Info'],
		// ['owner', 'Owner'],
	])
	.registerDefaultGroups()
	.registerDefaultCommands({
		eval: false,
	})
	.registerCommandsIn(path.join(__dirname, 'commands'));

// Setup enmap
const Enmap = require("enmap");
// Command counter
const commandsRead = new Enmap({
	name: "commands-read",
	autoFetch: true,
	fetchAll: false
});
// Message counter
const messagesRead = new Enmap({
	name: "messages-read",
	autoFetch: true,
	fetchAll: false
});



// // Logging

// Timestamps
const dt = new Date();
const utcDate = dt.toUTCString();

// Winston
const tsFormat = () => (new Date()).toLocaleTimeString();
const winston = require('winston');
require('winston-daily-rotate-file');
const log = new (winston.Logger)({
	levels: {
		'OK': 0,
		'CMD': 1,
		'INFO': 2,
		'WARN': 3,
		'ERROR': 4,
		'CONSOLE': 5,
		'BLANK': 6,
		'DEBUG': 7,
	},
	colors: {
		'OK': 'green',
		'CMD': 'cyan',
		'INFO': 'blue',
		'WARN': 'yellow',
		'ERROR': 'red',
		'CONSOLE': 'grey',
		'BLANK': 'black',
		'DEBUG': 'magenta'
	},
	handleExceptions: true,
	transports: [
		new (winston.transports.Console)({ // Console logging
			name: 'log-console',
			timestamp: tsFormat,
			colorize: true,
			level: 'CONSOLE'
		}),
		new (winston.transports.DailyRotateFile)({ // File logging
			name: 'log-file',
			json: false,
			datePattern: 'YYYY-MM-DD',
			filename: 'data/logs/log-%DATE%.log',
			zippedArchive: true,
			maxSize: '128m',
			maxFiles: '14d',
			level: 'BLANK'
        }),
    ]
});

process.on('unhandledRejection', (err, p) => {log.ERROR(`Rejected Promise: ${p} / Rejection: ${err}`);}); // Unhandled Rejection
client.on('error', err => log.ERROR(err)); // Errors
client.on('warn', warn => log.WARN(warn)); // Warnings
client.on('log', log => log.CONSOLE(log)); // Logs
client.on('debug', debug => log.DEBUG(debug)); // Debug
client.on("guildCreate", guild => {log.INFO(`Added in a new server: ${guild.name} (id: ${guild.id})`);}); // Notify the console that a new server is using the bot
client.on("guildDelete", guild => {log.INFO(`Removed from server: ${guild.name} (id: ${guild.id})`);}); // Notify the console that a server removed the bot
client.on('disconnect', event => {log.ERROR(`[DISCONNECT] ${event.code}`);process.exit(0);}); // Notify the console that the bot has disconnected



// // Client actions

// Set the activity list
const activities_list = [
	"]help", 
	"]invite",
	"on CustomCraft",
	"a game.",
	"customcraft.online",
	"Fallout Salvation",
	"FS: WNC",
	"with code.",
	"with Edude42",
	"with Spade",
	"things."
];

// When the bot starts
client.on("ready", () => {
	// Startup messages
	log.OK(`---------------------------------------------`);
	log.OK(`BOT START ON: ${utcDate}`);
	log.OK(`---------------------------------------------`);
	log.OK(`[READY] Bot has started.`)
	log.INFO(`Name: ${client.user.tag} ID: ${client.user.id}`);
	log.INFO(`Active in ${client.guilds.size} servers.`)
	log.INFO(` `)
	log.INFO(`Press CTRL+C to stop the bot.`)
	
	// Default activity message
	client.user.setActivity("a game.")
	
	// Random activity message
	setInterval(() => {
		const index = Math.floor(Math.random() * (activities_list.length - 1) + 1);
		client.user.setActivity(activities_list[index]);
	}, 30000);
});



// Message handler
client.on("message", async message => {
	// Make sure the user isn't a bot
	if (message.author.bot) return;
	
	// Check if it is a DM
	if (message.guild === null) {
		// Split the command
		const args = message.content.slice(config.prefix.length -1).trim().split(/ +/g);
		const command = args.shift().toLowerCase();
		
		// Log the command
		log.CMD(`[DM] ${message.author}: ${command}`);

		// Add to the Enmap stats
		commandsRead.inc("number");
		return;
	}
	
	// Check if it starts with the prefix
	if (message.content.indexOf(config.prefix) !== 0) {
		// Add to the message counter
		messagesRead.inc("number");
		return;
	}
	
	// Split the command
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
	
	// Log the command
	log.CMD(`${message.author}: ${command}`);

	// Add to the Enmap stats
	commandsRead.inc("number");
});



// // Logging in

// Require the authentication key file
const auth = require("./auth.json");

// Login using auth.json
client.login(auth.token);