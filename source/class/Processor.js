
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
				if (data["constructor"].params) {
					data["constructor"].params = this.__processParams(data["constructor"].params);
				}
			}

			if ("properties" in data) {
				data.properties = this.__processSection(data.properties);
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
			
			var result = new Array(Object.keys(params).length);
			
			for (var name in params) {
				var entry = params[name];
				entry.name = name;
				result[entry.position] = entry;
			}

			return result;

		}

	}

});

