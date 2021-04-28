package org.craftlight.wrench.commands.utility;

import com.github.kaktushose.jda.commands.annotations.Command;
import com.github.kaktushose.jda.commands.annotations.CommandController;
import com.github.kaktushose.jda.commands.entities.CommandEvent;

@CommandController
public class CountCommand {
    @Command({"count", "characters", "chars"})
    public void countCommand(CommandEvent event, String ...message) {
        // Reply
        event.reply("There are " + String.join(" ", message).length() + " characters in your message.");
    }
}
