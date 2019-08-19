const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');

const Enmap = require("enmap");
const { commandsRead, messagesRead, translationsDone, settings } = require('../../data/js/enmap.js');
const defaultSettings = require('../../data/json/default.json');

module.exports = class purgeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'purge',
			aliases: ['prune'],
			group: 'staff',
			memberName: 'purge',
			description: 'Delete a specified number of messages',
			examples: ['purge 25'],
			guildOnly: true,
			userPermissions: ['MANAGE_GUILD', 'MANAGE_MESSAGES'],
			args: [
				{
					key: 'number',
					prompt: 'How many messages would you like to purge? Max: 99',
					type: 'integer',
					validate: text => {
						if (text <= 99 && text >= 2) return true;
						return 'please keep under 99 and over 2 messages!';
					}
				},
				{
					key: 'confirmation',
					prompt: 'Are you sure you want to do this? `yes` | `no`',
					type: 'string',
					parse: confirmation => confirmation.toLowerCase(),
					default: ''
				}
			]
		});
	}
	run(msg, { number, confirmation }) {
		if (confirmation === 'yes') {
			msg.channel.bulkDelete(number + 1)
			
			settings.ensure(msg.guild.id, defaultSettings);
			settings.fetchEverything();
			if (settings.get(msg.guild.id, "log") !== 'none') {
				if (!msg.guild.channels.find(channel => channel.name == settings.get(msg.guild.id, "log"))) return; 
				
				const embed = new RichEmbed()
				.setFooter(`${new Date().toLocaleString("en-US")} UTC`)
				.setDescription(`By: **<@${msg.author.id}>**\n\nIn: **<#${msg.channel.id}>**\nDeleted: **${number}**`)
				.setAuthor('Message purge', msg.author.displayAvatarURL)
				.setColor(0xFF0000);
				msg.guild.channels.find(channel => channel.name == settings.get(msg.guild.id, "log")).send(embed).catch(console.error);
			}
		}  else return msg.reply(`Are you sure you want to purge ${number} messags? Re-run the command with ${number} \`yes\``);
	}
};