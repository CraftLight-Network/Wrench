const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
const sqlited = require('sqlite');
const path = require('path');

sqlited.open(path.join(__dirname, "settings.sqlite3")).then((db) => {
    client.setProvider(new SQLiteProvider(db));
});

// Require the auth key
const auth = require("./auth.json");
const prefix = require("./prefix.json");
const owners = require("./owners.json");

const client = new CommandoClient({
    commandPrefix: ']',
    owner: '272466470510788608',
    disableEveryone: true
});

client.registry
    .registerDefaultTypes()
    .registerGroups([
        ['group1', 'Our First Command Group']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands({
		eval: false
	})
    .registerCommandsIn(path.join(__dirname, 'commands'));

const sqlite = require('sqlite');

client.on("ready", () => {
  // Startup messages
  console.log(`Bot has started.`);
  console.log(`Active in ${client.guilds.size} servers.`)
  console.log(`Enjoy your bot experience!`)
  // User activity message
  client.user.setActivity(`War never changes.`);
});

client.on("guildCreate", guild => {
  // Notify the console that a new server is using the bot
  console.log(`Added in a new server: ${guild.name} (id: ${guild.id})`);
});

client.on("guildDelete", guild => {
  // Notify the console that a server removed the bot
  console.log(`Removed from server: ${guild.name} (id: ${guild.id})`);
});

client.on("message", async message => {
  // Ignore all other bots
  if(message.author.bot) return;
  
  // Use the prefix as defined in prefix.json
  if(message.content.indexOf(prefix.prefix) !== 0) return;
  
  // Split the command and request
  const args = message.content.slice(prefix.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
});

client.login(auth.token);