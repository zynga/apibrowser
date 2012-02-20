/**
 *
 * #asset(api/*)
 */
core.Class('api.Browser', {

	construct: function(base) {

		// Store data path
		base = base || 'data';

		this.__base = base;

		core.io.Script.load(base + "/$index.jsonp");

		this.__treeElem = document.createElement("ul");
		this.__treeElem.id = "tree";

		this.__contentElem = document.createElement("div");
		this.__contentElem.id = "content";

		document.body.appendChild(this.__treeElem);
		document.body.appendChild(this.__contentElem);

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
		this.__currentHTML = '';
		this.__currentMethod = '';

	},

	members: {

		__onLoad : function() {

			var that = this;

			$('h3').live('click', function(event) {
				var item = $(this).parent('li');
				if (item.attr('data-hash')) {
					that.open(item.attr('data-hash'));
				}
			});

			$('a').live('click', function(event) {

				var link = $(this).attr('href');
				if (link.charAt(0) == '#') {
					that.open(link.slice(1));
					return false;
				}

			});

			window.onhashchange = function() {
				that.open(location.hash.slice(1));
			};

			// Open initial hash
			this.open(location.hash.slice(1));

		},


		callback: function(data, id) {

			if (id == "$index") {

				console.debug("Loaded Index");

				this.__treeElem.innerHTML = this.__treeWalker(data, "");

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

					html += '<li><a class="tree-package" href="#' + name + '">' + key + '</a><ul>' + this.__treeWalker(entry, name) + '</ul></li>';

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

				var element = document.querySelector("#tree a[href='#" + current + "']");
				if (element != null) {
					element.parentNode.className = ' open';
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

			} else if (this.__currentHTML !== file){
				$('#content').html(cacheEntry);
				this.__currentHTML = file; // current file !== html content (initial load!)
			}


			if (method) {
				// TODO: scroll and highlight method
				$('#content').find("li[data-hash='\\:" + method + "']").addClass('open');
			}

		}

	}

});

