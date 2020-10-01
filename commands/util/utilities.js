// Define and require modules
const { Command }      = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const Embed            = require("discord.js").MessageEmbed;
const totals           = require("../../data/js/enmap").totals;
const config           = require("../../config");
const path             = require("jsonpath");

module.exports = class UtilitiesCommand extends Command {
	constructor(client) {
		super(client, {
			"name":        "utilities",
			"memberName":  "utilities",
			"group":       "util",
			"description": "Boilerplate functions used in various commands.",
			"aliases":     ["utils"],
			"ownerOnly": true
		});
	}

	reload() {this.inject()}

	inject() {
		/**
		 * Construct a message embed.
		 * @param {object}   options                                - Options for the embed.
		 * @param {Message}  [options.message]                      - Provides extra data for embed info.
		 * @param {Array}    [options.attachments]                  - Files (or links) attached to the embed.
		 * @param {string}   [options.author]                       - Author of the embed.
		 * @param {string}   [options.title]                        - Title of the embed.
		 * @param {string}   [options.url]                          - Clickable URL of the title.
		 * @param {string}   [options.thumbnail]                    - URL or attachment for right-hand image.
		 * @param {string}   [options.description]                  - Description of the embed.
		 * @param {fields}   [options.fields]                       - Fields to add to the description.
		 * @param {string}   [options.image]                        - URL or attachment for the bottom image.
		 * @param {Boolean}  [options.timestamp=false]              - Show the footer timestamp.
		 * @param {string}   [options.footer="Requested by {USER}"] - Footer of the embed.
		 * @param {string}   [options.color=#e3e3e3]              - HEX color to show on side stripe.
		 * @example embed({ "title": "Hello World", "footer": ":)" });
		 */
		this.client.embed = options => {
			// Convert member to message
			if (options.message && !options.message.content && options.message.username) options.message.author = options.message;

			// Set default options
			if      (options.footer === undefined && options.message) options.footer = `Requested by ${options.message.author.tag}`;
			else if (!options.footer) options.footer = "";
			if      (!options.color) options.color = "#E3E3E3";

			// Make the embed
			const embed = new Embed()
				.setFooter(options.footer)
				.setColor(options.color);

			// Add attachments
			if (options.attachments) embed.attachFiles(options.attachments);

			// Add author
			if (options.author) {
				embed.setAuthor(options.author.name, options.author.picture);
			}

			// Add title, url, thumbnail, and description
			if (options.title)                embed.setTitle(options.title);
			if (options.title && options.url) embed.setURL(options.url);
			if (options.thumbnail)            embed.setThumbnail(options.thumbnail);
			if (options.description)          embed.setDescription(options.description);

			// Add fields
			if (options.fields) {
				options.fields.forEach(e => {
					if (!e[2]) e[2] = false;
					embed.addField(e[0], e[1], e[2]);
				});
			};

			// Add image
			if (options.image) embed.setImage(options.image);

			// Add timestamp
			if (options.timestamp) embed.setTimestamp();

			return embed;
		};

		// User input
		this.client.userInput = async (message, options) => {
			// Default options if not defined
			if (!options.question)            options.question = "What would you like to do?";
			if (options.cancel === undefined) options.cancel   = true;
			if (!options.timeout)             options.timeout  = 30;
			if (!options.validate)            options.validate = false;

			let result = options.variable;
			while (!result) {
				// Ask the question
				const cancel = options.cancel ? `Respond with \`cancel\` to cancel the command. The command will automatically be cancelled in ${options.timeout} seconds.` : "";

				await message.reply(stripIndents`
					${options.question}
					${cancel}
				`);

				// Take user input
				result = await message.channel.awaitMessages(res => res.author.id === message.author.id, {
					"max":  1,
					"time": options.timeout * 1000
				});

				// Set result to input
				await result.find(i => result = i.content);
				if (options.cancel) if (result === "cancel") break;

				// Validate input
				if (!options.validate) break;
				if (!options.validate.array.includes(result)) return result = "" && message.reply(`Invalid ${options.validate.name}.`);
			}
			return result;
		};

		// Permission check
		this.client.checkRole = (message, roles) => {
			let hasRole = false;
			roles.some(r => {if (message.member.roles.cache.has(r)) return hasRole = true;});
			if (!hasRole && message.author.id !== message.guild.owner.id && !config.owners.includes(message.author.id)) return false;
			return true;
		};

		this.client.placeholders = (message, custom) => {
			// Pre-set placeholders
			const placeholders = {
				"%prefix%":             config.prefix.commands,
				"%prefix_tags%":        config.prefix.tags,
				"%total_servers%":      this.client.guilds.cache.size,
				"%total_commands%":     totals.get("commands"),
				"%total_messages%":     totals.get("messages"),
				"%total_translations%": totals.get("translations"),
				"%total_automod%":      totals.get("automod")
			};

			// Custom placeholders
			if (custom !== undefined) {
				custom.forEach(e => placeholders[e[0]] = e[1]);
			}

			// Replace placeholders
			for (const i in placeholders) message = message.replace(i, placeholders[i]);
			return message;
		};

		this.client.commonPlaceholders = (object, mode) => {
			let placeholders;
			if (mode === "member") {
				placeholders = [
					["%memberName%",  object.displayName],
					["%memberID%",    object.id],
					["%memberTag%",   object.user.tag],
					["%server%",      object.guild.name],
					["%serverCount%", object.guild.memberCount]
				];
			}

			return placeholders;
		};

		this.client.embedToString = message => {
			let embeds = "";
			if (message.embeds !== undefined) {
				message.embeds.forEach(e => {
					let es = [];

					es.push(
						e.title       ? e.title                       : "",
						e.author      ? e.author.name                 : "",
						e.description ? truncate(
							e.description.replace(/[\r\n]+|  +/gm, ""),
							75
						) : "",
						e.image       ? truncate(e.image.url, 40)     : "",
						e.thumbnail   ? truncate(e.thumbnail.url, 40) : "",
						e.footer      ? e.footer.text                 : "",
						e.timestamp   ? e.timestamp                   : "",
						e.color       ? e.color                       : ""
					); es = es.filter(Boolean);

					embeds += `Embed: [${es.join(" | ")}] `;
				});
			}

			return message.content += embeds;
		};

		// Replace mentions with users
		this.client.translate = (message, mode) => {
			if (mode === "mentions") return mentions();

			function mentions() {
				const match = message.match(/<@!\d+>/g);
				if (match) match.forEach(e => message = message.replace(e, this.client.users.cache.get(e.replace(/[^\d]/g, "")).username));
				return message;
			}
		};

		// Check if a string includes content from an array
		this.client.check = (string, compare) => {
			let found = false;
			if (Array.isArray(compare)) {
				compare.some(c => string.match(new RegExp(c, "gi")));
			} else if (string.match(compare)) found = true;

			return found;
		};

		this.client.parseJSON = json => {
			let output = {};
			try {output = JSON.parse(json)} catch {}

			return output;
		};

		// Get message from partials
		this.client.getMessage = async message => {
			if (message.partial) return await message.fetch();
			else return message;
		};

		// Misc.
		this.client.isCommand = (message, command) => {
			if (message.content.charAt(0) === config.prefix.commands) message.content = message.content.slice(1, message.content.length);
			if (message.content === command) return true;
		};

		this.client.removeCommand = (message, command) => message.replace(`${config.prefix.commands}${command.name} `, "");

		this.client.checkPropertyExists = (config, property) => {
			if (path.query(config, `$.${property}`)[0] !== undefined) return true;
			return false;
		};

		function truncate(input, length) {return input.length > length ? input.slice(0, length - 1).trim() + "..." : input}
		this.client.truncate = truncate;

		this.client.toArray = (string, char) => {
			if (string === undefined)  return [];
			if (Array.isArray(string)) return string;
			else return string.split(char);
		};

		this.client.toString = (array, char) => {
			if (array === undefined)   return "";
			if (!Array.isArray(array)) return array;
			else return array.join(char);
		};

		this.client.sleep = ms => {
			return new Promise(resolve => setTimeout(resolve, ms));
		};

		this.client.firstUpper = s => {return s.charAt(0).toUpperCase() + s.slice(1)};

		// Math based methods
		this.client.range = (x, min, max) => {return (x - min) * (x - max) <= 0};
		this.client.difference = (x, y) => {return Math.abs(x - y) / ((x + y) / 2)};
	}
};