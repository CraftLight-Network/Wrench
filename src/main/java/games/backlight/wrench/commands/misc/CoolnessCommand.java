package games.backlight.wrench.commands.misc;

import com.github.kaktushose.jda.commands.annotations.Command;
import com.github.kaktushose.jda.commands.annotations.CommandController;
import com.github.kaktushose.jda.commands.annotations.Optional;
import com.github.kaktushose.jda.commands.entities.CommandEvent;
import games.backlight.wrench.Language;
import games.backlight.wrench.util.BotUtil;
import games.backlight.wrench.util.Util;
import net.dv8tion.jda.api.entities.Member;
import games.backlight.wrench.Wrench;

import java.util.Calendar;
import java.util.Random;

@CommandController
public class CoolnessCommand {
	Language lang = Wrench.getInstance().lang;

	@Command({"coolness", "cool"})
	public void coolnessCommand(CommandEvent event, @Optional Member member) {
		Member user = member == null ? event.getMember() : member;

		// Generate the seeded random
		Random random = BotUtil.getSeededRandom(
			user,
			Calendar.YEAR,
			Calendar.MONTH,
			Calendar.DAY_OF_MONTH,
			Calendar.HOUR
		);
		int percent = 100 - Util.biasedRandom(random, 100, 4);

		// Reply
		event.reply(lang.read("commands.coolness", percent));
	}
}
