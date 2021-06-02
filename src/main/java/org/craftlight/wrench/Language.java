package org.craftlight.wrench;

import org.craftlight.wrench.util.Config;

import java.util.Map;

public class Language extends Config {
    private final Map<String, String> globalPlaceholders;

    /**
     * Language configuration file manager
     * @param fileName Name of the file
     * @param resourceName Name or path to copy from
     */
    public Language(String fileName, String resourceName) {
        super(fileName, resourceName);
        Config wrenchConfig = Wrench.getInstance().config;

        // TODO: generate this dynamically
        globalPlaceholders = Map.of(
            "%bot.name", wrenchConfig.getString("bot.name"),
            "%bot.version", "1.0"
        );
    }

    public Language(String fileName) {
        this(fileName, fileName);
    }

    public String read(String key, String ...args) {
        String value = this.has(key) ? this.getString(key) : key;

        if (key.contains("%")) {
            // Replace global placeholders
            for (Map.Entry<String, String> entry : globalPlaceholders.entrySet()) {
                value = value.replace(entry.getKey(), entry.getValue());
            }

            // Iterate placeholders
            for (int i = 0; i < args.length; i++) {
                value = value.replace("%" + (i + 1), args[i]);
            }
        }

        return value;
    }
}