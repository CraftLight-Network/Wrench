package org.craftlight.wrench.commands.utility;

import com.github.kaktushose.jda.commands.annotations.Command;
import com.github.kaktushose.jda.commands.annotations.CommandController;
import com.github.kaktushose.jda.commands.entities.CommandEvent;
import org.craftlight.wrench.Language;
import org.craftlight.wrench.Wrench;

@CommandController
public class CountCommand {
    Language lang = Wrench.getInstance().lang;

    @Command({"count", "characters", "chars"})
    public void countCommand(CommandEvent event, String ...message) {
        int joined = String.join(" ", message).length();

        // Reply
        event.reply(lang.read("commands.count", String.valueOf(joined)));
    }
}
