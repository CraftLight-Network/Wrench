package org.craftlight.wrench.util;

public class Util {
	/**
	 * Check variable equality with more than one comparison
	 * @param object Object to check equality for
	 * @param comparisons Comparisons to make
	 * @return Object is equal to one or more comparisons
	 */
	public static boolean isEqual(Object object, Object ...comparisons) {
		if (object == null) return false;

		// Get the instance for specific comparisons
		String type = object.getClass().getSimpleName();

		// Loop through each comparison
		boolean valid = false;
		for (Object comparison : comparisons) {
			if (valid) break;

			if (type.equals("String")) valid = object.equals(comparison);
			else valid = object == comparison;
		}

		return valid;
	}
}