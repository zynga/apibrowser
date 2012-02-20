
/**
 * This is the Base Class in the api Browser's
 * demos. It shows you how to use the {core}
 * JavaScript framework.
 */
core.Class('api.test.Base', {

	/**
	 * The constructor will use a @color {#properties.color}
	 */
	construct: function(color) {

		this.setColor(color);

	},

	properties: {

		/**
		 * This @color should be a {String}
		 */
		color: {
			type: "String",
			apply: function(value, old) {
			}
		}

	},

	members: {

		/**
		 * {Null} This method requires @data {String}
		 */
		test: function(data) {
			return null;
		}

	}

});

