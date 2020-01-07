// Get logger
const { log } = require("./logger.js");

// Define and require modules
const RateLimiter = require("limiter").RateLimiter;
const TokenBucket = require("limiter").TokenBucket;
const { translations } = require("./enmap.js");
const similar = require("string-similarity");
const { RichEmbed } = require("discord.js");
const config = require("../../config.json");
const Enmap = require("enmap");

// Translate function
module.exports.translate = async function translate(message, translator) {
	// Define variables
	let translate = message.content;
	let translatedText;
	let translatedFrom;
	let translatedTo;
	let provider;
	let link;

	// Check if message is translatable
	if (!config.translator.enabled || translate.charAt(0) === config.prefix) return;

	// Message sanitization
	// Members
	if (message.guild !== null) {
		const users = message.guild.roles.get(message.guild.id).members.map(m => m.user.username).join("|");
		translate = translate.replace(new RegExp(users, "gi"), "");
	}

	translate = translate.replace(/http.[^\s]*/gu, "")		// Links
		.replace(/<@.*>|@[^\s]+/gu, "")						// Mentions
		.replace(/<:.*>|:.*:/gu, "")						// Emojis
		.replace(/[^\p{L}1-9.,!?'"\-+\s]/giu, "")			// Symbols
		.replace(/`|\s+/gu, " ").trim();					// Trimming

	// Ignore s p a c e d messages
	if (Math.round(translate.length / 2) === translate.split(" ").length) return;
	if (translate === "") return;

	// Detect language
	var validLang = true;
	const LanguageDetect = require("languagedetect");
	const lngDetector = new LanguageDetect();
	const language = lngDetector.detect(translate, 5);

	if (!language || !language[0]) return;
	if (language[0][0] === "english") return;
	language.forEach(lang => {if (lang[0] === "english" && lang[1] > 0.20) validLang = false;});
	if (language[0][1] <= 0.25) return;
	if (!validLang) return;

	// Ratelimiting
	const monthBucket = new TokenBucket("10000000", "month", null);
	if (!monthBucket.tryRemoveTokens(message.content.length)) return;
	const dayBucket = new TokenBucket("322580", "day", null);
	if (!dayBucket.tryRemoveTokens(message.content.length)) return;

	// Translate the message
	if (config.translator.provider === "yandex") {
		translator.translate(translate, { "to": "en" }, (err, translated) =>
			translateEmbed(translated.text, translated.lang, "", "Yandex.Translate", "yandex")
		).catch(function () {const hide = 1});
	}
	if (config.translator.provider === "google") {
		translator.translate(translate, "en", (err, translated) =>
			translateEmbed(translated.translatedText, translated.detectedSourceLanguage, "-en", "Google Translate", "google")
		).catch(function () {const hide = 1});
	}
	if (config.translator.provider === "baidu") {
		translator(translate).then(translated =>
			translateEmbed(translated.trans_result.dst, translated.from, "-en", "Baidu Translate", "baidu")
		).catch(function () {const hide = 1});
	}
	function translateEmbed(translatedText, translatedFrom, translatedTo, provider, link) {
		if (similar.compareTwoStrings(translate.replace(/[^\p{L}1-9\s]/giu, "").toLowerCase(), `${translatedText}`.replace(/[^\p{L}1-9\s]/giu, "").toLowerCase()) >= 0.70) return;
		if (translate === `${translatedText}`) return;
		translations.inc("number");
		log.translate(`${message.author.tag}: ${translate} -> ${translatedText} (${translatedFrom}${translatedTo})`);

		const embed = new RichEmbed()
			.setAuthor(`${message.author.username} (${translatedFrom}${translatedTo})`, message.author.displayAvatarURL)
			.setDescription(`**${translatedText}**`)
			.setFooter(`Translations from ${provider}. (http://cust.pw/${link})`)
			.setColor("#E3E3E3");
		return message.channel.send(embed);
	}
};