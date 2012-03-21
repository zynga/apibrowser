
/**
 * This is the Base Class in the api Browser's
 * demos. It shows you how to use the {core}
 * JavaScript framework.
 */
core.Class('apibrowser.test.Animal', {

	properties: {

		/**
		 * This will set the color of the animal
		 */
		color: {
			type: 'String',
			fire: 'changeColor',
			apply: function(value, old) {
			}
		},

		/**
		 * This is the holder for the hungry state of the animal
		 */
		hungry: {
			type: 'Boolean',
			init: true,
			fire: 'changeHungry',
			apply: function(value, old) {
			}
		},

		/**
		 * This represents the weight in kilograms of the animal
		 */
		weight: {
			type: 'Number',
			fire: 'changeWeight',
			apply: function(value, old) {
			}
		}

	},

	members: {

		/**
		 * {Boolean} This method returns whether the animal is hungry or not.
		 */
		isHungry: function() {
			return this.getHungry();
		},


		/**
		 * {Boolean} This method feeds the animal with @food {apibrowser.test.Food}.
		 * Remember to not overfeed your animal, because it gains {property:#weight}
		 * everytime you feed it.
		 */
		feed: function(food) {

			if (food instanceof apibrowser.test.Food) {

				var newWeight = this.getWeight() + food.getWeight();
				this.setWeight(newWeight);
				this.setHungry(false);

				return true;

			}


			return false;

		}

	}

});

