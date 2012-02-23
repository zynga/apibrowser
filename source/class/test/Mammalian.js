
/**
 * This is a generic Interface for Mammalian Animals
 *
 * Those class of Animals have different things in
 * common - compared to other animal classes like
 * {api.test.Fish}.
 */
core.Interface('api.test.Mammalian', {

	properties: {

		/**
		 * All Mammalians have a fur!
		 */
		fur: {
			type: 'Object',
			fire: 'changeFur',
			apply: function(value, old) {
			}
		},

		/**
		 * All Mammalians have teeth!
		 */
		teeth: {
			type: 'Number',
			fire: 'looseTeeth',
			apply: function(value, old) {
			}
		},

		bones: {
			type: 'Number',
			fire: 'breakBones',
			apply: function(value, old) {
			}
		}

	}

});

