
/*
 * This demo Class is also part of the test suite.
 * It contains demonstration documentation that will
 * show the featureset of the API Browser
 */
core.Class('api.test.ClassExtended', {

	include: [ api.test.Class ],

	construct: function(color, weight) {

		this.setColor(color);
		this.setWeight(weight);

	},

	properties: {

		/*
		 * This is the @weight {Number} in kilograms.
		 */
		weight: {
			type: 'Number',
			apply: function(value, old) {

			}
		}

	},

	members: {

		/**
		 * {Null} This method requires @data {Hashmap} that
		 * has both {property:#weight} and/or
		 * {property:#color} as its keys.
		 */
		testTwo: function(data) {

		}

	}

});

