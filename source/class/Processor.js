
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
			
			if (data.construct) {
				
				var construct = data.construct;
				
				if (data.main.type == "core.Class") {
					construct.init = "new " + data.main.name;
				} else {
					construct.init = data.main.name;
				}

				if (construct.params) {
					construct.params = this.__processParams(construct.params);
				}
				
				if (construct.tags) {
					construct.tags = this.__processTags(construct.tags);
				}
			}
			
			if (data.main && data.main.tags) {
				data.main.tags = this.__processTags(data.main.tags);
			}


			console.debug("Data: ", data);

			return data;

		},


		__processTags: function(object) {
			
			var arr = [];
			
			for (var id in object) {
				
				var entry = {};
				var value = object[id];
				if (value instanceof Array) {
					entry.value = value.join("+");
				}
				
				entry.name = id;
				arr.push(entry);
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

