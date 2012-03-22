/*
==================================================================================================
  API Browser - Test Classes
  Copyright 2012 Zynga Inc.
==================================================================================================
*/

/** Just a simple test module. */
core.Module('apibrowser.test.Module', {

	/**
	 *
	 * {Boolean|null} This method compares @data and @data2,
	 * if it is equals, it returns `true`. If it is not equals,
	 * it returns `false`.
	 *
	 * If any of @data or @data2 is missing, it will return `null`.
	 *
	 * Hint: The opposite of {#method1} is {#method2}.
	 *
	 */
	method1: function(data, data2) {

		if (data !== undefined && data2 !== undefined) {
			return !!(data === data2);
		}

		return null;

	},

	/**
	 * {Boolean|null} This method is the opposite to {#method1} and
	 * compares @data and @data2
	 *
	 * It returns `false` if it is equals and `true` if
	 * both parameters are not equals.
	 */
	method2: function(data, data2) {

		if (data !== undefined && data2 !== undefined) {
			return !(data === data2);
		}

		return null;

	}

});

