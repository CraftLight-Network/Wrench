# NOTE: This bot is currently under heavy development!
## Expect missing or broken features, many breaking internal changes, and lots of issues! I'm writing this from the ground-up with large goals in modularity and performance, it may take a while to finish! Check the [project board](https://github.com/CraftLight-Network/WrenchBot/projects/3) for planned and in-progress changes!

<img src="https://repository-images.githubusercontent.com/160117136/7032cb00-284a-11eb-9b50-bd521c314044" width="200px" align="right">
<div align="center">
<h1>WrenchBot</h1>
<h3>A <a href="https://discord.com">Discord</a> bot made with performance and modularity in mind. Includes many utility, fun, and moderation features that work per-guild!</h3>
<h4>(Mainly made for use in the <a href="https://craftlight.org">CraftLight Network</a>)</h4>
<br/>
</div>

<table align="center">
<tr>
<td>

### Features
- Automated moderation system with bad link detection.
- Tons of utility and fun commands to make everything easier.
- Extremely customizable per-guild and per-instance.
- Very optimized using <10% CPU and <60MB RAM.
- A ton more! Read the more in-depth features section.
</td>
<td>

![GitHub top language](https://img.shields.io/github/languages/top/CraftLight-Network/WrenchBot?style=flat-square) [![GitHub commits since latest release (by date)](https://img.shields.io/github/commits-since/CraftLight-Network/WrenchBot/latest/develop?label=Commits%20since%20release&style=flat-square)](https://github.com/CraftLight-Network/WrenchBot/releases)  

[![Codacy branch grade](https://img.shields.io/codacy/grade/f924171fe1d64ffab3efd88add8678fa/develop?style=flat-square)](https://app.codacy.com/gh/CraftLight-Network/WrenchBot) [![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/CraftLight-Network/WrenchBot?style=flat-square)](https://codeclimate.com/github/CraftLight-Network/WrenchBot)  

[![Support Discord](https://img.shields.io/discord/646517284453613578?color=7289DA&label=Support&style=flat-square)](https://discord.gg/7NQtvXm) [![CraftLight Network Discord](https://img.shields.io/discord/525487377817534484?color=7289DA&label=CraftLight%20Network&style=flat-square)](https://discord.gg/ba7WPW4)
</td>
</tr>
</table>

⚠️ **WORK IN PROGRESS**  
WrenchBot is currently being re-written from the ground up. It's missing many commands and features. But, it currently has much more in terms of backend and guild functionality. Many things will change mid-development, as such things may break. Follow the [v2 project board](https://github.com/CraftLight-Network/WrenchBot/projects/3) for updates on completion.

⌨️ **For developers:**  
Many of the modules made for specifically this bot work in other scenarios!  
This bot was made with modularity in mind, meaning many elements work elsewhere.
- TinyConfig
  - Only stores what it needs to for small file sizes.
  - Validates user input with options file to ensure security and ease-of-use.
  - Automatically migrates to newer versions for non-breaking changes.
  - Stores an infinite amount of config databases, no matter how large.
  - Easy to use with only a few amount of methods.
- TinyMigrate
  - Migrates to the latest TinyConfig version from any local version.
  - Metadata to specify changelog, versions, and breaking changes.
  - 3-step system: Parse (Convert data types, invalidate, etc.), remove, move.

## 🔧 Setup
1. Install the OS-specific build dependencies:
- [Node.js](https://nodejs.org)
- [Pyhton](https://www.python.org)
- `GCC`/`windows-build-tools`
2. Install the run dependencies via `npm i` in the bots root directory.
3. [Create](https://discord.com/developer/applications) and [invite](https://discordpy.readthedocs.io/en/latest/discord.html) the bot. (Make sure to copy the bot token in step 7!)
4. Rename `auth-example.json` to `auth.json` and place your bot token in the "`token`" element.
5. Start the bot! Run `node .` in the bots root directory.

## 🔨 All Features
**CURRENTLY W.I.P.**

## 💾 Config values
### Hosting
`owners`: Array of Discord user ids. These users can execute any command anywhere. [Discord user ID]  
`support`: The link sent when an error occurs in a command. [Invite URL]  
`prefix.commands`: The prefix the bot uses for commands. [Character]  
`prefix.tags`: The prefix used in the tag shortcut. [Character]

`status.enabled`: Whether or not the bot changes its status. [true | false]  
`status.timeout`: How long the bot waits before changing its status. [Seconds, >15]  
`status.method`: The way statuses are cycled through. [order | random | repeat]   
`status.types` → `type`: The "activity" of the bot. [LISTENING | PLAYING | STREAMING | WATCHING]  
`status.types` → `name`: The text displayed next to the type. [String]  
`status.types` → `url`: The URL to display by the status. [URL]

`performance.cache.clearTemp`: Time between cache directory clears. [Seconds]  
`performance.cache.message.maxSize`: The maximum amount of messages stored in memory. [Number]  
`performance.cache.message.lifetime`: How long messages will be stored before becoming clearable. [Number]

### Discord:
**ALSO CURRENTLY W.I.P.**

## ❔ FAQ
**ALSO CURRENTLY W.I.P.**
