// Define and require modules
const merge = require("merge-json");
const sort  = require("sort-json");
const path  = require("jsonpath");
const _     = require("lodash");
const fs    = require("fs");

// Define and require modules
const SQLite = require("@josh-providers/sqlite");
const Josh   = require("josh");

// Location where the database is saved
const location = { "dataDir": "./data/private/database" };

// Per-server settings
const guildConfig = new Josh({
	"name":            "guildConfig",
	"serializer":      (a) => {
		const parsed = stringJSON(a);
		return a instanceof Object ? a
			: typeof parsed === "number" ? accurateInt(a) ? parsed
			: a : parsed;
	},
	"provider":        SQLite,
	"providerOptions": location
});

// Per-server reactions
const reactionConfig = new Josh({
	"name":           "reactionConfig",
	"provider":        SQLite,
	"providerOptions": location
});

// Tags
const tagConfig = new Josh({
	"name":            "tagConfig",
	"provider":        SQLite,
	"providerOptions": location
});

// Command counter
const totals = new Josh({
	"name":           "totals",
	"provider":        SQLite,
	"providerOptions": location
});
totals.ensure("commands", 0);
totals.ensure("messages", 0);
totals.ensure("automod",  0);

// Defaults + migrations + options
const defaultConfig           = require("../json/defaultConfig");
const defaultConfigMigrations = require("../json/defaultConfig.migrations");
const defaultConfigOptions    = require("../json/defaultConfig.options");
const defaultReactions        = require("../json/defaultReactions");
const defaultTags             = require("../json/defaultTags");

class Config {
	constructor(config, guild, customConfig, customFile, customOptions, customMigrations) {
		this.rawGuild = guild;
		this.guild    = guild.id;

		switch (config) {
			case "custom":
				this.migrations = customMigrations;
				this.options    = customOptions;
				this.config     = customConfig;
				this.file       = customFile;
				break;

			case "guild":
				this.migrations = defaultConfigMigrations;
				this.options    = defaultConfigOptions;
				this.config     = guildConfig;
				this.file       = defaultConfig;
				break;

			case "reactions":
				this.config = reactionConfig;
				this.file   = defaultReactions;
				break;

			case "tags":
				this.config = tagConfig;
				this.file   = defaultTags;
				break;
		}
	}

	// Make sure the guild exists in the config
	async ensure() {await this.config.ensure(this.guild, { "version": this.file.version })}

	// Check if a server config needs any migrations
	async check(command) {
		// Check if the local config is up-to-date
		const config = await this.config.get(this.guild);
		if (config.version === this.file.version) return false;

		// Check if the migration has breaking changes
		let breaking = false;
		breaking = await new Promise(resolve => {
			this.migrations.run.forEach(async m => {
				if ((await this.config.get(this.guild)).version === m.info.from) {
					if (m.info.breaking && !command) {
						resolve(true);
						return;
					}

					// Migrate the config
					const migrated = await this.migrate(m);
					await this.config.delete(this.guild);
					await this.config.set(this.guild, migrated);
					resolve(false);
				}
			});
		});
		return breaking;
	}

	// Migrate a config file
	async migrate(migration) {
		const workingJSON = _.cloneDeep(await this.config.get(this.guild));

		// General steps (parsing, invalidation, etc.)
		migration.steps.forEach(s => {
			path.apply(workingJSON, `$.${s[0]}`, v => {
				return s[1] === "invalidate" || v === undefined ? null
					: s[1] === "parse" ? JSON.parse(v)
					: JSON.parse(s[1]);
			});
		});

		// Move element locations
		migration.move.forEach(m => {
			const toBe = _.get(workingJSON, m[0]);
			_.unset(workingJSON, m[0]);
			_.set(workingJSON, m[1], toBe);
		});

		// Remove entire elements
		migration.remove.forEach(r => {
			_.unset(workingJSON, r);
		});

		workingJSON.version++;
		return sort(removeNull(workingJSON), { "depth": 1 });
	}

	// Get the config in JSON
	async get() {
		await this.ensure();
		const breaking = await this.check();

		// Return config if non-breaking
		const json = await this.config.get(this.guild);
		return breaking ? "breaking" : await merge.merge(_.cloneDeep(this.file), json);
	}

	// Get the raw server config data
	async getRaw() {
		await this.ensure();
		return this.config.get(this.guild);
	}

	// Get the local and current config versions
	async getDetails() {
		await this.ensure();
		return {
			"version": {
				"local":   (await this.config.get(this.guild)).version,
				"current": this.file.version
			},
			"info": this.migrations.run[0].info
		};
	}

	// Set config properties
	async set(property, value) {
		const checked = this.checks(property, value);
		if (!checked.valid) return checked;

		await this.config.set(`${this.guild}.${property}`, value);
		return { "valid": true };
	}

	// Add to arrays
	// CURRENTLY BROKEN! JOSH ISSUE?
	async add(property, value) {
		const checked = this.checks(property, value);
		if (!checked.valid) return false;

		_.get(await this.config.get(`${this.guild}`), property) ? await this.config.push(`${this.guild}.${property}`, value)
			: await this.config.set(`${this.guild}.${property}`, [value]);
		return { "valid": true };
	}

	// Remove from arrays
	async remove(property, value) {
		await this.config.remove(`${this.guild}.${property}`, value);
		return { "valid": true };
	};

	// Delete whole values
	async delete(value) {
		await this.config.delete(this.guild, value);
		return { "valid": true };
	}

	// Reset the guild's config
	async reset() {
		await this.config.delete(this.guild);
		this.ensure();
	}

	// Make sure the input value is valid
	checks(property, value) {
		const option     = _.get(this.options, property).split(",");
		const input      = value.split(",");
		const valid      = [];
		const reason     = [];

		// Argument length
		if (option.length !== input.length) return false;

		// Each required argument
		option.some((r, i) => {
			// Each optional argument
			valid.push(r.split("|").some(o => {
				reason.push(o);
				switch (o) {
					// Strings
					case "string": return typeof stringJSON(input[i]) === "string";

					// Booleans
					case "boolean": return input[i] === "true" ? true : input[i] === "false";

					// Integers
					case "int":     return Number.isInteger(JSON.parse(input[i]));

					// Static
					case "static":  return false;

					// Percentages
					case "percent":
						const parsed = parseInt(o.replace("%", ""), 10);
						if (o.indexOf("%") > 0 || parsed > 100 || parsed < 0) return false;
						return true;

					// Role ID in server
					case "guildRoleID": return !!(this.rawGuild.roles.cache.get(input[i]));

					// Guild ID in server
					case "guildChannelID": return !!(this.rawGuild.channels.cache.get(input[i]));

					// Specific value
					default: return input[i] === o;
				}
			}));
			return false;
		});

		if (valid.filter(Boolean).length === option.length) return { "valid": true };
		return { "valid": false, "reason": `The input type was not a \`${reason.join("`, `")}\`. ${option.join().includes(",") ? `(Format: \`${option}\`)` : ""}` };
	}
}

// Remove "null" or "{}" values from JSON
function removeNull(json) {
	return JSON.parse(JSON.stringify(json), (k, v) => {
		if (v === null || JSON.stringify(v) === "{}") return;
		return v;
	});
}

// Convert strings into their data type
function stringJSON(json) {
	let output  = json;
	try {output = JSON.parse(json)} catch {}

	return output;
};

function accurateInt(number) {
	return number < 9007199254740991 && number > -9007199254740991;
}

module.exports = Config;

// Migrate Enmap -> JOSH
module.exports.migrateFromEnmap = async (log) => {
	log.info("Old Enmap database found, migrating...");

	const dataDir = "./data/private/enmap";
	const Enmap   = require("enmap");

	// Grab the old Enmap settings
	const oldGuildConfig    = new Enmap({ "name": "guildConfig",    "dataDir": dataDir });
	const oldReactionConfig = new Enmap({ "name": "reactionConfig", "dataDir": dataDir });
	const oldTagConfig      = new Enmap({ "name": "tags",           "dataDir": dataDir });
	const oldTotals         = new Enmap({ "name": "totals",         "dataDir": dataDir });

	// Import the old Enmap data to JOSH
	await guildConfig.import(await oldGuildConfig.export());
	await reactionConfig.import(await oldReactionConfig.export());
	await tagConfig.import(await oldTagConfig.export());
	await totals.import(await oldTotals.export());

	// Remove unused values
	totals.delete("translations");

	// Close and rename
	await oldGuildConfig.close(); await oldReactionConfig.close();
	await oldTagConfig.close();   await oldTotals.close();

	fs.renameSync("./data/private/enmap", "./data/private/enmap.bak");

	log.ok("Migrated the Enmap database to JOSH!");
};

// Export individual databases
module.exports.guildConfig    = guildConfig;
module.exports.reactionConfig = reactionConfig;
module.exports.tagConfig      = tagConfig;
module.exports.totals         = totals;