// Define and require modules
const { stripIndents } = require("common-tags");
const totals           = require("../../data/js/config").totals;
const Embed            = require("discord.js").MessageEmbed;
const options          = require("../../config");
const _                = require("lodash");

module.exports.run = (client) => {
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
	client.embed = options => {
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
		if (options.author) embed.setAuthor(options.author.name, options.author.picture);

		// Add content, title, url, thumbnail, and description
		if (options.title)                embed.setTitle(options.title);
		if (options.title && options.url) embed.setURL(options.url);
		if (options.thumbnail)            embed.setThumbnail(options.thumbnail);
		if (options.description)          embed.setDescription(options.description);

		// Add fields
		if (options.fields) {
			options.fields.forEach(e => {
				e[2] = e[2] ? e[2] : false;
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
	client.userInput = async (message, options) => {
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
			if (options.cancel && result === "cancel") break;

			// Validate input
			if (!options.validate) break;
			if (!options.validate.array.includes(result)) return result = "" && message.reply(`Invalid ${options.validate.name}.`);
		}
		return result;
	};

	// Permission check
	client.checkRole = (message, roles) => {
		const hasRole = roles && Array.isArray(roles) ? roles.some(r => {return !!message.member.roles.cache.has(r)}) : false;
		return !!(hasRole || message.author.id === message.guild.owner.id || options.owners.includes(message.author.id));
	};

	client.placeholders = async (message, custom) => {
		// Pre-set placeholders
		const placeholders = {
			"%prefix%":             options.prefix.commands,
			"%prefix_tags%":        options.prefix.tags,
			"%total_servers%":      client.guilds.cache.size,
			"%total_commands%":     await totals.get("commands"),
			"%total_messages%":     await totals.get("messages"),
			"%total_automod%":      await totals.get("automod")
		};

		// Custom placeholders
		if (custom !== undefined) {
			custom.forEach(e => placeholders[e[0]] = e[1]);
		}

		// Replace placeholders
		for (const i in placeholders) message = message.replace(i, placeholders[i]);
		return message;
	};

	client.commonPlaceholders = (object, mode) => {
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

	client.embedToString = message => {
		let embeds = "";
		if (message.embeds !== undefined) {
			message.embeds.forEach(e => {
				let es = [];

				es.push(
					e.title       ? e.title                       : "",
					e.author      ? e.author.name                 : "",
					e.description ? truncate(
						e.description.replace(/[\n\r]+|  +/gm, ""),
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
	client.translate = (message, mode) => {
		if (mode === "mentions") return mentions();

		function mentions() {
			const match = message.match(/<@!\d+>/g);
			if (match) match.forEach(e => message = message.replace(e, client.users.cache.get(e.replace(/\D/g, "")).username));
			return message;
		}
	};

	// Check if a string includes content from an array
	client.check = (string, compare, performance) => {
		if (performance) return string.some(s => {return compare.includes(s)});
		return Array.isArray(compare) ? compare.some(c => {return new RegExp(c, "i").test(string)}) : compare.test(string);
	};

	client.parseJSON = json => {
		let output  = {};
		try {output = JSON.parse(json)} catch {}

		return output;
	};

	client.stringJSON = json => {
		let output  = json;
		try {output = JSON.parse(json)} catch {}

		return output;
	};

	// Get message from partials
	client.getMessage = async message => {
		return message.partial ? await message.fetch() : message;
	};

	// Misc.
	client.isCommand = (message, command) => {
		if (message.content.charAt(0) === options.prefix.commands) message.content = message.content.slice(1, message.content.length);
		if (message.content === command) return true;
	};

	client.removeCommand = (message, command) => message.replace(`${options.prefix.commands}${command.name} `, "");

	client.generateID = (length) => {
		if (!length) length = 8;
		return new Array(length).join().replace(/(.|$)/g, function() {
			return (Math.trunc(Math.random() * 36)).toString(36)[Math.random() < 0.5 ? "toString" : "toUpperCase"]();
		});
	};

	client.checkExists = (config, property) => {
		const element = _.get(config, property);
		return !(element === undefined || (typeof element === "object" && !Array.isArray(element)));
	};

	client.truncate = truncate;

	client.toArray = (string, char) => {
		if (string === undefined)  return [];
		return Array.isArray(string) ? string : string.split(char);
	};

	client.toString = (array, char) => {
		if (array === undefined)   return "";
		return !Array.isArray(array) ? array : array.join(char);
	};

	client.sleep = ms => {
		return new Promise(resolve => setTimeout(resolve, ms));
	};

	client.firstUpper = s => {return s.charAt(0).toUpperCase() + s.slice(1)};

	// Math based methods
	client.range = (x, min, max) => {return (x - min) * (x - max) <= 0};
	client.difference = (x, y) => {return Math.abs(x - y) / ((x + y) / 2)};

	client.log.verbose("Injection complete in util.js.");
};

function truncate(input, length) {return input.length > length ? input.slice(0, length - 1).trim() + "..." : input}