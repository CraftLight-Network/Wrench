module.exports.logger = function logger(client, log, settings, defaultSettings) {
	const { RichEmbed } = require('discord.js');
	
	client.on('disconnect', event => {log.ERROR(`[DISCONNECT] ${event.code}`);process.exit(0)}); // Notify the console that the bot has disconnected
	process.on('unhandledRejection', (err, p) => {log.ERROR(`Rejected Promise: ${p} / Rejection: ${err}`);}); // Unhandled Rejection
	client.on('error', err => log.ERROR(err)); // Errors
	client.on('warn', warn => log.WARN(warn)); // Warnings
	client.on('log', log => log.CONSOLE(log)); // Logs
	
	// Notify the console that a new server is using the bot
	client.on("guildCreate", guild => {log.INFO(`Added in a new server: ${guild.name} (id: ${guild.id})`); settings.ensure(guild.id)});
	
	// Notify the console that a server removed the bot
	client.on("guildDelete", guild => {log.INFO(`Removed from server: ${guild.name} (id: ${guild.id})`); settings.delete(guild.id)});
	
	// Events when a user is added
	client.on("guildMemberAdd", member => {
		settings.ensure(member.guild.id, defaultSettings);
		settings.fetchEverything();
		
		if (settings.get(member.guild.id, "welcome") !== 'none') {
			if (!member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "welcome"))) return;
			
			let welcomeMessage = settings.get(member.guild.id, "welcomeMessage");
			welcomeMessage = welcomeMessage.replace("{{user}}", `<@${member.user.id}>`);
			welcomeMessage = welcomeMessage.replace("{{id}}", member.user.id);
			
			member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "welcome")).send(welcomeMessage).catch(console.error);
		}
		
		if (settings.get(member.guild.id, "joinRole") !== 'none') {
			if (!member.guild.roles.find(role => role.name == settings.get(member.guild.id, "joinRole"))) return;
			
			member.addRole(member.guild.roles.find(role => role.name == settings.get(member.guild.id, "joinRole")).id).catch(console.error);
		}
		
		if (settings.get(member.guild.id, "log") !== 'none') {
			if (!member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "log"))) return;
		
			const embed = new RichEmbed()
			.setFooter(`${new Date().toLocaleString("en-US")} UTC`)
			.setDescription(`**<@${member.user.id}>**`)
			.setAuthor('Member joined', member.user.displayAvatarURL)
			.setColor(0x00FF00);
			member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "log")).send(embed).catch(console.error);
		}
	});
	
	// Events when a user is removed
	client.on("guildMemberRemove", member => {
		settings.ensure(member.guild.id, defaultSettings);
		settings.fetchEverything();
		
		if (settings.get(member.guild.id, "leave") !== 'none') {
			if (!member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "leave"))) return;
		
			let leaveMessage = settings.get(member.guild.id, "leaveMessage");
			leaveMessage = leaveMessage.replace("{{user}}", `<@${member.user.id}>`);
			leaveMessage = leaveMessage.replace("{{id}}", member.user.id);
			
			member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "leave")).send(leaveMessage).catch(console.error);
		}
		
		if (settings.get(member.guild.id, "log") !== 'none') {
			if (!member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "log"))) return; 
		
			const embed = new RichEmbed()
			.setFooter(`${new Date().toLocaleString("en-US")} UTC`)
			.setDescription(`**<@${member.user.id}>**`)
			.setAuthor('Member left', member.user.displayAvatarURL)
			.setColor(0xFF0000);
			member.guild.channels.find(channel => channel.name == settings.get(member.guild.id, "log")).send(embed).catch(console.error);
		}
	});
	
	// Log bans
	client.on("guildBanAdd", async (guild, member) => {
		if (settings.get(guild.id, "log") !== 'none') {
			if (!guild.channels.find(channel => channel.name == settings.get(guild.id, "log"))) return; 
			
			const user = await guild.fetchAuditLogs({type: 'MEMBER_BAN_ADD'}).then(audit => audit.entries.first());
		
			const embed = new RichEmbed()
			.setFooter(`${new Date().toLocaleString("en-US")} UTC`)
			.setDescription(`By: **<@${user.executor.id}>**\n\nUser: **<@${member.id}>**`)
			.setAuthor('Member banned', user.executor.displayAvatarURL)
			.setColor(0xFF0000);
			guild.channels.find(channel => channel.name == settings.get(guild.id, "log")).send(embed).catch(console.error);
		}
	});
	
	client.on("guildBanRemove", async (guild, member) => {
		if (settings.get(guild.id, "log") !== 'none') {
			if (!guild.channels.find(channel => channel.name == settings.get(guild.id, "log"))) return; 
			
			const user = await guild.fetchAuditLogs({type: 'MEMBER_BAN_REMOVE'}).then(audit => audit.entries.first());
		
			const embed = new RichEmbed()
			.setFooter(`${new Date().toLocaleString("en-US")} UTC`)
			.setDescription(`By: **<@${user.executor.id}>**\n\nUser: **<@${member.id}>**`)
			.setAuthor('Member unbanned', user.executor.displayAvatarURL)
			.setColor(0x00FF00);
			guild.channels.find(channel => channel.name == settings.get(guild.id, "log")).send(embed).catch(console.error);
		}
	});
	
	// Log deleted messages
	client.on("messageDelete", async (message) => {
		if (settings.get(message.guild.id, "log") !== 'none') {
			const tmpMsg = `${message}`; // Stringify the message (lazy)
			if (!message.guild.channels.find(channel => channel.name == settings.get(message.guild.id, "log"))) return;
			
			const user = await message.guild.fetchAuditLogs({type: 'MESSAGE_DELETE'}).then(audit => audit.entries.first())
		
			const embed = new RichEmbed()
			.setFooter(`${new Date().toLocaleString("en-US")} UTC`)
			.setDescription(`By: **<@${user.executor.id}>**\n\nAuthor: **<@${message.author.id}>**\nContent: **${tmpMsg.substring(0, 750)}**`)
			.setAuthor('Message deleted', user.executor.displayAvatarURL)
			.setColor(0xFF0000);
			if (tmpMsg.length > 750) {
				embed.description += " **...**";
			}
			message.guild.channels.find(channel => channel.name == settings.get(message.guild.id, "log")).send(embed).catch(console.error);
		}
	});
	
	// Log edited messages
	
	// Log channel creation
	client.on("channelCreate", async (channel) => {
		if (settings.get(channel.guild.id, "log") !== 'none') {
			if (!channel.guild.channels.find(channel => channel.name == settings.get(channel.guild.id, "log"))) return;
			
			const user = await channel.guild.fetchAuditLogs({type: 'CHANNEL_CREATE'}).then(audit => audit.entries.first())
			
			const embed = new RichEmbed()
			.setFooter(`${new Date().toLocaleString("en-US")} UTC`)
			.setDescription(`By: **<@${user.executor.id}>**\n\nChannel: **<#${channel.id}>**`)
			.setAuthor('Channel created', user.executor.displayAvatarURL)
			.setColor(0x00FF00);
			if (channel.parent !== null) {embed.description += `\nCategory: **${channel.parent}**`}
			
			channel.guild.channels.find(channel => channel.name == settings.get(channel.guild.id, "log")).send(embed).catch(console.error);
		}
	});
	
	// Log channel creation
	client.on("channelDelete", async (channel) => {
		if (settings.get(channel.guild.id, "log") !== 'none') {
			if (!channel.guild.channels.find(channel => channel.name == settings.get(channel.guild.id, "log"))) return;
			
			const user = await channel.guild.fetchAuditLogs({type: 'CHANNEL_DELETE'}).then(audit => audit.entries.first())
			
			const embed = new RichEmbed()
			.setFooter(`${new Date().toLocaleString("en-US")} UTC`)
			.setDescription(`By: **<@${user.executor.id}>**\n\nChannel: **#${channel.name}**`)
			.setAuthor('Channel deleted', user.executor.displayAvatarURL)
			.setColor(0xFF0000);
			if (channel.parent !== null) {embed.description += `\nCategory: **${channel.parent}**`}
			
			channel.guild.channels.find(channel => channel.name == settings.get(channel.guild.id, "log")).send(embed).catch(console.error);
		}
	});
	
	// Log emojis
	client.on("emojiCreate", async (emoji) => {
		if (settings.get(emoji.guild.id, "log") !== 'none') {
			if (!emoji.guild.channels.find(channel => channel.name == settings.get(emoji.guild.id, "log"))) return;
			
			const user = await emoji.guild.fetchAuditLogs({type: 'EMOJI_CREATE'}).then(audit => audit.entries.first())
			
			const embed = new RichEmbed()
			.setFooter(`${new Date().toLocaleString("en-US")} UTC`)
			.setDescription(`By: **<@${user.executor.id}>**\n\nName: **${emoji.name}**\nEmoji: <:${emoji.name}:${emoji.id}>`)
			.setAuthor('Emoji added', user.executor.displayAvatarURL)
			.setColor(0x00FF00);
	
			emoji.guild.channels.find(channel => channel.name == settings.get(emoji.guild.id, "log")).send(embed).catch(console.error);
		}
	});
	
	client.on("emojiDelete", async (emoji) => {
		if (settings.get(emoji.guild.id, "log") !== 'none') {
			if (!emoji.guild.channels.find(channel => channel.name == settings.get(emoji.guild.id, "log"))) return;
			
			const user = await emoji.guild.fetchAuditLogs({type: 'EMOJI_DELETE'}).then(audit => audit.entries.first())
			
			const embed = new RichEmbed()
			.setFooter(`${new Date().toLocaleString("en-US")} UTC`)
			.setDescription(`By: **<@${user.executor.id}>**\n\nName: **${emoji.name}**`)
			.setAuthor('Emoji removed', user.executor.displayAvatarURL)
			.setColor(0xFF0000);
	
			emoji.guild.channels.find(channel => channel.name == settings.get(emoji.guild.id, "log")).send(embed).catch(console.error);
		}
	});
	
	client.on("emojiUpdate", async (emoji, newEmoji) => {
		if (settings.get(emoji.guild.id, "log") !== 'none') {
			if (!emoji.guild.channels.find(channel => channel.name == settings.get(emoji.guild.id, "log"))) return;
			
			const user = await emoji.guild.fetchAuditLogs({type: 'EMOJI_UPDATE'}).then(audit => audit.entries.first())
			
			const embed = new RichEmbed()
			.setFooter(`${new Date().toLocaleString("en-US")} UTC`)
			.setDescription(`By: **<@${user.executor.id}>**\n\nBefore: **${emoji.name}**\nAfter: **${newEmoji.name}**\nEmoji: <:${emoji.name}:${emoji.id}>`)
			.setAuthor('Emoji updated', user.executor.displayAvatarURL)
			.setColor(0x2F5EA3);
	
			emoji.guild.channels.find(channel => channel.name == settings.get(emoji.guild.id, "log")).send(embed).catch(console.error);
		}
	});
};