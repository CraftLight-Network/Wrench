const { CommandoClient } = require('discord.js-commando');
const { Command } = require('discord.js-commando');
const config = require('../../config.json');
const Enmap = require("enmap");

const client = new CommandoClient({
	commandPrefix: config.prefix,
	owner: config.owners,
	disableEveryone: true,
	unknownCommandResponse: false,
});

client.settings = new Enmap({
		name: "settings",
		fetchAll: false,
		autoFetch: true,
		cloneLevel: 'deep'
});

const defaultSettings = {
	logChannel: "log",
	welcomeEnabled: "false",
	welcomeChannel: "welcome",
	welcomeMessage: "Welcome {{user}}! Make sure to follow the rules!",
	botChannelOnly: "false",
	botChannel: "commands"
}

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
					prompt: 'Would you like to view or set a value?',
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
		if (action === '') return msg.reply('please specify if you want to view or set.');
		if (property === '') return msg.reply(`please specify what setting you want to ${action}.`);
		if (value === '' && action == 'set') return msg.reply(`please specify what you want to set \`${property}\` to.`);
		const guildConf = client.settings.ensure(msg.guild.id, defaultSettings);
		
		if (action === 'set') {
			if (`${client.settings.get(msg.guild.id, property)}` !== 'undefined') {
				client.settings.set(msg.guild.id, value, property);
				msg.say(`The setting "${property}" has been set to "${client.settings.get(msg.guild.id, property)}"`);
			} else return msg.reply('that value does not exist in the system.');
		} else {
			if (`${client.settings.get(msg.guild.id, property, value)}` !== 'undefined') {
				client.settings.fetchEverything();
				msg.say(`The setting "${property}" is set to "${client.settings.get(msg.guild.id, property)}"`);
			} else return msg.reply('that value does not exist in the system.');
		}
	}
};