// Get logger
const { log } = require("./logger.js");

// Required modules
const request = require("async-request");
const fs = require("fs");

// Create the bad links file
fs.writeFile("data/private/badLinks.txt", "", createBadLinks);

// Format + update bad links file
let badLinks = [];
async function createBadLinks() {
	// Grab the latest Unified HOSTS (Unified + Gambling + Fakenews + Porn)
	let hosts = await request("http://sbc.io/hosts/alternates/fakenews-gambling-porn/hosts");

	// Format the bad links file
	badLinks = await hosts.body
		.replace(/#.*|[0-9].[0-9].[0-9].[0-9]\s/gmi, "")
		.trim()
		.split("\n")
		.filter(Boolean)
		.slice(14)
		.map(file => file.trim());
	log.info("Bad links array is ready!");
	hosts = "";
}

module.exports.automod = async function automod(mode, message) {
	// Shorter message content
	const content = message.content;

	// Check for bad links
	if (mode === "badLinks") {
		// Make sure there are bad links
		if (!badLinks.some(l => content.split(" ").includes(l))) return;
		if (content.includes("https://discordapp.com/channels/") || content.includes("https://cdn.discordapp.com/") || content.length <= 1) return;

		// Delete and warn
		await message.delete();
		message.reply("do not send that link!").then(msg => {msg.delete(3000)});
	}
};