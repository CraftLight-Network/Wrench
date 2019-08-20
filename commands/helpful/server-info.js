const { Command } = require('discord.js-commando');
const moment = require('moment');
const { RichEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

const humanLevels = {
	0: 'None',
	1: 'Low',
	2: 'Medium',
	3: '(╯°□°）╯︵ ┻━┻',
	4: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
};

module.exports = class serverInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'server-info',
			aliases: ['server', 'info'],
			group: 'helpful',
			memberName: 'server-info',
			description: 'Info of the server.',
			examples: ['server-info'],
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			}
		});
	}
	run(msg) {
		
		const embed = new RichEmbed()
		.setDescription(`**ID: ${msg.guild.id}**`)
		.setAuthor(`Server Info: ${msg.guild.name}`)
		.setThumbnail(msg.guild.iconURL)
		.addField('**» Channels**', stripIndents`
			• ${msg.guild.channels.filter(ch => ch.type === 'text').size} Text, ${msg.guild.channels.filter(ch => ch.type === 'voice').size} Voice
			• AFK: ${msg.guild.afkChannelID ? `<#${msg.guild.afkChannelID}> after ${msg.guild.afkTimeout / 60}min` : 'None.'}
		`, true)
		.addField('**» Members**', stripIndents`
			• ${msg.guild.memberCount} members
			• Owner: ${msg.guild.owner.user.tag}
			  (${msg.guild.ownerID})
		`, true)
		.addField('**» Misc.**', stripIndents`
			• Roles: ${msg.guild.roles.size}
			• Region: ${msg.guild.region}
			• Created on: ${moment.utc(msg.guild.createdAt).format('dddd, MMMM Do YYYY, h:mm:ss A (M/D/YY)')}
			• Verification Level: ${humanLevels[msg.guild.verificationLevel]}
		`, true)
		.setColor(0x2F5EA3)
		.setTimestamp();
		return msg.say(embed);
	}
};