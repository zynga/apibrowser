/**
 * The main class of the API Browser
 *
 * #asset(api/*)
 */
core.Class('api.Browser', {

	construct: function(base) {
		
		// Store data path
		if (!base) {
			base = "data";
		}

		this.__base = base;
		
		// Insert HTML
		$(document.body).append('<div id="menu"><h1>API Browser</h1><ul id="menu-tree" class="filetree"></ul></div><div id="content"></div>');

		// Load initial data
		core.io.Queue.load([
			core.io.Asset.toUri("api/style.css"),
			base + "/$index.jsonp",
			base + "/$template.jsonp",
			base + "/$search.jsonp"
		], this.__onLoad, this, false, "js");
		
		// Initialize data processor
		this.__processor = new api.Processor({
			showPrivate: true
		});

		this.__index = {};

	},

	members: {
		
		__onLoad : function() {
			
			var that = this;

			$('h3').live('click', function(event) {
				$(this).parent('li').toggleClass('unfold');
			});

			$('a').live('click', function(event) {

				var link = $(this).attr('href');
				if (link.charAt(0) == '#') {
					that.open(link.slice(1));
					return false;
				}

			});
			
			// Open opener URL
			this.open(location.hash.slice(1));
			
		},
		

		callback: function(data, id) {
			
			if (id == "$index") {
				
				console.debug("Loaded Index");
				
				document.getElementById('menu-tree').innerHTML = this.__treeWalker(data, "");
				
			} else if (id == "$template") {

				console.debug("Loaded Template");
				this.__template = core.template.Compiler.compile(data.template);
				
			} else if (id == "$search") {
				
				console.debug("Loaded Search Index");
				
			} else {
				
				console.debug("Loaded Class: " + id);
				
			}

		},

		__treeWalker: function(node, base) {

			var html = '';

			var filter = function(value) {
				return value.charAt(0) != "$";
			};

			var comparator = function(a, b) {

				if (node[a].$type == node[b].$type) {

					return a > b ? 1 : -1;

				} else if (node[a].$type == "Package") {

					return -1;

				} else if (node[b].$type == "Package") {

					return 1;

				} else {

					return 0;

				}

			}

			var keys = Object.keys(node).filter(filter).sort(comparator);

			for (var i=0, l=keys.length; i<l; i++) {

				var key = keys[i];
				var entry = node[key];
				var name = base ? base + "." + key : key;

				if (entry.$type == "Package") {

					html += '<li><a class="tree-namespace" href="#' + name + '">' + key + '</a><ul>' + this.__treeWalker(entry, name) + '</ul></li>';

				} else {

					html += '<li><a class="tree-class" href="#' + name + '">' + key + '</a></li>';

				}

			}

			return html;

		},

		open: function(hash) {
			
			console.debug("Open: " + hash);

			if (hash.match(/!/)) {
				hash = hash.substr(1);
			}

			var data, params = [];

			if (hash.match(/\./)) {

				data = hash.substr(1, hash.length - 1).split('.');


				// namespace
				params.push(data[0]);

				if (data[1].match(/:/)) {
					data = data[1].split(/:/);
					params.push(data[0]); // class (id)
					params.push(data[1]); // method
				} else {
					params.push(data[1]); // class (id)
				}


			} else if (hash.match(/:/)) {

				params.push(this.__current.namespace);
				params.push(this.__current.id);
				params.push(hash.substr(1));

				hash = this.__current.namespace + '.' + this.__current.id + ':' + hash.substr(1);

			}

			var success = this.show.apply(this, params);
			if (success) {
				location.hash = hash;
			}

		},

		show: function(namespace, id, method) {

			namespace = typeof namespace == 'string' ? namespace : null;
			id = typeof id == 'string' ? id : null;
			method = typeof method == 'string' ? method : null;

			if (namespace == null || id == null) {
				return false;
			}

			var entry = this.__index[namespace + '.' + id];

			if (entry === undefined) {
				entry = this.__index[namespace + '.' + id] = {
					namespace: namespace,
					id: id
				};
			}


			if (
				entry.data === undefined
			) {

				var file = this.__base + '/' + namespace + '.' + id + '.json';
				this.load(file, function(status, json) {

					entry.data = this.__processor.processJSON(json);
					this.__current = entry;
					this.__render(entry);

				}, this);

			} else {
				this.__current = entry;
				this.__render(entry);
			}


			return true;

		},

		__render: function(entry) {

			var html = this.__template.render(entry.data);

			$('#content').html(html);

		}

	}

});

