// Define and require modules
const guildConfig   = require("./enmap").guildConfig;
const defaultConfig = require("../json/defaultConfig");
const merge         = require("merge-json");
const path          = require("jsonpath");
const _             = require("lodash");

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

	if (!(path.query(await this.getConfig(guild), `$.${property}`)[0] instanceof Array)) return guildConfig.set(guild, value, property);
	else return guildConfig.set(guild, [value], property);
};

// Add to the config
module.exports.addConfig = async (guild, property, value) => {
	guildConfig.fetchEverything();

	if (!guildConfig.get(guild, property)) return guildConfig.set(guild, [value], property);
	return guildConfig.push(guild, value, property);
};

// Remove from the config
module.exports.removeConfig = async (guild, property, value) => {
	return guildConfig.remove(guild, value, property);
};

// Reset the config
module.exports.reset = (guild) => {
	guildConfig.delete(guild);
	return this.ensure(guild);
};