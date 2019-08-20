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
				return new Date().toLocaleString("en-US") + ' UTC';
			},
			colorize: true,
			level: 'ERROR'
		}),
		new (winston.transports.DailyRotateFile)({ // File logging
			name: 'log-file',
			json: false,
			datePattern: 'M-D-YYYY',
			timestamp: function() {
				return new Date().toLocaleString("en-US") + ' UTC';
			},
			filename: 'data/private/logs/log-%DATE%.log',
			zippedArchive: true,
			maxSize: '128m',
			maxFiles: '14d',
			level: 'ERROR'
		}),
	]
});

// Grab the logger
const { logger } = require('./data/js/logger.js');
logger(client, log, settings, defaultSettings);



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
		warnBuffer: 15, // Max messages before warn
		maxBuffer: 25, // Max messages before ban
		interval: 10000, // How many milliseconds the checks are for
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
	
	// Stringify the message (lazy)
	const tmpMsg = `${message}`;
	
	// Auto translate message
	const excludedWords = ['af', 'bruh']; // Put problematic words here
	
	function translateMessage() {
		if (config.translator === 'enabled') {
			if (message.guild === null) return;
			let tranMsg = tmpMsg.replace(new RegExp('\\b' + excludedWords.join('\\b|\\b') + '\\b'), "");
			const users = message.guild.roles.get(message.guild.id).members.map(m=>m.user.username).join('||').toUpperCase().replace(/\d+/gm, "").split('||');
			
			tranMsg = tranMsg.replace(/\n|<(@.*?)>|http.[^\s]*|<(:.*?)>|:\S*:(?!\S)|`\S*[\s\S](.*?)`\n*\S*/igm, "").replace(/\s+/g,' ').replace(/((?![a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ ]).)*/g, '').trim(); // Single line, links, emoji x2, code , useless spaces, non-language characters
			if (new RegExp(users.join("|")).test(tranMsg.toUpperCase())) {tranMsg = tranMsg.replace(new RegExp(users.join("|"), "i"), "")}
			
			const countSpace = tranMsg.replace(/[^a-zA-Z0-9 ]/gmi, "").trim();
			const replace = countSpace.replace(/ +(?= )/gmi, " ").replace(/[^ ]/gmi, "").length+1;
			if (Math.round(countSpace.length / 2) === replace) return;
			
			if (tranMsg.length > 5) {
				if (config.provider === 'yandex') {
					const monthBucket = new TokenBucket('1024 * 1024 * 10000000000', 'month', null);
					monthBucket.removeTokens(tranMsg.byteLength, function() {
						const dayBucket = new TokenBucket('1024 * 1024 * 1000000000', 'day', null);
						dayBucket.removeTokens(tranMsg.byteLength, function() {
							if (message.content.indexOf(config.prefix) === 0) return;
							translate.translate(tranMsg, {to: 'en'}, (err, res) => {
								if (tranMsg === `${res.text}` || `${res.text}` === 'undefined') return;
								translationsDone.inc("number");
								log.TRAN(`${message.author}: ${tranMsg} -> ${res.text} (${res.lang})`);
								const embed = new RichEmbed()
								.setDescription(`**${res.text}**`)
								.setAuthor(`${message.author.username} (${res.lang})`, message.author.displayAvatarURL)
								.setColor(0x2F5EA3)
								.setFooter('Translations from Yandex.Translate (http://cust.pw/y)');
								return message.channel.send(embed);
							});
						});
					});
				}
						
				if (config.provider === 'google') {
					const limiter = new RateLimiter(500, 100000);
					limiter.removeTokens(1, function(err, remainingRequests) {
						if (remainingRequests < 1) return;
						const bucket = new TokenBucket('1024 * 1024 * 1048576', 'day', null);
						bucket.removeTokens(tranMsg.byteLength, function() {
							if (message.content.indexOf(config.prefix) === 0) return;
							translate.detectLanguage(tranMsg, function(err, detection) {
								if (detection.language !== 'en' && detection.confidence === 1) {
									translate.translate(tranMsg, 'en', (err, translation) => {
										if (tranMsg !== `${translation.translatedText}` || `${translation.translatedText}` !== 'undefined') {
											translationsDone.inc("number");
											log.TRAN(`${message.author}: ${tranMsg} -> ${translation.translatedText} (${detection.language}-en)`);
											const embed = new RichEmbed()
											.setDescription(`**${translation.translatedText}**`)
											.setAuthor(`${message.author.username} (${detection.language}-en)`, message.author.displayAvatarURL)
											.setColor(0x2F5EA3);
											return message.channel.send(embed);
										}
									});
								}
							});
						});
					});
				}
			}
		}
	};
	translateMessage();
	
	// Neat message responses
	const greeting = ['hello', 'hallo', 'hi', 'hey', 'howdy', 'sup', 'yo', 'hola', 'bonjour', 'salut'];
	const think = ['thinking', 'think', 'thonk', 'thonking'];
	const farewell = ['goodbye', 'bye', 'cya', 'gtg'];
	
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
	if (think.includes(tmpMsg.replace(/ .*/,'').toLowerCase()) && tmpMsg.split(' ').length === 1) {
		message.react('604381747328712879');
	}
	if (tmpMsg === 'lennyFace') message.channel.send('( ͡° ͜ʖ ͡°)');
	if (tmpMsg === 'lennyPeek') message.channel.send('┬┴┬┴┤ ͡° ͜ʖ ͡°)├┬┴┬┴');
	if (tmpMsg === 'lennyFight') message.channel.send('(ง ͡° ͜ʖ ͡°)ง');
	if (tmpMsg === 'bdgFace') message.channel.send('<:bdg:604374158876344347>');
	if (tmpMsg === 'bdgDab') message.channel.send('<:bdgDab:604381747899138067>');
	if (tmpMsg === 'shockCat') message.channel.send('<:shockCat:604381747614056468>');
	if (tmpMsg === 'hahREE') message.channel.send('<:hahREE:604381747513393182>');
	
	// Stop commands in the wrong channel (If needed)
	client.settings = settings
	client.settings.fetchEverything();
	
	client.dispatcher.addInhibitor(message => {
		if (message.guild !== null && !message.member.hasPermission('MANAGE_GUILD')) {
			if (client.settings.get(message.guild.id, "bot") !== "[ 'none' ]" && message.content.indexOf(config.prefix) === 0) {
				if (!(client.settings.get(message.guild.id, "bot").includes(message.channel.name))) {
					try {message.delete()} catch(err) {};
					return message.author.send('Please do not use bot commands in that channel!');
				}
			}
		}  
	});
	
	// Log commands and increase message count
	if (tmpMsg.charAt(0) === config.prefix) {
		log.CMD(`${message.author}: ${message}`);
		return commandsRead.inc("number");
	}
	
	messagesRead.inc("number");
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