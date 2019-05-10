const { Command } = require('discord.js-commando');
const Discord = require("discord.js");
const snekfetch = require('snekfetch');
const Random = require('random-js');

const { subreddit } = require('../../files/meme');

module.exports = class memeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'meme',
			aliases: ['memes', 'dankmeme', 'dankmemes'],
			group: 'fun',
			memberName: 'meme',
			description: 'Grab a random meme from r/dankmemes',
			examples: ['meme']
		});
	}
	async run(msg) {
		const random = new Random();
		const reddit = subreddit[random.integer(0, subreddit.length - 1)];
		const { body } = await snekfetch
            .get(`https://www.reddit.com/r/${reddit}.json?sort=top&t=week`)
            .query({ limit: 800 });
        const allowed = msg.channel.nsfw ? body.data.children : body.data.children.filter(post => !post.data.over_18);
        if (!allowed.length) return msg.reply('It seems we are out of fresh memes!, Try again later.');
        const randomnumber = Math.floor(Math.random() * allowed.length)
        const embed = new Discord.RichEmbed()
        .setColor(0x2F5EA3)
        .setTitle(allowed[randomnumber].data.title)
        .setDescription("Posted by: " + allowed[randomnumber].data.author + "\nUp votes: " + allowed[randomnumber].data.ups + " / Comments: " + allowed[randomnumber].data.num_comments)
        .setImage(allowed[randomnumber].data.url)
        .setFooter(`Memes provided by r/${reddit}`)
        msg.channel.send(embed)
	}
};