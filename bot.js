// // Bot setup
const { CommandoClient } = require('discord.js-commando');
const antispam = require('discord-anti-spam');
const { RichEmbed } = require('discord.js');
const { oneLine } = require('common-tags');
const config = require("./config.json");
const path = require('path');

// Commando
const client = new CommandoClient({
	commandPrefix: config.prefix,
	owner: config.owners,
	disableEveryone: true,
	unknownCommandResponse: false,
});
client.registry
	.registerDefaultTypes()
	.registerTypesIn(path.join(__dirname, 'data/types'))
	.registerGroups([
		['fun', 'Fun'],
		['editing', 'Editing'],
		['helpful', 'Helpful'],
		// ['moderation', 'Moderation'],
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
		'TRAN': 2,
		'INFO': 3,
		'WARN': 4,
		'ERROR': 5,
		'CONSOLE': 6,
		'BLANK': 7,
		'DEBUG': 8,
	},
	colors: {
		'OK': 'green',
		'CMD': 'cyan',
		'TRAN': 'cyan',
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
	"on CustomCraft",
	"a game.",
	"customcraft.online",
	"http://cust.pw/",
	"http://cust.pw/d",
	"on Fallout Salvation",
	"FS: WNC",
	"with code.",
	"with Edude42",
	"with Spade",
	"with Cas",
	"with Braven",
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
	
	// Anti-spam setup
	antispam(client, {
		warnBuffer: 5, // Max messages before warn
		maxBuffer: 15, // Max messages before ban
		interval: 3000, // How many seconds in ms for buffers
		warningMessage: "stop spamming! Change your message or slow down.", // Warn message
		banMessage: "spammed and got banned!", // Ban message
		maxDuplicatesWarning: 3, // Max duplicates before warn
		maxDuplicatesBan: 10, // Max duplicates before ban
		deleteMessagesAfterBanForPastDays: 1, // Delete messages x days ago
		exemptRoles: ["Admin", "Manager"], // Ignored roles
		exemptUsers: ["Edude42#2812"] // Ignored users
	});
});

client.on('guildMemberAdd', member => {
	member.addRole('525501371269513236');
});

/*
// Music
client.on('voiceStateUpdate', (oldMember, newMember) => {
	const channel = client.channels.get("525499487049875456");
	console.log(channel.members)
	if (channel.members.size >= 1) {
		channel.join()
	}
	if (channel.members.size == 1) {
		if (newMember.user.id == '518961713098260490') {
			channel.leave()
		}
	}
})
*/

// Message handler
client.on("message", async message => {
	// Run spam filter
	if (client.guilds.get(message.guild.id).id == '525487377817534484') {
		client.emit('checkMessage', message);
	};
	
	// Make sure the user isn't a bot
	if (message.author.bot) return;
	
	// Auto translate message
	var msg = `${message}`
	if (!(msg.startsWith("http") || msg.startsWith("]"))) {
		if (!(msg.startsWith(":") && msg.indexOf(' ') == -1 && msg.endsWith(":"))) {
			translate.translate(`${message}`, { to: 'en' }, function(err, res) {
				if (`${message}` !== `${res.text}`) {
					if (`${res.text}` !== 'undefined') {
						log.TRAN(`${message.author}: ${message} -> ${res.text}`);
						const embed = new RichEmbed()
						.setDescription(`**${res.text}**`)
						.setAuthor(`${message.author.username} (${res.lang})`, message.author.displayAvatarURL)
						.setColor(0x2F5EA3)
						.setFooter('Translations from Yandex.Translate (http://cust.pw/y)')
						return message.channel.send(embed);
					}
				}
			});
		}
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

// Get Yandex API key
const translate = require('yandex-translate')(auth.yandex); // For translations

// Login using auth.json
client.login(auth.token);
