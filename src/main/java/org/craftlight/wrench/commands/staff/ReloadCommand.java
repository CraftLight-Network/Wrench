package org.craftlight.wrench.commands.staff;

import com.github.kaktushose.jda.commands.annotations.Command;
import com.github.kaktushose.jda.commands.annotations.CommandController;
import com.github.kaktushose.jda.commands.entities.CommandEvent;
import org.craftlight.wrench.Wrench;

@CommandController
public class ReloadCommand {
    @Command("reload")
    public void reloadCommand(CommandEvent event) {
        Wrench.reload();
        event.reply("Reloaded!");
    }
}
