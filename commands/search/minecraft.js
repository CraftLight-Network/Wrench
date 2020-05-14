// Define and require modules
const userInput = require("../../data/js/util").getUserInput;
const { Random, nativeMath } = require("random-js");
const { Command } = require("discord.js-commando");
const embed = require("../../data/js/util").embed;
const { stripIndents } = require("common-tags");
const request = require("async-request");
const config = require("../../config");

// Actions array
const actions	= ["skin", "info"];
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
				Run \`${config.prefix.commands}minecraft <action> (player) (args)\` to use commands.
				**Notes:**
				<action>: Required, what to do.
				(player): Required depending on action, in-game name or UUID of the player.
				(args): Required depending on action, data for specified action to use.

				Actions: \`${actions.join("`, `")}\`
				Skin types: \`${skinTypes.join("`, `")}\`
				Data types: \`${dataTypes.join("`, `")}\`
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
		// Get player variable if not defined
		if (!player) player = await userInput(message, { "question": "What is the in-game name or UUID of the player?" });
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
			// Make sure skin type if valid
			if (!args || !skinTypes.some(l => args.includes(l))) {args = ""; message.say("Invalid skin type.")};

			// Undefined skin action
			if (!args) {
				args = await userInput(message, {
					"question": `How would you like the skin? (\`${skinTypes.join("`, `")}\`)`,
					"validate": {
						"name": "skin type",
						"array": skinTypes
					}
				});
			}
			if (args === "cancel") return message.reply("Cancelled command.");

			const embedMessage = {
				"title": `${name[0].name}'s skin (${args})`,
				"thumbnail": `https://visage.surgeplay.com/face/16/${uuid}.png?${number}`,
				"image": `https://visage.surgeplay.com/${args}/${uuid}.png?${number}`
			};

			return message.channel.send(embed(embedMessage, message));
		}

		// Data actions
		if (action === "info") {
			// Make sure info type if valid
			if (!args || !dataTypes.some(l => args.includes(l))) {args = ""; message.say("Invalid data type.")};

			// Undefined data action
			if (!args) {
				args = await userInput(message, {
					"question": `What info would you like to grab? (\`${dataTypes.join("`, `")}\`)`,
					"validate": {
						"name": "data type",
						"array": dataTypes
					}
				});
			}
			if (args === "cancel") return message.reply("Cancelled command.");

			// Grab names
			if (args === "names") {
				const embedMessage = {
					"title": `${name[0].name}'s names`,
					"thumbnail": `https://visage.surgeplay.com/face/16/${uuid}.png?${number}`,
					"description": "```"
				};

				name.forEach(function(i, index) {
					if (name.length === 1) {embedMessage.description += `\n*Purchased | ${i.name} (Current)`; return};
					if (index + 1 === name.length) {embedMessage.description += `\nPurchased | ${i.name} (Original)`; return};

					const changedAt = new Date(i.changedToAt).toLocaleDateString("en-US", { "month": "2-digit", "day": "2-digit", "year": "2-digit" });
					if (index === 0) {embedMessage.description += `\n${changedAt}  | ${i.name} (Current)`; return};
					embedMessage.description += `\n${changedAt}  | ${i.name}`;
				});
				embedMessage.description += "```";

				return message.channel.send(embed(embedMessage, message));
			}
			// Grab UUID or name
			if (args === "uuid" || args === "name") {
				const embedMessage = {
					"title": `${name[0].name}'s name + UUID`,
					"thumbnail": `https://visage.surgeplay.com/face/16/${uuid}.png?${number}`,
					"description": stripIndents`
						\`\`\`
						Name | ${player.name}
						UUID | ${uuid}
						\`\`\`
					`
				};

				return message.channel.send(embed(embedMessage, message));
			}
		}
	}
};