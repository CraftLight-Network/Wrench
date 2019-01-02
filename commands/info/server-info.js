const { Command } = require('discord.js-commando');
const moment = require('moment');
const { stripIndents } = require('common-tags');

const humanLevels = {
	0: 'None',
	1: 'Low',
	2: 'Medium',
	3: '(╯°□°）╯︵ ┻━┻',
	4: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
};

module.exports = class ServerInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'server-info',
			aliases: ['server', 'info', 'serverinfo'],
			group: 'info',
			memberName: 'server-info',
			description: 'Info of the server.',
			examples: ['info', 'server-info'],
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			}
		});
	}

	run(msg) {
		return msg.embed({
			color: 4021408,
			description: `Info of **${msg.guild.name}** (ID: ${msg.guild.id})`,
			fields: [
				{
					name: '➠ Channels',
					/* eslint-disable max-len */
					value: stripIndents`
						• ${msg.guild.channels.filter(ch => ch.type === 'text').size} Text, ${msg.guild.channels.filter(ch => ch.type === 'voice').size} Voice
						• AFK: ${msg.guild.afkChannelID ? `<#${msg.guild.afkChannelID}> after ${msg.guild.afkTimeout / 60}min` : 'None.'}
					`,
					/* eslint-enable max-len */
					inline: true
				},
				{
					name: '➠ Member',
					value: stripIndents`
						• ${msg.guild.memberCount} members
						• Owner: ${msg.guild.owner.user.tag}
						(ID: ${msg.guild.ownerID})
					`,
					inline: true
				},
				{
					name: '➠ Other',
					value: stripIndents`
						• Roles: ${msg.guild.roles.size}
						• Region: ${msg.guild.region}
						• Created at: ${moment.utc(msg.guild.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}
						• Verification Level: ${humanLevels[msg.guild.verificationLevel]}
					`
				}
			],
			thumbnail: { url: msg.guild.iconURL }
		});
	}
};