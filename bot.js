// Base components
const { CommandoClient } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const { oneLine } = require('common-tags');
const path = require('path');

// Simple timestamps to print
const dt = new Date();
const utcDate = dt.toUTCString();

// Set up console.log logging
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
	transports: [
		new (winston.transports.Console)({
			name: 'log-console',
			timestamp: tsFormat,
			colorize: true,
			level: 'CONSOLE'
		}),
		new (winston.transports.DailyRotateFile)({
			name: 'log-file',
			json: false,
			datePattern: 'YYYY-MM-DD',
			filename: 'logs/log-%DATE%.log',
			zippedArchive: true,
			maxSize: '128m',
			maxFiles: '14d',
			level: 'BLANK'
        }),
    ]
});

// Require the authentication key file
const auth = require("./auth.json");

// Require the config file
const config = require("./config.json")

// Create the CommandoClient
const client = new CommandoClient({
    commandPrefix: config.prefix,
    owner: config.owners,
    disableEveryone: true,
	unknownCommandResponse: false
});

// Activity list
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

// Register everything
client.registry
	.registerDefaultTypes()
	.registerTypesIn(path.join(__dirname, 'types'))
	.registerGroups([
        ['fun', 'Fun'],
		['image', 'Image'],
		['guessing', 'Guessing'],
        ['info', 'Info'],
        ['owner', 'Owner Only'],
        ['uncategorized', 'Uncategorized'],
	])
	.registerDefaultGroups()
	.registerDefaultCommands({
		eval: false,
	})
	.registerCommandsIn(path.join(__dirname, 'commands'));

// Startup messages
client.on("ready", () => {
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
	
	// User activity message
	setInterval(() => {
		const index = Math.floor(Math.random() * (activities_list.length - 1) + 1);
		client.user.setActivity(activities_list[index]);
	}, 15000);
});

// Notify the console that a new server is using the bot
client.on("guildCreate", guild => {
	log.INFO(`Added in a new server: ${guild.name} (id: ${guild.id})`);
});

// Notify the console that a server removed the bot
client.on("guildDelete", guild => {
	log.INFO(`Removed from server: ${guild.name} (id: ${guild.id})`);
});

// Notify the console that the bot has disconnected
client.on('disconnect', event => {
	log.ERROR(`[DISCONNECT] ${event.code}`);
	process.exit(0);
});

// Log all commands used
client.on("message", async message => {
	// Make sure the user isn't a bot
	if(message.author.bot) return;
	
	// Check if it starts with the prefix
	if(message.content.indexOf(config.prefix) !== 0) return;
	
	// Split the command like commando
	const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	log.CMD(`${message.author}: ${command}`);
});
	
// # Error Handling #

// Unhandled Rejection
process.on('unhandledRejection', (err, p) => {
	log.ERROR(`Rejected Promise: ${p} / Rejection: ${err}`);
});

// Errors
client.on('error', err => log.ERROR(err));

// Warnings
client.on('warn', warn => log.WARN(warn));

// Logs
client.on('log', log => log.CONSOLE(log));

// Debug
client.on('debug', debug => log.DEBUG(debug));

// Login using auth.json
client.login(auth.token);