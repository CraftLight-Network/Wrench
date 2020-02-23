module.exports = function(input, length) {
	return input.length > length ? input.slice(0, length - 1).trim() + "..." : input;
};