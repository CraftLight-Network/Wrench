// Define and require modules
const { stripIndents } = require("common-tags");
const options          = require("../../config");
const readline         = require("readline");
const fs               = require("fs");

// Create private folders
function createFolder(...dirs) {dirs.forEach(d => !fs.existsSync(d) && fs.mkdirSync(d))};
createFolder("./data/private", "./data/private/database", "./data/private/logs");

// Check if the auth file exists
if (!fs.existsSync("./auth.json")) {
	console.error(stripIndents`
		The file \"auth.json\" does not exist! This is required in order to login to your bot.
		Please refer to README.md for steps on how to get your token.
	`);

	process.exit(1);
}

// Console input
const input = readline.createInterface({
	"input": process.stdin,
	"output": process.stdout
});

input.on("line", i => {
	if (i === "exit") process.exit(0);
});

// Create and manage the temporary directory
function runSetInterval(run, interval) {run(); setInterval(run, interval)}
runSetInterval(() => {
	fs.rmdirSync("./data/private/tmp", { "recursive": true });
	fs.mkdirSync("./data/private/tmp");
}, options.performance.cache.clearTemp * 60 * 1000);

// Migrate from Enmap (if exists)
if (fs.existsSync("./data/private/enmap")) require("../js/config").migrateFromEnmap(/* log */);