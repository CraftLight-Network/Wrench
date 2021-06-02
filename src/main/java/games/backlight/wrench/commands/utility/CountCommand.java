package games.backlight.wrench.commands.utility;

import com.github.kaktushose.jda.commands.annotations.Command;
import com.github.kaktushose.jda.commands.annotations.CommandController;
import com.github.kaktushose.jda.commands.entities.CommandEvent;
import games.backlight.wrench.Language;
import games.backlight.wrench.Wrench;

@CommandController
public class CountCommand {
    Language lang = Wrench.getInstance().lang;

    @Command({"count", "characters", "chars"})
    public void countCommand(CommandEvent event, String ...message) {
        // Join the strings
        int joined = String.join(" ", message).length();

        // Reply
        event.reply(lang.read("commands.count", joined));
    }
}
