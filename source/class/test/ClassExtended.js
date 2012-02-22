
/*
 * This demo Class is also part of the test suite.
 * It contains demonstration documentation that will
 * show the featureset of the API Browser
 */
core.Class('api.test.ClassExtended', {

	implement: [ api.test.Interface ],
	include: [ api.test.Class ],

	events: {
		custom: api.test.Event
	},

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

		},

		/**
		 * This method is required for firing events
		 */
		fireEvent: function(type, value, old) {

		}

	}

});

