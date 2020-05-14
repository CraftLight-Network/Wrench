// Define and require modules
const defaultConfig = require("../json/default");
const { guildConfig } = require("./enmap");
const safeEval = require("safe-eval");
const merge = require("merge-json");
const _ = require("lodash");

// Create the config
module.exports.ensure = (guild) => {
	guildConfig.ensure(guild, { "version": defaultConfig.version });
};

// Get the config
module.exports.getConfig = async (guild) => {
	this.ensure(guild);
	return merge.merge(_.cloneDeep(defaultConfig), await guildConfig.get(guild));
};

// Set the config
module.exports.setConfig = async (guild, property, value) => {
	guildConfig.evict(`${guild}.${property}`);

	if (!(safeEval(`config.${property}`, { "config": await this.getConfig(guild) }) instanceof Array)) return guildConfig.setProp(guild, property, value);
	else return guildConfig.setProp(guild, property, [value]);
};

// Add to the config
module.exports.addConfig = async (guild, property, value) => {
	guildConfig.fetchEverything();

	if (!guildConfig.get(guild, property)) return guildConfig.setProp(guild, property, [value]);
	return guildConfig.pushIn(guild, property, value, true);
};

// Remove from the config
module.exports.removeConfig = async (guild, property, value) => {
	return guildConfig.removeFrom(guild, property, value);
};

// Reset the config
module.exports.reset = (guild) => {
	guildConfig.delete(guild);
	return this.ensure(guild);
};