package games.backlight.wrench.util;

import net.dv8tion.jda.api.entities.Member;

import java.util.Random;

public class BotUtil extends Util {
	/**
	 * Generates a seeded random with member ID
	 * @param member Member to generate seed for
	 * @param methods Calendar methods to use
	 * @return Seeded random generator
	 */
	public static Random getSeededRandom(Member member, int ...methods) {
		RNG rng = getSeededRandom(methods);
		long seed = rng.getSeed();

		// Make the random instance
		return new Random(member.getIdLong() + seed);
	}
}
