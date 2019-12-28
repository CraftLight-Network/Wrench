# This is the development branch. EXPECT BROKEN THINGS! PLEASE USE MASTER IF YOU WANT LATEST CODE!

<img src="https://repository-images.githubusercontent.com/160117136/8186cd80-63b0-11e9-88f6-fa3933300bc1" width="200">

[![Discord](https://discordapp.com/api/guilds/525487377817534484/embed.png)](https://discord.gg/sAxRWVb)

# WrenchBot
## About
This bot is used mainly for the CustomCraft Network.<br/>
If you would like to see this bot in action, go to [the CustomCraft Discord server](https://discord.gg/sAxRWVb).<br/><br/>

WrenchBot is an advanced bot.<br/>
It has per-server config, logging,<br/>
and a ton of helpful and fun commands.

**NOTE**: _For support, join [this Discord server](https://edude42.dev/support)._<br/>
**DISCLAIMER**: _This bot logs the commands that are used for security reasons. They are not added to steal/sell information. They are added to monitor any exploits and/or bugs that come with the bot._<br/>

## Setup
Setup is mostly specific to your OS.<br/>
This will not show you how to install Node.js and such on your device. You must have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/).<br/><br/>

1. Run `git clone https://github.com/Edude42/WrenchBot.git` in a folder of your choice.
2. You can run one of the start scripts (And stop following this guide), or continue the setup guide.<br/>
**NOTE**: _For Linux, get `gcc` and `g++`. For Windows, run `npm install --global windows-build-tools@latest --vs2015`_<br/>
3. Run `npm install`. This may take a while, but it'll build everything the bot needs. Make sure to use sudo/admin rights.<br/>
4. Rename `auth.json.EXAMPLE` to `auth.json`
5. Copy your Discord bot token, Yandex.Translate key (Optional), and Google API key (Optional)
6. Change the values in `config.json` as you want.
7. Run `node bot.js`<br/>
**That's it! The bot should be running now. Invite it to your server to use it.**

## Config
The bot has a lot of config. Here you'll find server-side and Discord-side values.<br/>
### Server-side:
`owners:` Array of Discord user ID's. Put your ID in here. [Discord user ID]<br/>
`prefix:` The character the bot uses as the command prefix. [any ASCII character]<br/>
`translator:` Whether or not the translator is enabled. [enabled, disabled]<br/>
`provider:` What translator provider the bot uses. [yandex, baidu, google]<br/>

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
