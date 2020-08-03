// Define and require modules
const dataDir = "./data/private/enmap";
const Enmap   = require("enmap");

// Per-server settings
const guildConfig = new Enmap({
	"name":       "guildConfig",
	"fetchAll":   true,
	"autoFetch":  true,
	"cloneLevel": "deep",
	"dataDir":    dataDir
});

// Command counter
const totals = new Enmap({
	"name":      "totals",
	"autoFetch": true,
	"fetchAll":  false,
	"dataDir":   dataDir
});

// Tags
const tags = new Enmap({
	"name":       "tags",
	"autoFetch":  false,
	"fetchAll":   true,
	"cloneLevel": "deep",
	"dataDir":    dataDir
});

module.exports = {
	guildConfig,
	totals,
	tags
};