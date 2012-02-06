/**
 * The main class of the API Browser
 *
 * #asset(apibrowser/*)
 */
core.Class('api.Browser', {

	construct: function(base) {

		base = base || '../../jukebox/api/data';

		this.load(base + '/index.json', function(status, data) {
			this.__base = base;
			this.init(data);
		}, this);

		$("#menu-tree").treeview({
			animated: "fast"
		});

	},

	members: {

		load: function(url, callback, scope) {

			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);

			xhr.onreadystatechange = function() {

				if (xhr.readyState === 4) {
					callback.call(scope, xhr.status, xhr.responseText || xhr.responseXML);
				}

			};

			xhr.send(null);

		},

		init: function(json) {

			var data = null;

			try {
				data = JSON.parse(json);
			} catch(e) {
				throw 'Invalid JSON';
			}


			if (Object.prototype.toString.call(data) === '[object Object]') {
				this.__tree = data;
				this.__parse();
			} else {
				throw 'Invalid JSON data';
			}

		},

		__parse: function(tree, href) {

			if (tree === undefined) {
				tree = this.__tree;
				href = '/';
			}


			for (var id in tree) {

				var entry = tree[id];

				if (entry.type !== undefined) {

					(function(entry, href, that) {

						that.load(that.__base + href + '.json', function(status, data) {
							this.__parseClass(entry, data, href);
						}, that);

					})(entry, href + id.charAt(0).toUpperCase() + id.substr(1), this);

				} else {

					// recursion 4tw :)
					href += id+'.';
					this.__parse(entry, href);

				}

			}

		},

		__parseClass: function(treeEntry, json, href) {

			var data = null;

			try {
				data = JSON.parse(json);
			} catch(e) {
				throw 'Invalid JSON of ' + href;
			}


			if (data !== null) {
				treeEntry.data = data;
			}


		}

	}

});

