/*
              _______
             /       \
            /   /####-
           /   /
        __/   /####
       /         \
      /         ./
     /          /   ________ ________
     \_____   //   |  |  |  |    ___ |
     /@@@//  //    |  |  |  |        |
    /  /_/  //     |        |    ___ |
    \_/ /  //      |________|________|
      _/__//
     /   / /            WrenchBot
    /   / /    Fun and Helpful Discord Bot
   /   / /
  /   / /                v1.2.0
 /   / /        Github: http://cust.pw/wb
/  O  /        Issues: http://cust.pw/wbis
\____/
*/

// // Bot setup
const { CommandoClient } = require('discord.js-commando');
const RateLimiter = require('limiter').RateLimiter;
const TokenBucket = require('limiter').TokenBucket;
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
		['manipulation', 'Manipulation'],
		['helpful', 'Helpful'],
		['staff', 'Staff'],
	])
	.registerDefaultGroups()
	.registerDefaultCommands({
		eval: false
	})
	.registerCommandsIn(path.join(__dirname, 'commands'));

// Setup enmap
const Enmap = require("enmap");
const { commandsRead, messagesRead, translationsDone, settings } = require('./data/js/enmap.js');
const defaultSettings = require('./data/json/default.json');



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
		'INFO': 1,
		'CMD': 2,
		'TRAN': 3,
		'WARN': 4,
		'ERROR': 5,
	},
	colors: {
		'OK': 'green',
		'INFO': 'blue',
		'CMD': 'cyan',
		'TRAN': 'cyan',
		'WARN': 'yellow',
		'ERROR': 'red',
	},
	handleExceptions: true,
	transports: [
		new (winston.transports.Console)({ // Console logging
			name: 'log-console',
			timestamp: function() {
				return new Date().toLocaleString("en-US");
			},
			colorize: true,
			level: 'ERROR'
		}),
		new (winston.transports.DailyRotateFile)({ // File logging
			name: 'log-file',
			json: false,
			datePattern: 'M-D-YYYY',
			timestamp: function() {
				return new Date().toLocaleString("en-US");
			},
			filename: 'data/private/logs/log-%DATE%.log',
			zippedArchive: true,
			maxSize: '128m',
			maxFiles: '14d',
			level: 'ERROR'
		}),
	]
});

process.on('unhandledRejection', (err, p) => {log.ERROR(`Rejected Promise: ${p} / Rejection: ${err}`);}); // Unhandled Rejection
client.on('error', err => log.ERROR(err)); // Errors
client.on('warn', warn => log.WARN(warn)); // Warnings
client.on('log', log => log.CONSOLE(log)); // Logs

// Notify the console that a new server is using the bot
client.on("guildCreate", guild => {log.INFO(`Added in a new server: ${guild.name} (id: ${guild.id})`); settings.ensure(guild.id)});

// Notify the console that a server removed the bot
client.on("guildDelete", guild => {log.INFO(`Removed from server: ${guild.name} (id: ${guild.id})`); settings.delete(guild.id)});

// Events when a user is added
client.on("guildMemberAdd", member => {
	settings.ensure(member.guild.id, defaultSettings);
	settings.fetchEverything();
	
	if (settings.get(member.guild.id, "welcome") !== 'none') {
		if (!member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "welcome"))) return;
		
		let welcomeMessage = settings.get(member.guild.id, "welcomeMessage");
		welcomeMessage = welcomeMessage.replace("{{user}}", `<@${member.user.id}>`);
		welcomeMessage = welcomeMessage.replace("{{id}}", member.user.id);
		
		member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "welcome")).send(welcomeMessage).catch(console.error);
	}
	
	if (settings.get(member.guild.id, "joinRole") !== 'none') {
		if (!member.guild.roles.find(role => role.name == settings.get(member.guild.id, "joinRole"))) return;
		
		member.addRole(member.guild.roles.find(role => role.name == settings.get(member.guild.id, "joinRole")).id).catch(console.error);
	}
	
	if (settings.get(member.guild.id, "log") !== 'none') {
		if (!member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "log"))) return;
	
		const embed = new RichEmbed()
		.setFooter(new Date().toLocaleDateString("en-US"))
		.setDescription(`**<@${member.user.id}>**`)
		.setAuthor('Member joined', member.user.displayAvatarURL)
		.setColor(0x00FF00);
		member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "log")).send(embed).catch(console.error);
	}
});

// Events when a user is removed
client.on("guildMemberRemove", member => {
	settings.ensure(member.guild.id, defaultSettings);
	settings.fetchEverything();
	
	if (settings.get(member.guild.id, "leave") !== 'none') {
		if (!member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "leave"))) return;
	
		let leaveMessage = settings.get(member.guild.id, "leaveMessage");
		leaveMessage = leaveMessage.replace("{{user}}", `<@${member.user.id}>`);
		leaveMessage = leaveMessage.replace("{{id}}", member.user.id);
		
		member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "leave")).send(leaveMessage).catch(console.error);
	}
	
	if (settings.get(member.guild.id, "log") !== 'none') {
		if (!member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "log"))) return; 
	
		const embed = new RichEmbed()
		.setFooter(new Date().toLocaleDateString("en-US"))
		.setDescription(`**<@${member.user.id}>**`)
		.setAuthor('Member left', member.user.displayAvatarURL)
		.setColor(0xFF0000);
		member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "log")).send(embed).catch(console.error);
	}
});

client.on('disconnect', event => {log.ERROR(`[DISCONNECT] ${event.code}`);process.exit(0)}); // Notify the console that the bot has disconnected



// // Client actions

// Set the activity list
const activities_list = [`${config.prefix}help`,  "on CustomCraft", "on Fallout Salvation", "on Ethereal", "with code", "with Edude42", "with Braven", "with Spade", "with Cas", "."];

// When the bot starts
client.on("ready", () => {
	// Startup messages
	log.OK(`---------------------------------------------`);
	log.OK(`BOT START ON: ${utcDate}`);
	log.OK(`---------------------------------------------`);
	log.INFO(`Name: ${client.user.tag} ID: ${client.user.id}`);
	log.INFO(`Active in ${client.guilds.size} servers.`);
	
	// Default activity message
	client.user.setActivity("a game.");
	
	// Random activity message
	setInterval(() => {
		const index = Math.floor(Math.random() * (activities_list.length - 1) + 1);
		client.user.setActivity(activities_list[index]);
	}, 30000);
	
	// Anti-spam setup
	antispam(client, {
		warnBuffer: 3, // Max messages before warn
		maxBuffer: 5, // Max messages before ban
		interval: 1000, // How many milliseconds the checks are for
		warningMessage: "stop spamming! Change your message or slow down.", // Warn message
		banMessage: "spammed and got banned!", // Ban message
		maxDuplicatesWarning: 7, // Max duplicates before warn
		maxDuplicatesBan: 13, // Max duplicates before ban
		deleteMessagesAfterBanForPastDays: 1, // Delete messages x days ago
		exemptUsers: ['Edude42#2812', 'Spade#1690'] // Ignored users
	});
});

// Message handler
client.on("message", async (message) => {
	// Make sure enmap exists
	commandsRead.ensure("number", 0);
	messagesRead.ensure("number", 0);
	translationsDone.ensure("number", 0);
	if (message.guild !== null) {
		settings.ensure(message.guild.id, defaultSettings);
	}
	
	// Make sure the user isn't a bot
	if (message.author.bot) return;
	
	// Run spam filter
	if (message.guild !== null && message.attachments.size <= 0) {
		client.emit('checkMessage', message);
	}
	
	// Stringify the message
	const tmpMsg = `${message}`;
	
	// Auto translate message
	const excludedWords = ['af', 'bruh']; // Put problematic words here
	
	if (config.translator === 'enabled') {
		if (message.guild == null) return;
		var exclude = new RegExp('\\b' + excludedWords.join('\\b|\\b') + '\\b');
		const users = message.guild.roles.get(message.guild.id).members.map(m=>m.user.username).join('||').toUpperCase().replace(/\d+/gm, "").split('||');
		var msg = tmpMsg.replace(/\n/g, "").replace(/<(@.*?)>/g, "").replace(/http.[^\s]*/ig, "").replace(/<(:.*?)>|:\S*:(?!\S)/g, "").replace(/<(:.*?)>/ig, "").replace(/`\S*[\s\S](.*?)`\n*\S*/gm, "").replace(exclude, ""); // Mention, Link, Emojis, Code
		if (new RegExp(users.join("|")).test(msg.toUpperCase())) {
			var msg = msg.replace(new RegExp(users.join("|"), "i"), "");
		}
		if (msg.length > 5) { 
			if (msg.split(" ").length !== Math.round(msg.length / 2)) {
				const unique = msg.split('').filter(function(item, i, ar){ return ar.indexOf(item) === i; }).join('');
				if (unique.length > 5) {
					if (config.provider === 'yandex') {
						if (message.content.indexOf(config.prefix) === 0) return;
						translate.translate(`${msg}`, { to: 'en' }, (err, res) => {
							if (`${msg}` !== `${res.text}`) {
								if (`${res.text}` !== 'undefined') {
									translationsDone.inc("number");
									log.TRAN(`${message.author}: ${msg} -> ${res.text}`);
									const embed = new RichEmbed()
									.setDescription(`**${res.text}**`)
									.setAuthor(`${message.author.username} (${res.lang})`, message.author.displayAvatarURL)
									.setColor(0x2F5EA3)
									.setFooter('Translations from Yandex.Translate (http://cust.pw/y)');
									return message.channel.send(embed);
								}
							}
						});
					}
					if (config.provider === 'google') {
						const limiter = new RateLimiter(500, 100000);
						limiter.removeTokens(1, function(err, remainingRequests) {
							if (remainingRequests < 1) return;
							var FILL_RATE = 1024 * 1024 * 1048576;
							const bucket = new TokenBucket(FILL_RATE, 'day', null);
							bucket.removeTokens(msg.byteLength, function() {
								if (message.content.indexOf(config.prefix) === 0) return;
								translate.detectLanguage(`${msg}`, function(err, detection) {
									if (detection.language !== 'en' && detection.confidence === 1) {
										translate.translate(`${msg}`, 'en', (err, translation) => {
											if (`${translation.translatedText}` !== 'undefined') {
												if (`${msg}` !== `${translation.translatedText}`) {
													translationsDone.inc("number");
													log.TRAN(`${message.author}: ${msg} -> ${translation.translatedText}`);
													const embed = new RichEmbed()
													.setDescription(`**${translation.translatedText}**`)
													.setAuthor(`${message.author.username} (${detection.language}-en)`, message.author.displayAvatarURL)
													.setColor(0x2F5EA3);
													return message.channel.send(embed);
												}
											}
										});
									}
								});
							});
						});
					}
				}
			}
		}
	};
	
	// Neat message responses
	const greeting = ['hello', 'hallo', 'hi', 'hey', 'howdy', 'sup', 'yo', 'hola', 'bonjour', 'salut']
	const farewell = ['goodbye', 'bye', 'cya', 'gtg']
	
	if (greeting.includes(tmpMsg.replace(/ .*/,'').toLowerCase()) && tmpMsg.split(' ').length === 1) {
		message.react('👋').then(async function () {
			await message.react('🇭');
			await message.react('🇮');
		});
	}
	if (farewell.includes(tmpMsg.replace(/ .*/,'').toLowerCase()) && tmpMsg.split(' ').length === 1) {
		message.react('👋').then(async function () {
			await message.react('🇧');
			await message.react('🇾');
			await message.react('🇪');
		});
	}
	
	// Stop commands in the wrong channel (If needed)
	client.settings = settings
	
	if (message.guild !== null && !message.member.hasPermission('MANAGE_GUILD')) {
		client.settings.fetchEverything();
		if (client.settings.get(message.guild.id, "bot") !== "none" && message.content.indexOf(config.prefix) === 0) {
			if (!(client.settings.get(message.guild.id, "bot").includes(message.channel.name))) {
				client.dispatcher.addInhibitor(message => {
					try {message.delete()} catch(err) {};
					return message.author.send('Please do not use bot commands in that channel!');
				});
			}
		}
	}
	
	// Log commands and increase message count
	if (message.content.indexOf(config.prefix) === -1) return messagesRead.inc("number");
	
	log.CMD(`${message.author}: ${message}`);
	commandsRead.inc("number");
});

// Log deleted messages
client.on("messageDelete", (message) => {
	if (settings.get(message.guild.id, "log") !== 'none') {
		// Stringify the message
		const tmpMsg = `${message}`;
		
		if (!message.guild.channels.find(channel => channel.name == settings.get(message.guild.id, "log"))) return; 
	
		const embed = new RichEmbed()
		.setFooter(new Date().toLocaleDateString("en-US"))
		.setDescription(`By: **<@${message.author.id}>**\nContent: **${tmpMsg}**`) //.substring(0, 4) + "..."
		.setAuthor('Message deleted', message.author.displayAvatarURL)
		.setColor(0xFF0000);
		message.guild.channels.find(channel => channel.name == settings.get(message.guild.id, "log")).send(embed).catch(console.error);
	}
});



// // Logging in

// Require the authentication key file
const auth = require("./auth.json");

// Login to the right translator
if (config.translator === 'enabled') {
	if (config.provider === 'yandex') {
		log.INFO('Using Yandex.Translate')
		var translate = require('yandex-translate')(auth.yandex); // Get Yandex API key
	} else if (config.provider === 'google') {
		log.INFO('Using Google Translate !! THIS COSTS !!')
		var translate = require('google-translate')(auth.google); // Get Google API key
	}
};

// Login using auth.json
client.login(auth.token);