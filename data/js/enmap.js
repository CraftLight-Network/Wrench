const Enmap = require("enmap");

// Per-server settings
const guildConfig = new Enmap({
	"name": "guildConfig",
	"fetchAll": false,
	"autoFetch": true,
	"cloneLevel": "deep",
	"dataDir": "./data/private"
});
// Temp bans
const tempBans = new Enmap({
	"name": "tempBans",
	"autoFetch": true,
	"fetchAll": false,
	"dataDir": "./data/private"
});
// Command counter
const commands = new Enmap({
	"name": "commands",
	"autoFetch": true,
	"fetchAll": false,
	"dataDir": "./data/private"
});
// Message counter
const messages = new Enmap({
	"name": "messages-read",
	"autoFetch": true,
	"fetchAll": false,
	"dataDir": "./data/private"
});
// Translation counter
const translations = new Enmap({
	"name": "translations",
	"autoFetch": true,
	"fetchAll": false,
	"dataDir": "./data/private"
});

module.exports = {
	guildConfig,
	tempBans,
	commands,
	messages,
	translations
};