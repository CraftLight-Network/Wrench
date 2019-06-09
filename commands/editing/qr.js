const { Command } = require('discord.js-commando');
const request = require('node-superfetch');

const { shorten } = require('../util');

module.exports = class QRCodeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'qr',
			aliases: ['scan-qr-code', 'scan-qr', 'read-qr', 'read-qr-code'],
			group: 'editing',
			memberName: 'qr',
			description: 'Read a QR code from an image.',
			examples: ['qr <image>'],
			guildOnly: true,
			args: [
				{
					key: 'image',
					prompt: 'What qr code do you want me to read?',
					type: 'image'
				}
			]
		});
	}

	async run(msg, { image }) {
		try {
			const { body } = await request
				.get('https://api.qrserver.com/v1/read-qr-code/')
				.query({ fileurl: image });
			const data = body[0].symbol[0];
			if (!data.data) return msg.reply(`Could not read QR Code: ${data.error}.`);
			return msg.reply(shorten(data.data, 2000 - (msg.author.toString().length + 2)));
		} catch (err) {
			return msg.reply(`An error occurred: \`${err.message}\`.`);
		}
	}
};
