// Define and require modules
const defaultReactions = require("../json/defaultReactions");
const defaultConfig    = require("../json/defaultConfig");
const reactionConfig   = require("./enmap").reactionConfig;
const guildConfig      = require("./enmap").guildConfig;
const merge            = require("merge-json");
const path             = require("jsonpath");
const _                = require("lodash");

class Config {
	constructor(config, guild) {
		this.guild = guild;

		switch (config) {
			case "guild":
				this.config = guildConfig;
				this.file = defaultConfig;
				break;

			case "reactions":
				this.config = reactionConfig;
				this.file = defaultReactions;
				break;
		}
	}

	ensure() {
		this.config.ensure(this.guild, { "version": this.file.version });
	}

	// Get the config in JSON
	async get() {
		this.ensure();
		this.config.fetchEverything();

		return await merge.merge(_.cloneDeep(this.file), await this.config.get(this.guild));
	}

	// Set config properties
	async set(property, value) {
		this.config.fetchEverything();
		this.config.evict(`${this.guild}.${property}`);

		if (path.query(await this.get(), `$.${property}`)[0] instanceof Array) this.config.set(this.guild, [value], property);
		else this.config.set(this.guild, value, property);
	}

	// Add to arrays
	async add(property, value) {
		this.config.fetchEverything();

		if (!this.config.get(this.guild, property)) return guildConfig.set(this.guild, [value], property);
		return this.config.push(this.guild, value, property);
	}

	// Remove from arrays
	async remove(property, value) {
		return this.config.remove(value, property);
	};

	// Reset the guild's config
	async reset() {
		this.config.delete(this.guild);
		this.ensure();
	}
}

module.exports = Config;