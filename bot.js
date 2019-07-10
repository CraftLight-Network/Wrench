/*
			  _______
			 /		 \
			/	/####-
		   /   /
		__/	  /####
	   /		 \
	  /			./
	 /			/	________ ________
	 \_____	  //   |  |	 |	|	 ___ |
	 /@@@//	 //	   |  |	 |	|		 |
	/  /_/	//	   |		|	 ___ |
	\_/ /  //	   |________|________|
	  _/__//
	 /	 / /			WrenchBot
	/	/ /	   Fun and Helpful Discord Bot
   /   / /
  /	  / /				 v1.2.0
 /	 / /		Github: http://cust.pw/wb
/  O  /		   Issues: http://cust.pw/wbis
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
		['editing', 'Editing'],
		['helpful', 'Helpful'],
		['staff', 'Staff'],
		['info', 'Info'],
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
// Translation counter
const translationsDone = new Enmap({
	name: "translations-done",
	autoFetch: true,
	fetchAll: false
});
// Per-server settings
client.settings = new Enmap({
	name: "settings",
	fetchAll: false,
	autoFetch: true,
	cloneLevel: 'deep'
});

// Default settings
const defaultSettings = {
	logChannel: "log", // In the future...
	welcome: "false",
	welcomeChannel: "in-and-out",
	welcomeMessage: "Welcome {{user}}! Make sure to follow the rules!",
	leave: "leave",
	leaveChannel: "in-and-out",
	leaveMessage: "{{user}} just left. That's sad.",
	botChannelOnly: "false",
	botChannel: "commands"
}


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
		'EMPT': 3,
		'INFO': 4,
		'WARN': 5,
		'ERROR': 6,
		'CONSOLE': 7,
		'DEBUG': 8,
	},
	colors: {
		'OK': 'green',
		'CMD': 'cyan',
		'TRAN': 'cyan',
		'EMPT': 'black',
		'INFO': 'blue',
		'WARN': 'yellow',
		'ERROR': 'red',
		'CONSOLE': 'grey',
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
client.on("guildCreate", guild => {log.INFO(`Added in a new server: ${guild.name} (id: ${guild.id})`)}); // Notify the console that a new server is using the bot

// Notify the console that a server removed the bot
client.on("guildDelete", guild => { 
	log.INFO(`Removed from server: ${guild.name} (id: ${guild.id})`);
	client.settings.delete(guild.id);
});
// Events when a user is added
client.on("guildMemberAdd", member => {
	client.settings.ensure(member.guild.id, defaultSettings);
	client.settings.fetchEverything();
	if (client.settings.get(member.guild.id, "welcome") === 'false') return;
	let welcomeMessage = client.settings.get(member.guild.id, "welcomeMessage");
	welcomeMessage = welcomeMessage.replace("{{user}}", `<@${member.user.id}>`);
	member.guild.channels.find("name", client.settings.get(member.guild.id, "welcomeChannel")).send(welcomeMessage).catch(console.error);
});
// Events when a user is removed
client.on("guildMemberRemove", member => {
	client.settings.ensure(member.guild.id, defaultSettings);
	client.settings.fetchEverything();
	if (client.settings.get(member.guild.id, "leave") === 'false') return;
	let welcomeMessage = client.settings.get(member.guild.id, "leaveMessage");
	leaveMessage = leaveMessage.replace("{{user}}", member.user.tag);
	member.guild.channels.find("name", client.settings.get(member.guild.id, "leaveChannel")).send(leaveMessage).catch(console.error);
});

client.on('disconnect', event => {log.ERROR(`[DISCONNECT] ${event.code}`);process.exit(0)}); // Notify the console that the bot has disconnected

// // Client actions

// Set the activity list
const activities_list = [`${config.prefix}help`,  "On CustomCraft", "On Fallout Salvation", "On Ethereal", "with code", "with Edude42", "with Braven", "with Spade", "with Cas", "."];

// When the bot starts
client.on("ready", () => {
	// Startup messages
	log.OK(`---------------------------------------------`);
	log.OK(`BOT START ON: ${utcDate}`);
	log.OK(`---------------------------------------------`);
	log.OK(`[READY] Bot has started.`);
	log.INFO(`Name: ${client.user.tag} ID: ${client.user.id}`);
	log.INFO(`Active in ${client.guilds.size} servers.`);
	log.INFO(` `);
	log.INFO(`Press CTRL+C to stop the bot.`);
	
	// Default activity message
	client.user.setActivity("a game.");
	
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
		maxDuplicatesWarning: 5, // Max duplicates before warn
		maxDuplicatesBan: 10, // Max duplicates before ban
		deleteMessagesAfterBanForPastDays: 1, // Delete messages x days ago
		exemptRoles: ["Admin", "Manager"], // Ignored roles NOTE: Will make server-specific
		exemptUsers: ["Edude42#2812", "WrenchBot#3085"] // Ignored users
	});
});

client.on('guildMemberAdd', member => {
	member.addRole('525501371269513236');
});

/*
// Music !! VERY WIP !!	  Note: This most likely will not be updated for a while
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
client.on("message", async (message) => {
	// Make sure enmap exists
	commandsRead.ensure("number", 0);
	messagesRead.ensure("number", 0);
	translationsDone.ensure("number", 0);
	client.settings.ensure(member.guild.id, defaultSettings);
	
	// Run spam filter
	if (message.guild !== null && message.attachments.size <= 0) {
		client.emit('checkMessage', message);
	}
	
	// Make sure the user isn't a bot
	if (message.author.bot) return;
	
	// Odd error fix
	const tmpMsg = `${message}`;
	
	// Auto translate message
	if (config.translator === 'enabled') {
		const users = message.guild.roles.get(message.guild.id).members.map(m=>m.user.username).join('||').toUpperCase().replace(/\d+/gm, "").split('||');
		var msg = tmpMsg.replace(/\n/g, "").replace(/<(@.*?)>/g, "").replace(/http.[^\s]*/ig, "").replace(/<(:.*?)>|:\S*:(?!\S)/g, "").replace(/<(:.*?)>/ig, "").replace(/`\S*[\s\S](.*?)`\n*\S*/gm, ""); // Mention, Link, Emojis, Code
		if (new RegExp(users.join("|")).test(msg.toUpperCase())) return;
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
							var FILL_RATE = 1024 * 1024 * 1048576;
							const bucket = new TokenBucket(FILL_RATE, 'day', null);
							bucket.removeTokens(`${msg}`, function() {
								if (message.content.indexOf(config.prefix) === 0) return;
								translate.detectLanguage(`${msg}`, function(err, detection) {
									if (detection.language !== 'en' && detection.confidence >= 0.8 || detection.isReliable === 'true') {
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
	const farewell = ['goodbye', 'bye', 'cya']
	
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

	
	// Check if it's in a bot-only channel (If needed)
	if (client.settings.get(message.guild.id, "botChannelOnly") == 'true' && message.content.indexOf(config.prefix) === 0) {
		console.log('botOnly True and prefix detected')
		if (message.channel.name !== client.settings.get(message.guild.id, "botChannel")) {
			message.author.send('Please do not use bot commands in that channel! You will be punished.'); // No punishment yet
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