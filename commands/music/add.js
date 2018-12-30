const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const yt = require('ytdl-core');

const config = require("../../config.json")

module.exports = class addCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'add',
			aliases: ['queue', 'song'],
            group: 'music',
            memberName: 'add',
            description: 'Add music to the queue.',
            examples: ['add <YouTube Link>'],
			guildOnly: true,
			throttling: {
				usages: 1,
				duration: 3
			},
        });
    }
	run(msg, { text }) {
		let url = msg.content.split(' ')[1];
		if (url == '' || url === undefined) return msg.channel.send(`No link provided! Add songs with${config.prefix}add <ytLINK>`);
		yt.getInfo(url, (err, info) => {
			if(err) return msg.channel.send('Invalid YouTube Link: ' + err);
			if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
			queue[msg.guild.id].songs.push({url: url, title: info.title, requester: msg.author.username});
			msg.channel.send(`Added **${info.title}** to the queue`);
		});
	}
};