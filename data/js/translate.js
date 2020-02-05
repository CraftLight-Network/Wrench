// Get logger
const { log } = require("./logger.js");

// Define and require modules
const TokenBucket = require("limiter").TokenBucket;
const { translations } = require("./enmap.js");
const similar = require("string-similarity");
const { RichEmbed } = require("discord.js");
const config = require("../../config.json");

// Translate function
module.exports = async function translate(message, translator) {
	// Define variables
	let translate = message.content;

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
	switch (config.translator.provider) {
		case "yandex":
			translator.translate(translate, { "to": "en" }, (err, translated) => {
				const options = {
					"text": translated.text,
					"lang": {
						"from": translated.lang,
						"to": ""
					},
					"link": "Yandex",
					"provider": "Yandex Translate"
				};

				translateEmbed(options);
			}).catch();
			break;

		case "google":
			translator.translate(translate, "en", (err, translated) => {
				const options = {
					"text": translated.translatedText,
					"lang": {
						"from": translated.detectedSourceLanguage,
						"to": "-en"
					},
					"link": "google",
					"provider": "Google Translate"
				};

				translateEmbed(options);
			}).catch();
			break;

		case "baidu":
			translator(translate).then(translated => {
				const options = {
					"text": translated.trans_result.dst,
					"lang": {
						"from": translated.from,
						"to": "-en"
					},
					"link": "baidu",
					"provider": "Baidu Translate"
				};

				translateEmbed(options);
			}).catch(function() {});
			break;
	}

	function translateEmbed(options) {
		// Make sure translations are not the same
		if (similar.compareTwoStrings(translate.replace(/[^\p{L}0-9\s]/gi, "").toLowerCase(), `${options.text}`.replace(/[^\p{L}0-9\s]/gi, "").toLowerCase()) >= 0.70) return;
		if (translate === `${options.text}`) return;

		// Log the result
		translations.inc("number");
		log.translate(`${message.author.tag}: ${translate} -> ${options.text} (${options.lang.from}${options.lang.to})`);

		const embed = new RichEmbed()
			.setAuthor(`${message.author.username} (${options.lang.from}${options.lang.to})`, message.author.displayAvatarURL)
			.setDescription(`**${options.text}**`)
			.setFooter(`Translations from ${options.provider}. (http://cust.pw/${options.link})`)
			.setColor("#E3E3E3");

		return message.channel.send(embed);
	}
};