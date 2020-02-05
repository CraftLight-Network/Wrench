// Define and require modules
const { stripIndents } = require("common-tags");

module.exports = async function (message, options) {
	// Default options if not defined
	if (!options.question) options.question = "What would you like to do?";
	if (!options.timeout) options.timeout = 30;
	if (!options.validate) options.validate = false;

	let result = options.variable;
	let exit;
	while (!result && !exit) {
		message.reply(stripIndents`
			${options.question}
			Respond with \`cancel\` to cancel the command. The command will automatically be cancelled in ${options.timeout} seconds.
		`);

		// Take user input
		result = await message.channel.awaitMessages(res => {return res.author.id === message.author.id}, {
			"max": 1,
			"time": 30000
		}).catch(function() {exit = true});

		// Set result to input
		result.find(i => {result = i.content});
		if (result === "cancel") break;

		// Validate input
		if (options.validate) {
			if (!options.validate.array.includes(result)) {
				result = "";
				return message.reply(`Invalid ${options.validate.name}.`);
			}
		}
	}
	return result;
};