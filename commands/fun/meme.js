const { subreddit } = require('../../data/json/meme');
const { Command } = require('discord.js-commando');
const Discord = require("discord.js");
const snekfetch = require('snekfetch');
const { Random } = require("random-js");

const Enmap = require("enmap");
const { lastSub } = require('../../data/js/enmap.js');

module.exports = class memeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'meme',
			group: 'fun',
			memberName: 'meme',
			description: 'Grab a random meme from a list of subreddits',
			examples: ['meme'],
			guildOnly: true
		});
	}
	async run(msg) {
		const random = new Random();
		let reddit = subreddit[random.integer(0, subreddit.length - 1)];		
		lastSub.ensure(msg.guild.id, reddit);
		
		while (reddit === lastSub.get(msg.guild.id)) {
			reddit = subreddit[random.integer(0, subreddit.length - 1)];
		};
		
		lastSub.set(msg.guild.id, reddit)
		
		const { body } = await snekfetch
		.get(`https://www.reddit.com/r/${reddit}.json?sort=top&t=week`)
		.query({ limit: 800 });
		
		const allowed = msg.channel.nsfw ? body.data.children : body.data.children.filter(post => !post.data.over_18);
		if (!allowed.length) return msg.reply('The only memes left aren\'t allowed! Please try again later.');
		const randomnumber = Math.floor(Math.random() * allowed.length)
		
		const embed = new Discord.RichEmbed()
		.setColor(0x2F5EA3)
		.setTitle(allowed[randomnumber].data.title)
		.setDescription("Author: " + allowed[randomnumber].data.author + "\nUpvotes: " + allowed[randomnumber].data.ups + " / Comments: " + allowed[randomnumber].data.num_comments)
		.setImage(allowed[randomnumber].data.url)
		.setFooter(`Meme from r/${reddit}`)
		msg.channel.send(embed)
	}
};
