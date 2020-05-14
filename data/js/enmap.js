// Define and require modules
const dataDir = "./data/private/enmap";
const Enmap = require("enmap");

// Per-server settings
const guildConfig = new Enmap({
	"name": "guildConfig",
	"fetchAll": true,
	"autoFetch": true,
	"cloneLevel": "deep",
	"dataDir": dataDir
});

// Command counter
const commands = new Enmap({
	"name": "commands",
	"autoFetch": true,
	"fetchAll": false,
	"dataDir": dataDir
});

// Message counter
const messages = new Enmap({
	"name": "messages-read",
	"autoFetch": true,
	"fetchAll": false,
	"dataDir": dataDir
});

// Translation counter
const translations = new Enmap({
	"name": "translations",
	"autoFetch": true,
	"fetchAll": false,
	"dataDir": dataDir
});

// Tags
const tags = new Enmap({
	"name": "tags",
	"autoFetch": false,
	"fetchAll": true,
	"cloneLevel": "deep",
	"dataDir": dataDir
});

module.exports = {
	guildConfig,
	commands,
	messages,
	translations,
	tags
};