const { Command } = require('discord.js-commando');
const RateLimiter = require('limiter').RateLimiter;
const { RichEmbed } = require('discord.js');
var request = require('request-promise');
var uuid;

module.exports = class minecraftCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'minecraft',
			aliases: ['mc'],
			group: 'helpful',
			memberName: 'minecraft',
			description: 'Grab various info from a Minecraft user.',
			guildOnly: true,
			args: [
				{
					key: 'action',
					prompt: 'What do you want me to grab?',
					type: 'string',
					default: 'info',
					parse: action => action.toLowerCase()
				},
				{
					key: 'user',
					prompt: 'What\'s the username of the user?',
					type: 'string'
				}
			]
		});
	}

	async run(msg, { action, user }) {
		let invalid;
		let uuid;
		let names;
		await request({
			url: `https://api.mojang.com/users/profiles/minecraft/${user}`,
			json: true,
			timeout: 5000
		}).then (function (body) {
			if (user.length === '32') return uuid = user;
			if (body === undefined) {invalid = 1; return msg.reply('that user does not exist. Make sure to enter a Minecraft IGN.')}
			uuid = body.id;
		});
		
		if (invalid === 1) return;
		
		if (action === 'skin') {
			const embed = new RichEmbed()
			.setAuthor(`${user}'s skin (Full)`)
			.setImage(`https://visage.surgeplay.com/skin/${uuid}.png`)
			.setColor(0x2F5EA3);
			return msg.channel.send(embed);
		}
		
		if (action === 'face') {
			const embed = new RichEmbed()
			.setAuthor(`${user}'s skin (Face)`)
			.setImage(`https://visage.surgeplay.com/face/${uuid}.png`)
			.setColor(0x2F5EA3);
			return msg.channel.send(embed);
		}
		
		if (action === 'head') {
			const embed = new RichEmbed()
			.setAuthor(`${user}'s skin (3D Head)`)
			.setImage(`https://visage.surgeplay.com/head/${uuid}.png`)
			.setColor(0x2F5EA3);
			return msg.channel.send(embed);
		}
		
		if (action === '2d' || action === 'front') {
			const embed = new RichEmbed()
			.setAuthor(`${user}'s skin (2D Front)`)
			.setImage(`https://visage.surgeplay.com/frontfull/${uuid}.png`)
			.setColor(0x2F5EA3);
			return msg.channel.send(embed);
		}
		
		if (action === '3d' || action === 'body') {
			const embed = new RichEmbed()
			.setAuthor(`${user}'s skin (3D Body)`)
			.setImage(`https://visage.surgeplay.com/player/${uuid}.png`)
			.setColor(0x2F5EA3);
			return msg.channel.send(embed);
		}
		
		if (action === 'info' || action === 'names') {
			await request({
				url: `https://api.mojang.com/user/profiles/${uuid}/names`,
				json: true,
				timeout: 5000
			}).then (function (body) {names = body.reverse()});
			const embed = new RichEmbed()
			.setAuthor(`${user}'s Playerinfo`)
			.setDescription(`__**Name history:**__\n`)
			.setColor(0x2F5EA3);
			names.forEach(function (item, index) {
				if (names.length === 1) return embed.description += `**Purchased** - ${item.name} (Current)\n`;
				if (index + 1 === names.length) return embed.description += `**Purchased** - ${item.name} (Original)\n`;
				const changed = new Date(item.changedToAt).toLocaleDateString("en-US");
				if (index === 0) return embed.description += `**${changed}** - ${item.name} (Current)\n`;
				embed.description += `**${changed}** - ${item.name}\n`;
			});
			embed.description += `\n__**Skin:**__\n]mc skin ${user}`;
			msg.channel.send(embed);
		}
	}
};