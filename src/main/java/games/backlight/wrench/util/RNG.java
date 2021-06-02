package games.backlight.wrench.util;

import java.util.Random;

public class RNG extends Random {
	long seed;
	public RNG(long seed) {
		super(seed);
		this.seed = seed;
	}

	public long getSeed() {
		return this.seed;
	}

	public void setSeed(long seed) {
		super.setSeed(seed);
		this.seed = seed;
	}
}
