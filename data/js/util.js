// Define and require modules
const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");

// Truncate string
module.exports.truncate = function(input, length) {
	return input.length > length ? input.slice(0, length - 1).trim() + "..." : input;
};

// Embedded messages
module.exports.embed = (options, message) => {
	// Convert member to message
	if (message && !message.content && message.username) message.author = message;

	// Set default options
	if (options.footer === undefined && message) options.footer = `Requested by ${message.author.tag}`;
	else if (!options.footer) options.footer = "";
	if (!options.color) options.color = "#E3E3E3";

	// Make the embed
	const embedMessage = new RichEmbed()
		.setFooter(options.footer)
		.setColor(options.color);

	// Add attatchments
	if (options.attachments) embedMessage.attachFiles(options.attachments);

	// Add author
	if (options.author) {
		if (options.author.picture === "me") options.author.picture = message.author.displayAvatarURL;
		embedMessage.setAuthor(options.author.name, options.author.picture);
	}

	// Add title, url, thumbnail, and description
	if (options.title) embedMessage.setTitle(options.title);
	if (options.title && options.url) embedMessage.setURL(options.url);
	if (options.thumbnail) embedMessage.setThumbnail(options.thumbnail);
	if (options.description) embedMessage.setDescription(options.description);

	// Add fields
	if (options.fields) {
		options.fields.some(e => {
			if (!e[2]) e[2] = false;
			embedMessage.addField(e[0], e[1], e[2]);
		});
	};

	// Add image
	if (options.image) embedMessage.setImage(options.image);

	return embedMessage;
};

// User input
module.exports.getUserInput = async (message, options) => {
	// Default options if not defined
	if (!options.question) options.question = "What would you like to do?";
	if (options.cancel === undefined) options.cancel = true;
	if (!options.timeout) options.timeout = 30;
	if (!options.validate) options.validate = false;

	let result = options.variable;
	let exit;
	while (!result && !exit) {
		// Ask the question
		let cancel = "";
		if (options.cancel) cancel = `Respond with \`cancel\` to cancel the command. The command will automatically be cancelled in ${options.timeout} seconds.`;

		message.reply(stripIndents`
			${options.question}
			${cancel}
		`);

		// Take user input
		result = await message.channel.awaitMessages(res => {return res.author.id === message.author.id}, {
			"max": 1,
			"time": 30000
		}).catch(function() {exit = true});

		// Set result to input
		result.find(i => {result = i.content});
		if (options.cancel) if (result === "cancel") break;

		// Validate input
		if (!options.validate) break;
		if (!options.validate.array.includes(result)) {
			result = "";
			return message.reply(`Invalid ${options.validate.name}.`);
		}
	}
	return result;
};