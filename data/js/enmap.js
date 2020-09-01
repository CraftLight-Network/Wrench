// Define and require modules
const dataDir = "./data/private/enmap";
const Enmap   = require("enmap");

// Per-server settings
const guildConfig = new Enmap({
	"name":       "guildConfig",
	"dataDir":    dataDir
});

// Per-server reactions
const reactionConfig = new Enmap({
	"name":       "reactionConfig",
	"dataDir":    dataDir
});

// Tags
const tagConfig = new Enmap({
	"name":       "tags",
	"autoEnsure": {
		"commands": 0,
		"messages": 0,
		"automod":  0
	},
	"dataDir":    dataDir
});

// Command counter
const totals = new Enmap({
	"name":       "totals",
	"fetchAll":   false,
	"dataDir":    dataDir
});

module.exports = {
	guildConfig,
	reactionConfig,
	tagConfig,
	totals
};