
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

		processJSON: function(json) {

			var data = null;
			try {
				data = JSON.parse(json)
			} catch (e) {
				throw 'Invalid JSON';
			}


			data['constructor'].params = this.processParams(data['constructor'].params);


			var exportData = {
				id: data.id,
				'constructor': data['constructor']
			};


			var i, l;

			if (data.members !== undefined) {
				exportData.members = this.processMethods(data.members);
			}

			if (data.statics !== undefined) {
				exportData.statics = this.processMethods(data.statics);
			}

			return exportData;

		},

		processDoc: function(html) {

			console.log('Processing Doc String', html);

			return html;

		},

		processMethods: function(object) {

			var arr = [];

			for (var id in object) {

				var data = object[id];
				data.name = id;

				if (data.params !== undefined) {
					data.params = this.processParams(data.params);
				}

				if (data.doc !== undefined) {
					data.doc = this.processDoc(data.doc);
				}

				arr.push(data);

			}

			return arr;

		},

		processParams: function(params) {

			var arr = [],
				id;

			for (id in params) {
				arr.push({});
			}

			for (id in params) {

				var pos = params[id].position;

				if (pos !== undefined) {

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

