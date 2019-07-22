const Enmap = require("enmap");

// Command counter
const commandsRead = new Enmap({
	name: "commands-read",
	autoFetch: true,
	fetchAll: false,
	dataDir: "./data/private/enmap"
});
// Message counter
const messagesRead = new Enmap({
	name: "messages-read",
	autoFetch: true,
	fetchAll: false,
	dataDir: "./data/private/enmap"
});
// Translation counter
const translationsDone = new Enmap({
	name: "translations-done",
	autoFetch: true,
	fetchAll: false,
	dataDir: "./data/private/enmap"
});
// Per-server settings
const settings = new Enmap({
	name: "settings",
	fetchAll: false,
	autoFetch: true,
	cloneLevel: 'deep',
	dataDir: "./data/private/enmap"
});
// Last subreddit used
const lastSub = new Enmap({
	name: "lastSub",
	fetchAll: false,
	autoFetch: true,
	cloneLevel: 'deep',
	dataDir: "./data/private/enmap"
});

module.exports = {
	commandsRead,
	messagesRead,
	translationsDone,
	settings,
	lastSub
};