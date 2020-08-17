// Define and require modules
const merge            = require("merge-json");
const path             = require("jsonpath");
const _                = require("lodash");

// Defaults + configs
const defaultReactions = require("../json/defaultReactions");
const defaultConfig    = require("../json/defaultConfig");
const defaultTags      = require("../json/defaultTags");

const reactionConfig   = require("./enmap").reactionConfig;
const guildConfig      = require("./enmap").guildConfig;
const tagConfig        = require("./enmap").tagConfig;

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

			case "tags":
				this.config = tagConfig;
				this.file = defaultTags;
				break;
		}
	}

	ensure() {
		this.config.ensure(this.guild, { "version": this.file.version });
	}

	// Get the config in JSON
	async get() {
		this.ensure();
		this.config.fetch(this.guild);

		return await merge.merge(_.cloneDeep(this.file), await this.config.get(this.guild));
	}

	// Set config properties
	async set(property, value) {
		this.config.fetch(this.guild);
		this.config.evict(`${this.guild}.${property}`);

		if (path.query(await this.get(), `$.${property}`)[0] instanceof Array) this.config.set(this.guild, [value], property);
		else this.config.set(this.guild, value, property);
	}

	// Add to arrays
	add(property, value) {
		this.config.fetch(this.guild);

		if (!this.config.get(this.guild, property)) return this.config.set(this.guild, [value], property);
		return this.config.push(this.guild, value, property);
	}

	// Remove from arrays
	remove(property, value) {
		this.config.fetch(this.guild);

		console.dir(this.config.remove(this.guild, value, property).get(this.guild).channels.advert)
		return this.config.remove(this.guild, value, property);
	};

	// Delete whole values
	delete(value) {
		this.config.fetch(this.guild);

		return this.config.delete(this.guild, value);
	}

	// Reset the guild's config
	reset() {
		this.config.delete(this.guild);
		this.ensure();
	}
}

module.exports = Config;