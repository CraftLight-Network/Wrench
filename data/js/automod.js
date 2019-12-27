// Required modules
const request = require("request");
const fs = require("fs");

// Create the bad links file
fs.writeFile("data/private/badLinks.txt", "", createBadLinks);

// Format + update bad links file
let badLinks;
async function createBadLinks() {
	let hosts;

	// Grab the latest Unified HOSTS (Unified + Gambling + Fakenews + Porn)
	request("http://sbc.io/hosts/alternates/fakenews-gambling-porn/hosts", function (error, response, body) {
		if (response.statusCode !== 200) return;
		hosts = body;
	});

	// Format the bad links file
	badLinks = hosts
		.replace(/#.*|[0-9].[0-9].[0-9].[0-9]\s/gmi, "")
		.trim()
		.split("\n")
		.filter(Boolean)
		.slice(14)
		.map(file => file.trim());

	fs.writeFile("data/private/badLinks.txt", badLinks);
}

module.exports = { badLinks };