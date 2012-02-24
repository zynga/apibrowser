
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
			
			if (data.hasOwnProperty("construct")) {
				
				if (data.main.type == "core.Class") {
					data.construct.init = "new " + data.main.name;
				} else {
					data.construct.init = data.main.name;
				}

				if (data.construct.params) {
					data.construct.params = this.__processParams(data.construct.params);
				}
			}

			if (data.hasOwnProperty("properties")) {
				data.properties = this.__processSection(data.properties);
			}

			if (data.hasOwnProperty("members")) {
				data.members = this.__processSection(data.members);
			}

			if (data.hasOwnProperty("statics")) {
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
				
				if (data.type == "Function") {
					data.isFunction = true;
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

