// Get logger
const defaultConfig = require("../json/default");
const { guildConfig } = require("./enmap");
const merge = require("merge-json");

// Create the config
module.exports.ensure = (guild) => {
	guildConfig.ensure(guild, { "version": defaultConfig.version });
};

// Get the config
module.exports.getConfig = async (guild) => {
	this.ensure(guild);
	return merge.merge(defaultConfig, await guildConfig.get(guild));
};

// Set the config
module.exports.setConfig = async (guild, property, value) => {
	guildConfig.fetchEverything();
	guildConfig.set(guild, value, property);
};