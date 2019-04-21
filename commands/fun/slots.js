const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');

const combinations = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 4, 8], [2, 4, 6]];
const reels = [
	['🍒', '💰', '⭐', '🎲', '💎', '❤', '⚜', '🔅', '🎉'],
	['💎', '🔅', '❤', '🍒', '🎉', '⚜', '🎲', '⭐', '💰'],
	['❤', '🎲', '💎', '⭐', '⚜', '🍒', '💰', '🎉', '🔅']
];

const values = {
	'💎': 500,
	'⚜': 400,
	'💰': 400,
	'❤': 300,
	'⭐': 300,
	'🎲': 250,
	'🔅': 250,
	'🎉': 250,
	'🍒': 250
};

module.exports = class slotsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'slots',
			aliases: ['slot', 'slot-machine', 'slotmachine'],
			group: 'fun',
			memberName: 'slots',
			description: 'Play the slots.',
			examples: ['slots'],
			guildOnly: true,
			throttling: {
				usages: 1,
				duration: 5
			},
		});
	}
	async run(msg, { coins }) {

		const roll = this.generateRoll();
		let winnings = 0;

		combinations.forEach(combo => {
			if (roll[combo[0]] === roll[combo[1]] && roll[combo[1]] === roll[combo[2]]) {
				winnings += values[roll[combo[0]]];
			}
		});

		if (winnings === 0) {
			return msg.embed({
				color: 0xBE1931,
				description: stripIndents`
					**${msg.member.displayName}, you rolled:**

					${this.showRoll(roll)}

					**You lost!**
					Better luck next time!
				`
			});
		}
		return msg.embed({
			color: 0x5C913B,
			description: stripIndents`
				**${msg.member.displayName}, you rolled:**

				${this.showRoll(roll)}

				**Congratulations!**
				You won!
			`
		});
	}
	showRoll(roll) {
		return stripIndents`
			${roll[0]}ー${roll[1]}ー${roll[2]}
			${roll[3]}ー${roll[4]}ー${roll[5]}
			${roll[6]}ー${roll[7]}ー${roll[8]}
		`;
	}
	generateRoll() {
		const roll = [];
		reels.forEach((reel, index) => {
			const rand = Math.floor(Math.random() * reel.length);
			roll[index] = rand === 0 ? reel[reel.length - 1] : reel[rand - 1];
			roll[index + 3] = reel[rand];
			roll[index + 6] = rand === reel.length - 1 ? reel[0] : reel[rand + 1];
		});
		return roll;
	}
};
