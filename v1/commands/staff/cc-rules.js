const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

module.exports = class ccRulesCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'cc-rules',
            group: 'staff',
            memberName: 'cc-rules',
            description: 'Embed CustomCraft\'s rules.',
            examples: ['cc-rules'],
			guildOnly: false,
			throttling: {
				usages: 1,
				duration: 60
			},
        });
    }
	run(msg) {
		const embed1 = new RichEmbed()
		.setTitle('»» Discord Rules')
		.setThumbnail('https://cust.pw/images/ccDiscord_TrimCompressed.png')
		.addField('**𝟷.)** *No NSFW or self harm content.*', 'This is a strict rule. No pictures of inappropriate body parts, and no talking about legitimately harming yourself.')
		.addField('**𝟸.)** *Do not be rude, sexist, racist, etc.*', 'We\'re here to talk. Not to make fun of others. If you\'re just joking, make sure it is obvious.')
		.addField('**𝟥.)** *Please do not spam.*', 'If you\'re posting the same text/image over and over again, or sending lots emojis, it\'s spam.')
        .addField('**𝟦.)** *No advertising.*', 'If you\'re showing people something you did, alright! That\'s fine! If you are sending content to get people to subscribe, follow, or anything else to you, that is advertising.')
        .addField('**𝟧.)** *Use your brain.*', 'If you think something would be wrong or considered anything from above, just ask an admin. They know if it is okay or not.\n　\u200b')
        .addField('**» Clarification**', 'To aid your understanding.')
        .addField('**𝟷.)** *Swearing is allowed.*', '*Derogatory terms such as the "N-Word" and such are not allowed.*')
		.addField('**𝟸.)** *Long copy-paste "Share with your friends" stories are spam.*', 'Example: \"`A Discord user is DDOSing you!! Share in every server you\'re in!!`\"')
		.setColor(0x2F5EA3);
		
		const embed2 = new RichEmbed()
		.setTitle('»» Network Rules')
		.setThumbnail('https://cust.pw/images/ccIcon_TrimCompressed.png')
		.addField('**𝟷.)** *Follow all Discord rules.*', 'All of the rules from this server also apply on all game servers.')
		.addField('**𝟸.)** *Do not hack.*', 'This is a basic one. Any hacked clients or extreme client/launcher mods are not allowed.')
		.addField('**𝟥.)** *Do not abuse bugs.*', 'Report all bugs/exploits here. You will be rewarded. Everything is logged anyways, so why would you skip on a cool prize?')
        .addField('**𝟦.)** *No trolling/greifing.*', 'Raids are allowed, but you cannot blow up builds.')
        .addField('**𝟧.)** *Don\'t Trap/rob players*', 'Do not create teleport traps, hidden block traps, or any construction that traps a player so that they are easy to kill.\n　\u200b')
        .addField('**» Clarification**', 'To aid your understanding.')
        .addField('**𝟷.)** *Optifine and client-improvement mods are allowed.*', '*Mods such as Minimap, Xray, Tracers, and Badlion are not.*')
		.setTimestamp()
		.setColor(0x2F5EA3);
		
		msg.delete();
		msg.say(embed1);
		return msg.say(embed2);
	}
};