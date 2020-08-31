// Define and require modules
const { stripIndents } = require("common-tags");
const Embed            = require("discord.js").MessageEmbed;
const config           = require("../../config");
const path             = require("jsonpath");

let client, totals;
module.exports.init = (c, t) => {
	client = c;
	totals = t;
};

// Truncate string
function truncate(input, length) {return input.length > length ? input.slice(0, length - 1).trim() + "..." : input}
module.exports.truncate = truncate;

// Embedded messages
module.exports.embed = options => {
	// Convert member to message
	if (options.message && !options.message.content && options.message.username) options.message.author = options.message;

	// Set default options
	if (options.footer === undefined && options.message) options.footer = `Requested by ${options.message.author.tag}`;
	else if (!options.footer) options.footer = "";
	if (!options.color) options.color = "#E3E3E3";

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
module.exports.getUserInput = async (message, options) => {
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
module.exports.checkRole = (message, roles) => {
	let hasRole = false;
	roles.some(r => {if (message.member.roles.cache.has(r)) return hasRole = true;});
	if (!hasRole && message.author.id !== message.guild.owner.id && !config.owners.includes(message.author.id)) return false;
	return true;
};

// Remove command from message
module.exports.removeCommand = (message, command) => message.replace(`${config.prefix.commands}${command.name} `, "");

// Test if a message is a command
module.exports.isCommand = (message, command) => {
	if (message.content.charAt(0) === config.prefix.commands) message.content = message.content.slice(1, message.content.length);
	if (message.content === command) return true;
};

module.exports.replacePlaceholders = (message, custom) => {
	// Pre-set placeholders
	const placeholders = {
		"%prefix%":             config.prefix.commands,
		"%prefix_tags%":        config.prefix.tags,
		"%total_servers%":      client.guilds.cache.size,
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

module.exports.commonPlaceholders = (object, mode) => {
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

module.exports.embedToString = message => {
	let embeds = "";
	if (message.embeds.length !== 0) {
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

module.exports.toArray = (string, char) => {
	if (string === undefined)       return [];
	if (typeof string === "object") return string;
	else return string.split(char);
};

module.exports.toString = (array, char) => {
	if (array === undefined)       return "";
	if (typeof array === "string") return array;
	else return array.join(char);
};

// An alternate way of checking if a string includes a statement
module.exports.newIncludes = (string, compare) => {
	if (!string) return false;
	return compare.some(c => string.includes(c));
};

// Get message from partials
module.exports.getMessage = async message => {
	if (message.partial) return await message.fetch();
	else return message;
};

// Wait before continuing
module.exports.sleep = ms => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports.checkPropertyExists = (config, property) => {
	if (path.query(config, `$.${property}`)[0] !== undefined) return true;
	return false;
};

module.exports.range = (x, min, max) => {return (x - min) * (x - max) <= 0};

// Replace mentions with users
module.exports.translate = (message, mode) => {
	if (mode === "mentions") return mentions();

	function mentions() {
		const match = message.match(/<@!\d+>/g);
		if (match) match.forEach(e => message = message.replace(e, client.users.cache.get(e.replace(/[^\d]/g, "")).username));
		return message;
	}
};