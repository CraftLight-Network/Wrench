// Define and require modules
const { Random, nativeMath } = require("random-js");
const { Command } = require("discord.js-commando");
const { stripIndents } = require("common-tags");
const { RichEmbed } = require("discord.js");
const config = require("../../config.json");
const request = require("async-request");

// Actions array
const actions	= ["skin", "info", "actions"];
const skinTypes = ["raw", "face", "front", "2d", "bust", "head", "3d"];
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
				Run \`${config.prefix}minecraft [action] [args]\` to choose a random number.
				**Notes:**
				[action]: Required, run \`${config.prefix}minecraft actions\` for actions.
				[user]: Required, in-game name of the player.
				[args] Required, data for specified action to use.
			`,
			"args": [
				{
					"key": "action",
					"prompt": "What would you like to do? (Do `actions` for list.)",
					"type": "string",
					"oneOf": actions
				},
				{
					"key": "user",
					"prompt": "What is the in-game name of the player?",
					"default": "",
					"type": "string"
				},
				{
					"key": "args",
					"prompt": "What data would you like to use for the specified action?",
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

	async run(message, { action, user, args }) {
		// List available actions
		if (action === "actions") {
			const embed = new RichEmbed()
				.setAuthor(`${config.prefix}minecraft Actions`, message.author.displayAvatarURL)
				.setDescription(stripIndents`
					\`skin\`: Grab the skin of a player
					Valid args: \`raw\`, \`face\`, \`front\`, \`2d\`, \`bust\`, \`3d\`.

					\`info\`: Get the info of a player
					Valid args: \`uuid\`, \`name\`, \`names\`.
				`)
				.setColor("#E3E3E3");
			return message.channel.send(embed);
		}

		// Get filter for user input
		const filter = res => {return res.author.id === message.author.id};

		// Undefined player action
		let exit = false;
		let player;
		while (!user && !exit) {
			message.reply(stripIndents`
				What is the in-game name of the player?
				Respond with \`cancel\` to cancel the command. The command will automatically be cancelled in 30 seconds.
			`);

			// Take user input
			user = await message.channel.awaitMessages(filter, {
				"max": 1,
				"time": 30000
			}).catch(function() {exit = true; user = "cancel"});

			// Set args to inputted value
			user.find(i => {player = i.content.split(" ")[0]});
			if (player === "cancel") break;
		}
		if (!player) player = user;
		if (player === "cancel") return message.reply("Cancelled command.");

		// Get a random number to fix cache issues
		const random = new Random(nativeMath);
		const number = random.integer(1, 65535);

		// Get UUID of user
		let uuid;
		if (player.length !== 32) {
			const playerRequest = await request(`https://api.mojang.com/users/profiles/minecraft/${player}`);
			player = JSON.parse(playerRequest.body);

			if (!player) return message.reply("That player does not exist. Please use a Minecraft in-game name.");
			uuid = player.id;
		} else uuid = player;

		// Get name of user
		const nameRequest = await request(`https://api.mojang.com/user/profiles/${uuid}/names`);
		const name = JSON.parse(nameRequest.body).reverse();

		// Skin actions
		if (action === "skin") {
			let skin;

			// Make sure skin type is valid
			if (!args || !skinTypes.some(l => args.includes(l))) {args = ""; message.say("Invalid skin type.")};

			// Undefined skin action
			while (!args && !exit) {
				message.reply(stripIndents`
					How would you like the skin? (${skinTypes.join(", ")})
					Respond with \`cancel\` to cancel the command. The command will automatically be cancelled in 30 seconds.
				`);

				// Take user input
				args = await message.channel.awaitMessages(filter, {
					"max": 1,
					"time": 30000
				}).catch(function() {exit = false; args = "cancel"});

				// Set args to inputted value
				args.find(i => {skin = i.content.split(" ")[0]});
				if (skin === "cancel") break;

				// Make sure skin type is valid
				if (!skinTypes.some(l => skin.includes(l))) {args = undefined; message.say("Invalid skin type.")};
			}
			if (!skin) skin = args;
			if (skin === "cancel") return message.reply("Cancelled command.");

			// Grab raw skin
			if (skin === "raw") {
				const embed = new RichEmbed()
					.setAuthor(`${name[0].name}'s skin (Raw)`, `https://visage.surgeplay.com/face/${uuid}.png?${number}`)
					.setImage(`https://visage.surgeplay.com/skin/${uuid}.png?${number}`)
					.setColor("#E3E3E3");
				return message.channel.send(embed);
			}

			// Grab face of player
			if (skin === "face") {
				const embed = new RichEmbed()
					.setAuthor(`${name[0].name}'s skin (Face)`, `https://visage.surgeplay.com/face/${uuid}.png?${number}`)
					.setImage(`https://visage.surgeplay.com/face/${uuid}.png?${number}`)
					.setColor("#E3E3E3");
				return message.channel.send(embed);
			}

			// Grab front of player
			if (skin === "front") {
				const embed = new RichEmbed()
					.setAuthor(`${name[0].name}'s skin (Front)`, `https://visage.surgeplay.com/face/${uuid}.png?${number}`)
					.setImage(`https://visage.surgeplay.com/front/${uuid}.png?${number}`)
					.setColor("#E3E3E3");
				return message.channel.send(embed);
			}

			// Grab 2D skin
			if (skin === "2d") {
				const embed = new RichEmbed()
					.setAuthor(`${name[0].name}'s skin (2D)`, `https://visage.surgeplay.com/face/${uuid}.png?${number}`)
					.setImage(`https://visage.surgeplay.com/frontfull/${uuid}.png?${number}`)
					.setColor("#E3E3E3");
				return message.channel.send(embed);
			}

			// Grab head of player
			if (skin === "head") {
				const embed = new RichEmbed()
					.setAuthor(`${name[0].name}'s skin (Head)`, `https://visage.surgeplay.com/face/${uuid}.png?${number}`)
					.setImage(`https://visage.surgeplay.com/head/${uuid}.png?${number}`)
					.setColor("#E3E3E3");
				return message.channel.send(embed);
			}

			// Grab player bust
			if (skin === "bust") {
				const embed = new RichEmbed()
					.setAuthor(`${name[0].name}'s skin (Bust)`, `https://visage.surgeplay.com/face/${uuid}.png?${number}`)
					.setImage(`https://visage.surgeplay.com/bust/${uuid}.png?${number}`)
					.setColor("#E3E3E3");
				return message.channel.send(embed);
			}

			// Grab 3D Skin
			if (skin === "3d") {
				const embed = new RichEmbed()
					.setAuthor(`${name[0].name}'s skin (3D)`, `https://visage.surgeplay.com/face/${uuid}.png?${number}`)
					.setImage(`https://visage.surgeplay.com/full/${uuid}.png?${number}`)
					.setColor("#E3E3E3");
				return message.channel.send(embed);
			}
		}

		// Data actions
		if (action === "info") {
			let info;

			// Make sure info type if valid
			if (!args || !dataTypes.some(l => args.includes(l))) {args = ""; message.say("Invalid data type.")};

			// Undefined data action
			while (args === "" && exit) {
				message.reply(stripIndents`
					What info would you like to grab? (${dataTypes.join(", ")})
					Respond with \`cancel\` to cancel the command. The command will automatically be cancelled in 30 seconds.
				`);

				// Take user input
				args = await message.channel.awaitMessages(filter, {
					"max": 1,
					"time": 30000
				}).catch(function() {exit = false; args = "cancel"});

				// Set args to inputted value
				args.find(i => {info = i.content.split(" ")[0]});
				if (info === "cancel") break;

				// Make sure info type is valid
				if (!dataTypes.some(l => info.includes(l))) {args = ""; message.say("Invalid data type.")};
			}
			if (!info) info = args;
			if (info === "cancel") return message.reply("Cancelled command.");

			// Grab names
			if (info === "names") {
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
			if (info === "uuid" || info === "name") {
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