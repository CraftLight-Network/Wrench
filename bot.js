const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
const sqlited = require('sqlite');
const sqlite = require('sqlite');
const path = require('path');

// Open SQL connection
sqlited.open(path.join(__dirname, "settings.sqlite3")).then((db) => {
    client.setProvider(new SQLiteProvider(db));
});

// Require authentication key file
const auth = require("./auth.json");

// Create the CommandoClient
const client = new CommandoClient({
    commandPrefix: ']',
    owner: '272466470510788608',
    disableEveryone: true
});

// Register the groups
client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['fun', 'Fun'],
        ['music', 'Music'],
        ['uncategorized', 'Uncategorized'],
		['admin', 'Admin'],
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

client.login(auth.token);