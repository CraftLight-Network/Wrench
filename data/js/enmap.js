// Define and require modules
const dataDir = "./data/private/enmap";
const Enmap   = require("enmap");

// Per-server settings
const guildConfig = new Enmap({
	"name":       "guildConfig",
	"dataDir":    dataDir
});

// Command counter
const totals = new Enmap({
	"name":       "totals",
	"fetchAll":   false,
	"dataDir":    dataDir
});

// Tags
const tags = new Enmap({
	"name":       "tags",
	"autoFetch":  false,
	"dataDir":    dataDir
});

module.exports = {
	guildConfig,
	totals,
	tags
};