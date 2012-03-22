/*
==================================================================================================
  API Browser - Test Classes
  Copyright 2012 Zynga Inc.
==================================================================================================
*/

/**
 * This is the generic Food class.
 *
 * It has only a weight property to let
 * animals get fat while you overfeed them :)
 *
 * ```
 * new apibrowser.test.Food(20); // will produce 20kg of food
 * ```
 *
 */
core.Class('apibrowser.test.Food', {

	/**
	 * This is just generic food in kilograms,
	 * quantity is better than quality... or so
	 *
	 * That's why you feed the animals only with
	 * food that has a given @weight {Number}.
	 */
	construct: function(weight) {
		this.setWeight(weight);
	},

	properties: {

		/**
		 * This is the food's weight in kilograms
		 */
		weight: {
			type: 'Number',
			init: 0,
			apply: function(value, old) {
			}
		}

	}

});

