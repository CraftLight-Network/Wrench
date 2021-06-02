package games.backlight.wrench.commands.staff;

import com.github.kaktushose.jda.commands.annotations.Command;
import com.github.kaktushose.jda.commands.annotations.CommandController;
import com.github.kaktushose.jda.commands.entities.CommandEvent;
import games.backlight.wrench.Language;
import games.backlight.wrench.Wrench;

@CommandController
public class ReloadCommand {
    Language lang = Wrench.getInstance().lang;

    @Command("reload")
    public void reloadCommand(CommandEvent event) {
        // Reload
        Wrench.getInstance().reload();

        // Reply
        event.reply(lang.read("commands.reload"));
    }
}
