
/**
 * This Dog class lets you create a Dog that you
 * can feed, walk and just do things that you
 * are used to while playing Tamagochi :)
 *
 * This example shows how to handle a brown dog that
 * is hungry and weights 40kg (and is not naked)
 *
 * ```
 * var myDog = new api.test.Dog('brown', true, 40, false);
 * myDog.feed(new api.test.Food(5)); // 5kg, kinda American way!
 * myDog.walk(200); // lets him walk 200m
 * ```
 *
 * #version(1.0)
 * #version(1.1)
 * #awesome
 */
core.Class('api.test.Dog', {

	implement: [ api.test.Mammalian ],
	include: [ api.test.Animal ],

	/**
	 * This will create a new Dog for your Tamagochi environment.
	 *
	 * The @color {String} will set the fur color, the @hungry {Boolean}
	 * flag lets him be hungry or not (hungry is defaulted with {true}).
	 *
	 * The dog has also a @weight {Number} that you can set. It is used
	 * to calculate when it's hungry again if you walk the dog and it
	 * gets tired or an empty stomach.
	 *
	 * The last, optional flag @nakedDog {Boolean} lets you have a naked
	 * ugly dog, just like those for VIP females.
	 */
	construct: function(color, hungry, weight, nakedDog) {

		// yay, the dog can be painted, but the color
		// of the fur stays the same :)

		this.setColor(color);

		var fur = {
			color: this.getColor()
		};

		if (nakedDog) {
			fur.hair = 4;
		} else {
			fur.hair = 1e9;
		}

		this.setFur(fur);
		this.setHungry(hungry || true);

		this.setWeight(weight || false);

		// required for calculation when walking the dog :)
		this.__initialWeight = this.getWeight();

	},
	
	events: {
		foo : core.Event
	},

	properties: {

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
			init: 42, // yes, this dog is a bit older
			apply: function(value, old) {
			}
		},

		bones: {
			type: 'Number',
			fire: 'breakBones',
			init: 321, // yep, nothing broke, yet
			apply: function(value, old) {
			}
		}

	},

	members: {
		
		/** Enum about a dog being fat */
		FAT : 3,
		/** Enum about a dog being normal */
		NORMAL : 2,
		/** Enum about a dog being slim */
		SLIM : 1,
		
		/**
		 * Play with the dog using arbitrary number of @objects {Object...}.
		 * 
		 * #awesome
		 */
		play: function(objects) {
			
		},
		
		/** Train the dog. #deprecated */
		train: function() {
			
		},

		/**
		 * This method is required for firing events on the dog itself.
		 *
		 * The event @type {String}, the @value {var} and the @old {var} value.
		 */
		fireEvent: function(type, value, old) {

		},

		/**
		 * {Boolean} This method will walk the Dog @meters {Number}
		 *
		 * The dog will loose {property:#weight}, so don't
		 * let it be {property:#hungry} for a too long time.
		 */
		walk: function(meters) {

			// Nope. I'm hungry, feed me, woof!
			if (this.isHungry() === true) {
				return false;
			}

			if (this.isHungry() === false) {

				// 10m per second... fast dog, hugh?
				var work = this.getWeight() * 10 * meters;

				// 1 kcal = 4184 kJ, 7.000 kcal/kg
				var newWeight = this.getWeight() - (work / 4184 / 7000);

				// Dog is hungry now, stomach is empty
				if (newWeight <= this.__initialWeight) {
					this.setHungry(true);
				}

				this.setWeight(newWeight);

				return true;

			}

		}

	}

});

