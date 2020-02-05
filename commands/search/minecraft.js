// Define and require modules
const getUserInput = require("../../data/js/getUserInput.js");
const { Random, nativeMath } = require("random-js");
const { Command } = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");
const config = require("../../config.json");
const request = require("async-request");

// Actions array
const actions	= ["skin", "info", "actions"];
const skinTypes = ["skin", "face", "front", "frontfull", "head", "bust", "full"];
const dataTypes = ["names", "name", "uuid"];

module.exports = class minecraftCommand extends Command {
	constructor(client) {
		super(client, {
			"name": "minecraft",
			"memberName": "minecraft",
			"aliases": ["mc"],
			"group": "search",
			"description": "Get information on a Minecraft player.",
			"details": stripIndents`
				Run \`${config.prefix}minecraft [action] [args]\` to use commands.
				**Notes:**
				[action]: Required, run \`${config.prefix}minecraft actions\` for actions.
				[player]: Required, in-game name or UUID of the player.
				[args] Required, data for specified action to use.
			`,
			"args": [
				{
					"key": "action",
					"prompt": `What would you like to do? (${actions.join(", ")})`,
					"type": "string",
					"oneOf": actions
				},
				{
					"key": "player",
					"prompt": "",
					"default": "",
					"type": "string"
				},
				{
					"key": "args",
					"prompt": "",
					"default": "",
					"type": "string"
				}
			],
			"clientPermissions": ["SEND_MESSAGES", "EMBED_LINKS"],
			"throttling": {
				"usages": 2,
				"duration": 5
			}
		});
	}

	async run(message, { action, player, args }) {
		// List available actions
		if (action === "actions") {
			const embed = new RichEmbed()
				.setAuthor(`${config.prefix}minecraft Actions`, message.author.displayAvatarURL)
				.setDescription(stripIndents`
					\`skin\`: Grab the skin of a player
					Valid args: \`${skinTypes.join("`, `")}\`

					\`info\`: Get the info of a player
					Valid args: \`${dataTypes.join("`, `")}\`
				`)
				.setColor("#E3E3E3");
			return message.channel.send(embed);
		}

		// Get player variable if not defined
		if (!player) player = await getUserInput(message, { "question": "What is the in-game name or UUID of the player?" });
		if (player === "cancel") return message.reply("Cancelled command.");

		// Get a random number to fix cache issues
		const random = new Random(nativeMath);
		const number = random.integer(1, 65535);

		// Get UUID of user
		let uuid;
		if (player.length !== 32) {
			const playerRequest = await request(`https://api.mojang.com/users/profiles/minecraft/${player}`);
			player = JSON.parse(playerRequest.body);

			if (!player) return message.reply("That player does not exist. Please enter a valid in-game name or UUID.");
			uuid = player.id;
		} else uuid = player;

		// Get name of user
		const nameRequest = await request(`https://api.mojang.com/user/profiles/${uuid}/names`);
		const name = JSON.parse(nameRequest.body).reverse();

		// Skin actions
		if (action === "skin") {
			// Get skin variable if not defined
			if (!args) {
				args = await getUserInput(message, {
					"question": `How would you like the skin? (${skinTypes.join(", ")})`,
					"validate": {
						"name": "skin type",
						"array": skinTypes
					}
				});
			}
			if (args === "cancel") return message.reply("Cancelled command.");

			const embed = new RichEmbed()
				.setAuthor(`${name[0].name}'s skin (${args})`, `https://visage.surgeplay.com/face/${uuid}.png?${number}`)
				.setImage(`https://visage.surgeplay.com/${args}/${uuid}.png?${number}`)
				.setColor("#E3E3E3");

			return message.channel.send(embed);
		}

		// Data actions
		if (action === "info") {
			// Make sure info type if valid
			if (!args || !dataTypes.some(l => args.includes(l))) {args = ""; message.say("Invalid data type.")};

			// Undefined data action
			if (!args) {
				args = await getUserInput(message, {
					"question": `What info would you like to grab? (${dataTypes.join(", ")})`,
					"validate": {
						"name": "data type",
						"array": dataTypes
					}
				});
			}
			if (args === "cancel") return message.reply("Cancelled command.");

			// Grab names
			if (args === "names") {
				const embed = new RichEmbed()
					.setAuthor(`${name[0].name}'s names`, `https://visage.surgeplay.com/face/${uuid}.png?${number}`)
					.setDescription("```")
					.setColor("#E3E3E3");

				name.forEach(function(i, index) {
					if (name.length === 1) {embed.description += `\n*Purchased | ${i.name} (Current)`; return};
					if (index + 1 === name.length) {embed.description += `\nPurchased | ${i.name} (Original)`; return};

					const changedAt = new Date(i.changedToAt).toLocaleDateString("en-US", { "month": "2-digit", "day": "2-digit", "year": "2-digit" });
					if (index === 0) {embed.description += `\n${changedAt}  | ${i.name} (Current)`; return};
					embed.description += `\n${changedAt}  | ${i.name}`;
				});
				embed.description += "```";

				return message.channel.send(embed);
			}
			// Grab UUID or name
			if (args === "uuid" || args === "name") {
				const embed = new RichEmbed()
					.setAuthor(`${name[0].name}'s name + UUID`, `https://visage.surgeplay.com/face/${uuid}.png?${number}`)
					.setDescription(stripIndents`
						\`\`\`
						Name | ${player.name}
						UUID | ${uuid}
						\`\`\`
					`)
					.setColor("#E3E3E3");

				return message.channel.send(embed);
			}
		}
	}
};