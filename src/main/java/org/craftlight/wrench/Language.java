package org.craftlight.wrench;

import org.craftlight.wrench.util.Config;

public class Language {
    public String BOT_STARTING;
    public String BOT_STARTED;
    public String CONFIG_RELOADING;
    public String CONFIG_RELOADED;

    public final Config language;
    private final Config config;

    /**
     * Language configuration file manager
     * @param fileName Name of the file
     * @param resourceName Name or path to copy from
     */
    public Language(String fileName, String resourceName) {
        language = new Config(fileName, resourceName);
        config = Wrench.getInstance().config;

        load();
    }

    /**
     * Language configuration file manager
     * @param filename Name or path to save to
     */
    public Language(String filename) {
        this(filename, filename);
    }

    public void load() {
        language.load();
        generate();
    }

    private void generate() {
        BOT_STARTING = language.getString("logger.bot.starting");
        BOT_STARTED = language.getString("logger.bot.started");
        CONFIG_RELOADING = language.getString("logger.config.reloading");
        CONFIG_RELOADED = language.getString("logger.config.reloaded");
    }
}