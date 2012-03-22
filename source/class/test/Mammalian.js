/**
 * This is a generic Interface for mammalian animals.
 *
 * Those class of Animals have different things in
 * common - compared to other animal classes like
 * {apibrowser.test.Fish}.
 */
core.Interface('apibrowser.test.Mammalian', {

	properties: {

		/**
		 * All Mammalians have a fur!
		 */
		fur: {
			type: 'Object',
			fire: 'changeFur'
		},

		/**
		 * All Mammalians have teeth!
		 */
		teeth: {
			type: 'Number',
			fire: 'looseTeeth'
		},

		/**
		 * All Mammalians have bones!
		 */
		bones: {
			type: 'Number',
			fire: 'breakBones'
		}

	}

});

