
/**
 * This is the Base Class in the api Browser's
 * demos. It shows you how to use the {core}
 * JavaScript framework.
 */
core.Class('api.test.Class', {

	/**
	 * The constructor will use a @color {#properties.color}
	 */
	construct: function(color) {

		this.setColor(color);

	},

	properties: {

		/**
		 * This @color {String} can either contain
		 * a hexadecimal value or a color name
		 */
		color: {
			type: 'String',
			fire: 'changeColor',
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

