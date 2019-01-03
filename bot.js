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
    disableEveryone: true,
	unknownCommandResponse: false
});

// Activity list
const activities_list = [
    "]help", 
    "]invite",
	"on CustomCraft",
	"a game.",
    "customcraft.online",
	"Fallout Salvation",
	"FS: WNC",
	"with code.",
	"with Edude42",
	"with Spade",
	"things."
    ];

// Register everything
client.registry
	.registerDefaultTypes()
	.registerTypesIn(path.join(__dirname, 'types'))
	.registerGroups([
        ['fun', 'Fun'],
		['image', 'Image'],
		['guessing', 'Guessing'],
        ['info', 'Info'],
        ['owner', 'Owner Only'],
        ['uncategorized', 'Uncategorized'],
	])
	.registerDefaultGroups()
	.registerDefaultCommands({
		eval: false,
	})
	.registerCommandsIn(path.join(__dirname, 'commands'));

// Startup messages
client.on("ready", () => {
  console.log(`[READY] Bot has started.`)
  console.log(`Name: ${client.user.tag} ID: ${client.user.id}`);
  console.log(`Active in ${client.guilds.size} servers.`)
  console.log(` `)
  console.log(`Press CTRL+C to stop the bot.`)
  
  // Default activity message
  client.user.setActivity("a game.")
  
  // User activity message
  setInterval(() => {
        const index = Math.floor(Math.random() * (activities_list.length - 1) + 1);
        client.user.setActivity(activities_list[index]);
    }, 15000);
});

// Notify the console that a new server is using the bot
client.on("guildCreate", guild => {
  console.log(`Added in a new server: ${guild.name} (id: ${guild.id})`);
});

// Notify the console that a server removed the bot
client.on("guildDelete", guild => {
  console.log(`Removed from server: ${guild.name} (id: ${guild.id})`);
});

// Notify the console that the bot has disconnected
client.on('disconnect', event => {
	client.logger.error(`[DISCONNECT] ${event.code}`);
	process.exit(0);
});

// # Error Handling #

// Unhandled Rejection
process.on('unhandledRejection', (err, p) => {
  console.log(`Rejected Promise: ${p} / Rejection: ${err}`);
});
// Errors
client.on('error', err => client.logger.error(err));
// Warnings
client.on('warn', warn => client.logger.warn(warn));

client.login(auth.token);