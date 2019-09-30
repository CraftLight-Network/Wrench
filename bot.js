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
const DiscordAntiSpam = require("discord-anti-spam");
const RateLimiter = require('limiter').RateLimiter;
const TokenBucket = require('limiter').TokenBucket;
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
});
// Anti-spam setup
const AntiSpam = new DiscordAntiSpam({
	warnThreshold: 4,
	kickThreshold: 7,
	maxInterval: 2000, // Interval the thresholds are tested for
	warnMessage: "{@user}, please stop spamming! Change your message or slow down.",
	kickMessage: "**{user_tag}** was kicked for spamming.",
	maxDuplicatesWarning: 4,
	maxDuplicatesBan: 10,
	deleteMessagesAfterBanForPastDays: 1, // (1-7)
	exemptPermissions: ["MANAGE_GUILD", "MANAGE_MESSAGES", "ADMINISTRATOR"],
	ignoreBots: false,
	verbose: false,
});
AntiSpam.on("kickAdd", (member) => log.INFO(`KICK: ${member.user.tag} from ${member.guild.name}`));

// Message handler
client.on("message", async (message) => {
	// Make sure enmap exists
	commandsRead.ensure("number", 0);
	messagesRead.ensure("number", 0);
	translationsDone.ensure("number", 0);
	if (message.guild !== null) settings.ensure(message.guild.id, defaultSettings);
	
	// Make sure the user isn't a bot
	if (message.author.bot) return;
	
	// Make content stuff easier
	const msg = message.content;

	// Run spam filter
	if (message.guild !== null) AntiSpam.message(message);

	// Auto translate message
	// I truly hate this. Time to try this again.
	const LanguageDetect = require('languagedetect');
	const lngDetector = new LanguageDetect();

	let translate = msg;
	async function translateMessage() {
		if (config.translator !== 'enabled' || msg.charAt(0) === config.prefix) return;

		// Message sanitization
		// Members
		if (message.guild !== null) {
			let users = message.guild.roles.get(message.guild.id).members.map(m => m.user.username).join('|');
			translate = translate.replace(new RegExp(users, "gi"), '');
		}

		translate = translate.replace(/http.[^\s]*/gu, '')		// Links
		.replace(/<@.*>|@[^\s]+/gu, '')							// Mentions
		.replace(/<:.*>|:.*:/gu, '')							// Emojis
		.replace(/[^\p{L}1-9'",!?.\-+\s]/giu, '')				// Symbols
		.replace(/\s+|`/gu, ' ').trim();						// Trimming

		// Ignore s p a c e d messages
		if (Math.round(translate.length / 2) === translate.split(" ").length) return;

		// Detect language
		if (translate.length < 5) return;
		const language = lngDetector.detect(translate)[0];
		if (language && language.includes('english')) return;

		// Ratelimiting
		const monthBucket = new TokenBucket('10000000', 'month', null);
		if (!monthBucket.tryRemoveTokens(msg.length)) return;
		const dayBucket = new TokenBucket('322580', 'day', null);
		if (!dayBucket.tryRemoveTokens(msg.length)) return;

		if (config.provider === 'yandex') {
			translator.translate(translate, {to: 'en'}, (err, translated) => {
				if (translate === `${translated.text}`) return;
				translationsDone.inc("number");
				log.TRAN(`${message.author}: ${translate} -> ${translated.text} (${translated.lang})`);

				const embed = new RichEmbed()
				.setAuthor(`${message.author.username} (${translated.lang})`, message.author.displayAvatarURL)
				.setDescription(`**${translated.text}**`)
				.setFooter('Translations from Yandex.Translate (http://cust.pw/y)')
				.setColor(0x2F5EA3);
				return message.channel.send(embed);
			});
		} else if (config.provider === 'google') {
			translator.translate(translate, 'en', (err, translated) => {
				translationsDone.inc("number");
				log.TRAN(`${message.author}: ${translate} -> ${translated.translatedText} (${translated.detectedSourceLanguage}-en)`);

				const embed = new RichEmbed()
				.setAuthor(`${message.author.username} (${translated.detectedSourceLanguage}-en)`, message.author.displayAvatarURL)
				.setDescription(`**${translated.translatedText}**`)
				.setFooter('Translations from Google Translate')
				.setColor(0x2F5EA3);
				return message.channel.send(embed);
			});
		}
	}
	translateMessage();
	
	// Neat message responses
	const greeting = ['hello', 'hallo', 'hi', 'hey', 'howdy', 'sup', 'yo', 'hola', 'bonjour', 'salut'];
	const think = ['thinking', 'think', 'thonk', 'thonking'];
	const farewell = ['goodbye', 'bye', 'cya', 'gtg'];
	
	if (greeting.includes(msg.replace(/ .*/,'').toLowerCase()) && msg.split(' ').length === 1) {
		message.react('👋').then(async function () {
			await message.react('🇭');
			await message.react('🇮');
		});
	}
	if (farewell.includes(msg.replace(/ .*/,'').toLowerCase()) && msg.split(' ').length === 1) {
		message.react('👋').then(async function () {
			await message.react('🇧');
			await message.react('🇾');
			await message.react('🇪');
		});
	}
	if (think.includes(msg.replace(/ .*/,'').toLowerCase()) && msg.split(' ').length === 1) {
		message.react('604381747328712879');
	}
	if (msg === 'lennyFace') message.channel.send('( ͡° ͜ʖ ͡°)');
	if (msg === 'lennyPeek') message.channel.send('┬┴┬┴┤ ͡° ͜ʖ ͡°)├┬┴┬┴');
	if (msg === 'lennyFight') message.channel.send('(ง ͡° ͜ʖ ͡°)ง');
	if (msg === 'bdgFace') message.channel.send('<:bdg:604374158876344347>');
	if (msg === 'bdgDab') message.channel.send('<:bdgDab:604381747899138067>');
	if (msg === 'shockCat') message.channel.send('<:shockCat:604381747614056468>');
	if (msg === 'hahREE') message.channel.send('<:hahREE:604381747513393182>');
	
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
	if (msg.charAt(0) === config.prefix) {
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
		var translator = require('yandex-translate')(auth.yandex); // Get Yandex API key
	} else if (config.provider === 'google') {
		log.INFO('Using Google Translate !! THIS COSTS !!')
		var translator = require('google-translate')(auth.google); // Get Google API key
	}
};

// Login using auth.json
client.login(auth.token);