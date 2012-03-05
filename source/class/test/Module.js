/** Just a simple test module */
core.Module('api.test.Module', {

	/**
	 *
	 * {Boolean|Null} This method compares @data and @data2,
	 * if it is equals, it returns {True}. If it is not equals,
	 * it returns {False}.
	 *
	 * If any of @data or @data2 is missing, it will return {Null}.
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
	 * {Boolean|Null} This method is the opposite to {method1} and
	 * compares @data and @data2
	 *
	 * It returns {False} if it is equals and {True} if
	 * both parameters are not equals.
	 *
	 * You should also take a look at {static:api.test.Module2#method1}
	 */
	method2: function(data, data2) {

		if (data !== undefined && data2 !== undefined) {
			return !(data === data2);
		}

		return null;

	}

});

