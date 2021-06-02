package org.craftlight.wrench.commands.utility;

import com.github.kaktushose.jda.commands.annotations.Command;
import com.github.kaktushose.jda.commands.annotations.CommandController;
import com.github.kaktushose.jda.commands.entities.CommandEvent;
import org.craftlight.wrench.Language;
import org.craftlight.wrench.Wrench;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.SplittableRandom;

@CommandController
public class RandomCommand {
    Language lang = Wrench.getInstance().lang;

    @Command("random")
    public void randomCommand(CommandEvent event, BigDecimal min, BigDecimal max) {
        // Find the max decimal count
        int decimals = Math.max(min.scale(), max.scale());

        // Generate the random number
        SplittableRandom random = new SplittableRandom();
        BigDecimal number = min.add(BigDecimal.valueOf(random.nextDouble()).multiply(max.subtract(min)));
        BigDecimal scaled = number.setScale(decimals, RoundingMode.HALF_UP);

        // Reply
        event.reply(lang.read("commands.random", String.valueOf(scaled)));
    }
}
