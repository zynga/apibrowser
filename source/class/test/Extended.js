
core.Class('api.test.Extended', {

	include: [ api.test.Base ],

	construct: function(color, weight) {

		this.setColor(color);
		this.setWeight(weight);

	},

	properties: {

		weight: {
			type: 'Number',
			apply: function(value, old) {

			}
		}

	},

	members: {

		/**
		 * {Null} This method requires @data {Hashmap} that
		 * has both {#properties.weight} and/or
		 * {#properties.color} as its keys.
		 */
		testTwo: function(data) {

		}

	}

});

