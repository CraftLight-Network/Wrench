// Define and require modules
const { Command }	   = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const translate		   = require("../../data/js/translate");
const config		   = require("../../config");

const languages = [
	"auto", "zh", "en", "yue", "wyw",
	"jp", "kor", "fra", "spa", "th",
	"ara", "ru", "pt", "de", "it",
	"el", "nl", "pl", "bul", "est",
	"dan", "fin", "cs", "rom", "slo",
	"swe", "hu", "cht", "vie"
];

module.exports = class translateCommand extends Command {
	constructor(client) {
		super(client, {
			"name":		   "translate",
			"memberName":  "translate",
			"group":	   "misc",
			"description": "Translate a message from one language to another.",
			"details": stripIndents`
				Run \`${config.prefix.commands}translate <from> <to> <message>\` to translate a message.
				**Notes:**
				<from>: Required, the source language.
				<to>: Required, the destination language.
				<message>: Required, the message to send.
				Languages: \`${languages.join("`, `")}\`
				*For more, go to <https://www.npmjs.com/package/baidu-translate-api#languages>*
			`,
			"aliases":			 ["tran"],
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"args": [
				{
					"key":	  "from",
					"prompt": "What would you like to translate from?",
					"type":	  "string",
					"oneOf":  languages
				},
				{
					"key":	  "to",
					"prompt": "What would you like to translate to?",
					"type":	  "string",
					"oneOf":  languages.slice(1)
				},
				{
					"key":	  "translation",
					"prompt": "What would you like to translate?",
					"type":	  "string"
				}
			],
			"throttling": {
				"usages":	2,
				"duration": 5
			}
		});
	}

	run(message, { from, to, translation }) {
		translate(message, { "command": true, "from": from, "to": to, "translation": translation });
	}
};