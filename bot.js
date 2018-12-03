const Discord = require("discord.js");

// This bot uses client.x
const client = new Discord.Client();

// Require the auth key
const config = require("./auth.json");
const prefix = require("./prefix.json");

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
  
  if(command === "ping") {
    // Simple ping command with latency
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency: ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command === "say") {
    // Simple say command 
    const sayMessage = args.join(" ");
    message.delete().catch(O_o=>{}); 
    message.channel.send(sayMessage);
  }
  
});

client.login(config.token);