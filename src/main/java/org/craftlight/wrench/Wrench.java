package org.craftlight.wrench;

import com.github.kaktushose.jda.commands.entities.CommandSettings;
import com.github.kaktushose.jda.commands.entities.JDACommands;
import com.github.kaktushose.jda.commands.entities.JDACommandsBuilder;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import org.craftlight.wrench.util.Config;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.security.auth.login.LoginException;

public class Wrench {
	private static final Logger logger = LoggerFactory.getLogger("BotLogger");
	private static Config config;
	private static JDA jda;

	public static Logger getLogger() {
		return logger;
	}

	public static Config getConfig() {
		return config;
	}

	public static JDA getJDA() {
		return jda;
	}

	public static void main(String[] arguments) {
		// Create the config files
		logger.debug("Creating config files...");
		config = new Config("config/config.yml", "config.yml");
		Config token = new Config("config/token.yml", "token.yml");

		// Start the JDA instance
		logger.info("Starting " + config.getString("bot.name") + "!");
		try {
			jda = JDABuilder.createLight(token.getString("token")).build();
		} catch (LoginException e) {
			logger.error("Error while starting!", e);
			System.exit(1);
		}

		// Register commands
		JDACommands commands = new JDACommandsBuilder(jda)
				.setCommandPackage("org.craftlight.wrench.commands")
				.setDefaultSettings(
					new CommandSettings(
						config.getString("bot.prefix.commands"),
						true,
						true,
						config.getBoolean("bot.prefix.mention")
					)
				)
				.build();
	}

	public static void reload() {
		logger.info("Reloading config file...");
		config.load();
	}
}
