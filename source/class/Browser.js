/**
 * The main class of the API Browser
 *
 * #asset(api/*)
 */
core.Class('api.Browser', {

	construct: function(base) {

		// Store data path
		base = base || 'data';

		this.__base = base;

		core.io.Script.load(base + "/$index.jsonp");


		// Insert HTML
		$(document.body).append('<div id="menu"><h1>API Browser</h1><ul id="menu-tree" class="filetree"></ul></div><div id="content"></div>');

		// Load stylesheet
		core.io.StyleSheet.load(core.io.Asset.toUri("api/style.css"));

		// Load initial data
		core.io.Queue.load([
			base + "/$view.jsonp",
			base + "/$index.jsonp",
			base + "/$search.jsonp"
		], this.__onLoad, this, false, "js");

		// Initialize data processor
		this.__processor = new api.Processor({
			showPrivate: true
		});


		this.__cache = {};
		this.__currentFile = '';
		this.__currentMethod = '';

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

			} else if (id == "$view") {

				console.debug("Loaded View");
				this.__template = core.template.Compiler.compile(data.template);

			} else if (id == "$search") {

				console.debug("Loaded Search Index");

			} else {

				console.debug("Loaded Class: " + id);

				this.__cache[id] = this.__template.render(this.__processor.process(data));

				if (this.__currentFile === id) {
					var toOpen = this.__currentFile;
					if (this.__currentMethod) {
						toOpen += ':' + this.__currentMethod;
					}
					this.open(toOpen);
				}

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

			if (hash.charAt(0) === '!') {
				hash = hash.slice(1);
			}

			if (hash.charAt(0) === ':') {
				hash = this.__currentFile + ':' + hash.slice(1);
			}


			this.__showTree(hash);
			this.__showContent(hash);


			location.hash = hash;
			this.__currentFile = hash.split(/:/)[0];
			this.__currentMethod = hash.split(/:/)[1] || '';

		},

		__showTree: function(hash) {

			var file = hash.split(/:/)[0];
			var segments = file.split('.');
			var current = '';

			for (var s = 0, l = segments.length; s < l; s++) {

				current += segments[s];

				var element = document.querySelector("#menu-tree a[href='#" + current + "']");
				if (element != null) {
					element.parentNode.className = ' unfold';
					element.scrollIntoView();
				}

				current += '.';

			}

		},

		__showContent: function(hash) {

			var data = hash.split(/:/);
			var file = data[0];
			var method = data[1] || '';


			var cacheEntry = this.__cache[file];

			if (cacheEntry === undefined && this.__currentFile !== file) {

				core.io.Script.load(this.__base + '/' + file + '.jsonp');

			} else {
				$('#content').html(cacheEntry);
			}


			if (method) {
				// TODO: scroll and highlight method
			}

		}

	}

});

