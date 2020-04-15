// Define and require modules
const { RichEmbed } = require("discord.js");

module.exports.embed = function embed(options) {
	// Set default options
	if (!options.footer && options.message) options.footer = `Requested by ${options.message.author.tag}`;
	else if (!options.footer) options.footer = "";
	if (!options.color) options.color = "#E3E3E3";

	// Make the embed
	const embedMessage = new RichEmbed()
		.setFooter(options.footer)
		.setColor(options.color);

	// Add author
	if (options.author) {
		if (options.author.picture === "me") options.author.picture = options.message.author.displayAvatarURL;
		embedMessage.setAuthor(options.author.name, options.author.picture);
	}

	// Add title
	if (options.title) embedMessage.setTitle(options.title);

	// Add description
	if (options.description) embedMessage.setDescription(options.description);

	// Add fields
	if (options.fields) {
		options.fields.some(e => {
			if (!e[2]) e[2] = false;
			embedMessage.addField(e[0], e[1], e[2]);
		});
	};

	return embedMessage;
};