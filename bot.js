// Base components
const { CommandoClient } = require('discord.js-commando');;
const { RichEmbed } = require('discord.js');
const { oneLine } = require('common-tags');
const path = require('path');

// Require the authentication key file
const auth = require("./auth.json");

// Require the config file
const config = require("./config.json")

// Create the CommandoClient
const client = new CommandoClient({
    commandPrefix: config.prefix,
    owner: config.owners,
    disableEveryone: true
});

// Register the groups
client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['fun', 'Fun'],
        ['info', 'Info'],
        ['owner', 'Owner Only'],
        ['uncategorized', 'Uncategorized'],
    ])
	// Disable eval and set up defaults
    .registerDefaultGroups()
	.registerDefaultCommands({
		eval: false
	})
    .registerCommandsIn(path.join(__dirname, 'commands'));

// Startup messages
client.on("ready", () => {
  console.log(`Bot has started.`);
  console.log(`Active in ${client.guilds.size} servers.`)
  console.log(`Enjoy your bot experience!`)
  console.log(` `)
  console.log(`Press CTRL+C to stop the bot.`)
  // User activity message
  client.user.setActivity(`War never changes.`);
});

// Notify the console that a new server is using the bot
client.on("guildCreate", guild => {
  console.log(`Added in a new server: ${guild.name} (id: ${guild.id})`);
});

// Notify the console that a server removed the bot
client.on("guildDelete", guild => {
  console.log(`Removed from server: ${guild.name} (id: ${guild.id})`);
});

// Rejection Handler

process.on('unhandledRejection', (err, p) => {
  console.log(`Rejected Promise: ${p} / Rejection: ${err}`);
});

client.login(auth.token);