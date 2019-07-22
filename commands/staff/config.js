const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const config = require('../../config.json');

const Enmap = require("enmap");
const { commandsRead, messagesRead, translationsDone, settings } = require('../../data/js/enmap.js');
const defaultSettings = require('../../data/json/default.json');

module.exports = class configCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'config',
			aliases: ['conf'],
			group: 'staff',
			memberName: 'config',
			description: 'Set various server settings',
			examples: ['config set welcomeChannel hello'],
			guildOnly: true,
			userPermissions: ['MANAGE_GUILD'],
			args: [
				{
					key: 'action',
					prompt: 'Would you like to view a settings, set a value, or reset all settings?',
					type: 'string',
					default: ''
				},
				{
					key: 'property',
					prompt: 'What would you like to take action on?',
					type: 'string',
					default: ''
				},
				{
					key: 'value',
					prompt: 'What would you like to set it to?',
					type: 'string',
					default: ''
				}
			]
		});
	}
	run(msg, { action, property, value }) {
		settings.ensure(msg.guild.id, defaultSettings);
		settings.fetchEverything();
		
		if (action === '') return msg.reply('please specify if you want to do.');
		if (action === 'help') {
			const config = settings.get(msg.guild.id);
			const embed = new RichEmbed()
			.setAuthor(`${msg.guild.name}'s Config help`, msg.guild.iconURL)
			.setDescription(`__**Property - Value**__\n`)
			.setColor(0x2F5EA3)
			.setURL('http://cust.pw/wb')
			.setFooter(`More info on config values: http://cust.pw/wb`);
			for(var attributename in config){
				embed.description += `**${attributename}** - ${config[attributename]}\n`;
			}
			return msg.channel.send(embed);
		}
		
		if (action === 'reset') {
			if (property === '') return msg.reply(`Are you sure you want to ${action}? Re-run the command with ${action} \`yes\``);
			if (property === 'yes') {
				settings.delete(msg.guild.id);
				settings.ensure(msg.guild.id, defaultSettings);
				msg.reply('The config has been reset and updated. Run the help command to see the new and current values.');
				return;
			}
		}
		
		if (property === '') return msg.reply(`please specify what setting you want to ${action}.`);
		if (value === '' && action == 'set') return msg.reply(`please specify what you want to set \`${property}\` to.`);
		
		if (action === 'set') { // SET
			if (`${settings.get(msg.guild.id, property)}` !== 'undefined') {
				if (JSON.stringify(settings.get(msg.guild.id, property)).startsWith("[")) {
					return msg.say(`The setting "${property}" is an array object. Please use \`add\` or \`remove\` instead of \`set\``);
				}
				settings.set(msg.guild.id, value, property);
				msg.say(`The setting "${property}" has been set to "${settings.get(msg.guild.id, property)}"`);
			} else return msg.reply('that value does not exist in the system.');
		} else if (action === 'add') { // ADD
			if (`${settings.get(msg.guild.id, property)}` !== 'undefined') {
				if (!(JSON.stringify(settings.get(msg.guild.id, property)).startsWith("["))) {
					return msg.say(`The setting "${property}" is not an array object. Please use \`set\``);
				}
				settings.push(msg.guild.id, value, property);
				msg.say(`The setting "${settings.get(msg.guild.id, property)}" has been added to "${property}"`);
			} else return msg.reply('that value does not exist in the system.');
		} else if (action === 'remove') { // REMOVE
			if (`${settings.get(msg.guild.id, property)}` !== 'undefined') {
				if (!(JSON.stringify(settings.get(msg.guild.id, property)).startsWith("["))) {
					return msg.say(`The setting "${property}" is not an array object. Please use \`set\``);
				}
				settings.remove(msg.guild.id, value, property);
				msg.say(`The setting "${settings.get(msg.guild.id, property)}" has been removed from "${property}"`);
			} else return msg.reply('that value does not exist in the system.');
		} else { // VIEW
			if (`${settings.get(msg.guild.id, property, value)}` !== 'undefined') {
				msg.say(`The setting "${property}" is set to "${settings.get(msg.guild.id, property)}"`);
			} else return msg.reply('that value does not exist in the system.');
		}
	}
};