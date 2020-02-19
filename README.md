## NOTE:
This is the develop branch. Expect broken or non-functional code.

<img src="https://repository-images.githubusercontent.com/160117136/8186cd80-63b0-11e9-88f6-fa3933300bc1" width="200">

**Support Server:** [![Discord](https://discordapp.com/api/guilds/646517284453613578/embed.png?42)](https://edude42.dev/support)  
**CraftLight Network:** [![Discord](https://discordapp.com/api/guilds/525487377817534484/embed.png?18)](https://craftlight.org/discord)

# WrenchBot
## About
This bot is used mainly for the CraftLight Network.<br/>
If you would like to see this bot in action, go to the [CraftLight Network Discord server](https://craftlight.org/discord).

WrenchBot is a fun and helpful bot.  
It has per-server config, logging,  
and a bunch of helpful and fun commands!

**SUPPORT**: _For support, join [this Discord server](https://edude42.dev/support)._  
**DISCLAIMER**: _This bot logs the commands that are used for security reasons. They are not added to steal/sell information. They are added to monitor any exploits and/or bugs that come with the bot._

## Setup
Setup is mostly specific to your OS.  
This will not show you how to install Node.js, Python, and other global dependencies on your device. You must have [Node.js](https://nodejs.org/), [Python](https://www.python.org/), Build Tools _(C++, Python)_, and [Git](https://git-scm.com/).    

1. Create a bot via the [Discord Application panel](https://discordapp.com/login?redirect_to=%2Fdevelopers%2Fapplications%2F). [Invite the bot to your guild](https://discordpy.readthedocs.io/en/latest/discord.html).
1. Run `git clone https://github.com/Edude42/WrenchBot.git` in a folder of your choice.  
&nbsp;<sub>_For Debian, run `apt install gcc g++`. For Windows, run `npm install -g windows-build-tools@latest --vs2015`_</sub>  
3. Run `npm install`. This will install mostly everything the bot needs. _(Linux may need root/sudo)_
4. Rename `auth-example.json` to `auth.json` and replace all tokens with your own. _(Translator tokens are optional)_
6. Change the values in `config.json` to satisfy your wants.
7. Run `node wrenchbot.js`

## Config
Many features of the bot can be configured server-side and guild-side.  

### Server-side:
`owners`: Array of Discord user ID's. Put contributer's ID's in here. [Discord user ID]  
`prefix`: The prefix the bot uses for commands. [Any character]  

`translator.enabled`: Whether or not the translator will be enabled. [true / false]  
`translator.provider`: What provider the translator will use. [yandex / baidu / google]  
&nbsp;<sub>_Yandex is fast but mildly accurate. Baidu is slow but accurate. Google costs but is fast and accurate._</sub>  

`reactions.enabled`: Whether or not the bot will react to messages. [true / false]  
`reactions.ids.*`: ID's of the emojis the bot will react with according to the message. [Discord emoji ID]  
&nbsp;<sub>_The bot must be in the guild that the emojis are from._</sub>  

`status.enabled`: Whether or not the bot will change its status. [true / false]  
`status.timeout`: How long the bot will wait before changing its status. [Any time above 15s in ms]  
`status.statuses`: The statuses the bot will switch to.  
`status.statuses.type`: Prefix of the status. [WATCHING / PLAYING / STREAMING / LISTENING]  
`status.statuses.name`: What the status will be. [Any string]  

### Discord-side:
`join.message.enabled`: Whether or not the bot will send a message on user join. [true / false]  
`join.message.channelID`: ID of channel the welcome message will be sent to. [Discord channel ID]  
`join.message.message`: What the welcome message will be. [Any string]  
#### REST IS W.I.P.
