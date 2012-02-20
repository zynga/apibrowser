
core.Class("api.Processor", {

	construct: function(settings) {

		this.settings = {};
		for (var d in this.defaults) {
			this.settings[d] = this.defaults[d];
		}

		for (var s in settings) {
			this.settings[s] = settings[s];
		}

	},

	members: {

		process: function(data) {

			if ("constructor" in data) {
				data["constructor"].params = this.__processParams(data["constructor"].params);
			}

			if ("members" in data) {
				data.members = this.__processSection(data.members);
			}

			if ("statics" in data) {
				data.statics = this.__processSection(data.statics);
			}
			
			console.debug("Data: ", data);

			return data;

		},
		

		__processSection: function(object) {

			var arr = [];

			for (var id in object) {

				var data = object[id];
				data.name = id;

				if (data.params != null) {
					data.params = this.__processParams(data.params);
				}

				arr.push(data);

			}

			return arr;

		},


		__processParams: function(params) {

			var arr = [],
				id;

			for (id in params) {
				arr.push({});
			}

			for (id in params) {

				var pos = params[id].position;

				if (pos != null) {

					var data = params[id];
					data.name = id;
					if (data.type instanceof Array) {
						data.type = data.type.join(' | ');
					} else {
						data.type = 'undefined';
					}
					arr[pos] = data;

				}

			}


			return arr;

		}

	}

});

