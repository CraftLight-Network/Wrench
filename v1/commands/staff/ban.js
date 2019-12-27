const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const moment = require('moment');

const { delayFor } = require('discord.js').Util;
var active;
var unit;
var invite;

const Enmap = require("enmap");
const tempBans = new Enmap({
	name: "tempBans",
	autoFetch: true,
	fetchAll: false
});
tempBans.ensure("bans", [""]);

const { commandsRead, messagesRead, translationsDone, settings } = require('../../data/js/enmap.js');
const defaultSettings = require('../../data/json/default.json');

module.exports = class banCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ban',
			group: 'staff',
			memberName: 'ban',
			description: 'Ban a Discord member.',
			examples: ['ban @Edude42 24h Being too cool'],
			guildOnly: true,
			userPermissions: ['BAN_MEMBERS'],
			args: [
				{
					key: 'member',
					prompt: 'Who would you like to ban?',
					type: 'member'
				},
				{
					key: 'time',
					prompt: 'How long? 24h, 5mo, etc.',
					type: 'string',
					parse: confirmation => confirmation.toLowerCase(),
					validate: text => {
						if (text.replace(/[0-9]+[a-z]*/gmi, "nothing").trim() === "nothing") return true;
						return `please use a valid date code! <num>s, m, h, mo, y`;
					}
				},
				{
					key: 'reason',
					prompt: 'Why are you banning this user?',
					type: 'string',
				},
			]
		});
	}
	async run(msg, { member, time, reason }) {
	    console.log(time.replace(/[0-9]+/gmi, ""))
        if (time.replace(/[0-9]+/gmi, "") === "s") {unit = "seconds"}
        else if (time.replace(/[0-9]+/gmi, "") === "m") {unit = "minutes"}
        else if (time.replace(/[0-9]+/gmi, "") === "h") {unit = "hours"}
        else if (time.replace(/[0-9]+/gmi, "") === "d") {unit = "days"}
        else if (time.replace(/[0-9]+/gmi, "") === "mo") {unit = "months"}
        else if (time.replace(/[0-9]+/gmi, "") === "y") {unit = "years"}
        else if (!unit) {return msg.reply('Please provide a valid time unit! `s`, `m`, `h`, `d`, `mo`, `y`')}
        
        const inTime = moment(Date.now()).add(time.replace(/[a-z]*/gmi, ""), unit);
        
        async function banTimer() {
            await msg.channel.guild.channels.forEach(channel => {
                channel.permissionOverwrites.forEach(async (permissions) => {
                    if (!permissions.allowed.has('CREATE_INSTANT_INVITE')) return;
                    
                    invite = await Command.client.channels.get(permissions.id).createInvite({
                        maxAge: 0,
                        maxUses: 1,
                        unique: true
                    }, `${member}\'s invite link from ban: ${moment(inTime).format('dddd, MMMM Do (MM/DD/YYYY)')}`);
                });
            });

            await member.send(`You have been banned from **${msg.guild.name}**.\n\nStaff: **${msg.author.tag}**\nTime: **${time}**\nReason: **${reason}**\n\nYour ban will expire **${moment(inTime).format('dddd, MMMM Do (MM/DD/YYYY)')}**\n\nInvite link: ${invite}`);
            
    	    msg.guild.ban(member, {
    	        days: 0,
                reason: `BAN: ${msg.author.tag} | ${time} | ${reason}`,
            }).then(async () => {
                const embed = new RichEmbed()
    			.setFooter(`${new Date().toLocaleString("en-US")} UTC`)
    			.setDescription(`By: **<@${msg.author.id}>**\n\nBanned: **${member}**\nTime: **${time}**\nReason: **${reason}**`)
    			.setAuthor('User banned', member.user.displayAvatarURL)
    			.setColor(0xFF0000);
    			
				msg.guild.channels.find(channel => channel.name == settings.get(msg.guild.id, "log")).send(embed).catch(console.error);
				
                msg.reply(`Banned ${member}. View details in <#${settings.get(msg.guild.id, "log").id}>`);

                tempBans.set(`${msg.guild.id}-${member.user.id}`, {
                    by: msg.author.id,
                    member: member.user.id,
                    guild: msg.guild.id,
                    reason: reason,
                    time: time,
                    inTime: inTime
                });
                
            }).catch(err => {
                msg.reply(`Unable to ban ${member}`);
                console.error(err);
            });
        }
        banTimer()
	}
};