package org.craftlight.wrench.commands.staff;

import com.github.kaktushose.jda.commands.annotations.Command;
import com.github.kaktushose.jda.commands.annotations.CommandController;
import com.github.kaktushose.jda.commands.entities.CommandEvent;
import org.craftlight.wrench.Language;
import org.craftlight.wrench.Wrench;

@CommandController
public class ReloadCommand {
    Language lang = Wrench.getInstance().lang;

    @Command("reload")
    public void reloadCommand(CommandEvent event) {
        Wrench.getInstance().reload();
        event.reply(lang.read("commands.reload"));
    }
}
