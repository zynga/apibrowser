/** 
 * Creates a regular expression object for matching text with a @pattern {String} and optional @flags {String}. 
 * 
 * #main
 */
core.Main.declareNamespace("RegExp", function(pattern, flags) {});

core.Main.addMembers("RegExp", 
{
	/** {=Boolean} Whether to test the regular expression against all possible matches in a string, or only against the first. */
	global: null,
	
	/** {=Boolean} Whether to ignore case while attempting a match in a string. */
	ignoreCase: null,

	/** {=Integer} The index at which to start the next match. */
	lastIndex: null,

	/** {=Boolean} Whether or not to search in strings across multiple lines. */
	multiline: null,

	/** {=String} The text of the pattern. */
	source: null,
	
	/** {Object} Executes a search for a match in its @string {String} parameter. */
	exec: function(string) {},

	/** {Boolean} Tests for a match in its @string {String} parameter. */
	test: function(string) {},

	/** {Map} Returns an object literal representing the specified object; you can use this value to create a new object. */
	toSource: function() {},

	/** {String} Returns a string representing the specified object. */
	toString: function() {}
});
