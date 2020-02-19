## NOTE:
This is the develop branch. Expect broken or non-functional code.

<img src="https://repository-images.githubusercontent.com/160117136/8186cd80-63b0-11e9-88f6-fa3933300bc1" width="200">

[![Discord](https://discordapp.com/api/guilds/525487377817534484/embed.png)](https://discord.gg/sAxRWVb)

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
This will not show you how to install Node.js, Python, and other global dependencies on your device. You must have [Node.js](https://nodejs.org/), [Python](https://www.python.org/), Build Tools _(AKA C++)_, and [Git](https://git-scm.com/).    

1. Create a bot via the [Discord Application panel](https://discordapp.com/login?redirect_to=%2Fdevelopers%2Fapplications%2F). [Invite the bot to your guild](https://discordpy.readthedocs.io/en/latest/discord.html).
1. Run `git clone https://github.com/Edude42/WrenchBot.git` in a folder of your choice.  
<sub>_For Debian, run `apt install gcc g++`. For Windows, run `npm install -g windows-build-tools@latest --vs2015`_</sub>  
3. Run `npm install`. This will install mostly everything the bot needs. _(Linux may need root/sudo)_
4. Rename `auth-example.json` to `auth.json` and replace all tokens with your own. _(Translator tokens are optional)_
6. Change the values in `config.json` to satisfy your wants.
7. Run `node wrenchbot.js`  
**That's it! The bot should be running now. Invite it to your server to use it.**

## Config
Many features of the bot can be configured server-side and guild-side.<br/>
### Server-side:
`owners:` Array of Discord user ID's. Put contributer's ID's in here.[Discord user ID]  
<sub>_Example: [ "272466470510788608", "194041725730160640", "207909015173332992" ]_</sub>  
`prefix:` The character the bot uses as the command prefix. [any ASCII character]  
`translator:` Whether or not the translator is enabled. [enabled, disabled]  
`provider:` What translator provider the bot uses. [yandex, baidu, google]  

#### Providers:
`yandex` - Fast and free, not the most accurate.<br/>
`baidu` - Slow and free, very accurate.<br/>
`google` - Fast but paid, very accurate.<br/>

### Discord-side: (none = disabled)
bot: If set, the bot can only be used in these channels. [channel name]<br/>
joinRole: Name of role a user gets upon joining. [role name]<br/>
log: Channel name to send logs to. [channel name]<br/>
leave: Channel that leave messages are sent to. [channel name]<br/>
leaveMessage: What the bot sends to the leave channel.<br/>
welcome: Channel that welcome messages are sent to. [channel name]<br/>
welcomeMessage: What the bot sends to the welcome channel.<br/><br/>
**NOTE**: _The welcome and leave channels have special formatting._
* `[Image]` at the beginning will make it an image-based message.<br/>
* `{{user}}` mentions the user<br/>
* `{{id}}` sends the ID of the user<br/>
* `{{tag}}` sends the tag of the user<br/>
* `{{name}}` sends just the name of the user<br/>
