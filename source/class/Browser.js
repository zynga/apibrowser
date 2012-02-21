/**
 *
 * #asset(api/*)
 */
core.Class('api.Browser', {

	construct: function() {

		this.__headElem = document.createElement("div");
		this.__headElem.id = "head";
		this.__headElem.innerHTML = "API Documentation";

		this.__treeElem = document.createElement("div");
		this.__treeElem.id = "tree";

		this.__contentElem = document.createElement("div");
		this.__contentElem.id = "content";

		document.body.appendChild(this.__headElem);
		document.body.appendChild(this.__treeElem);
		document.body.appendChild(this.__contentElem);

		// Load stylesheet
		core.io.StyleSheet.load(core.io.Asset.toUri("api/reset.css"));
		core.io.StyleSheet.load(core.io.Asset.toUri("api/style.css"));

		// Load initial data
		core.io.Queue.load([
			"tmpl/view.jsonp",
			"tmpl/entry.jsonp",
			"tmpl/type.jsonp",
			"data/$index.jsonp",
			"data/$search.jsonp"
		], this.__onLoad, this, false, "js");

		// Initialize data processor
		this.__processor = new api.Processor();


		this.__cache = {};
		this.__currentFile = '';
		this.__currentHTML = '';
		this.__currentMethod = '';

	},

	members: {

		__onLoad : function() {

			var that = this;

			$('li').live('click', function(event) {
				if (this.id) {
					that.open(':' + this.id);
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

			if (id == "view.tmpl") {

				console.debug("Loaded View Template");
				this.__viewTmpl = core.template.Compiler.compile(data.template);

			} else if (id == "entry.tmpl") {

				console.debug("Loaded Entry Template");
				this.__entryTmpl = core.template.Compiler.compile(data.template);
				
			} else if (id == "type.tmpl") {

				console.debug("Loaded Type Template");
				this.__typeTmpl = core.template.Compiler.compile(data.template);
					
			} else if (id == "$index") {

				console.debug("Loaded Index");

				this.__treeElem.innerHTML = "<ul>" + this.__treeWalker(data, "") + "</ul>";

					
			} else if (id == "$search") {

				console.debug("Loaded Search Index");

			} else {

				console.debug("Loaded Class: " + id);

				this.__cache[id] = this.__viewTmpl.render(this.__processor.process(data), {
					entry : this.__entryTmpl,
					type : this.__typeTmpl
				});

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
			var property = data[1] || '';


			var cacheEntry = this.__cache[file];
			if (cacheEntry === undefined && this.__currentFile !== file) {
				core.io.Script.load('data/' + file + '.jsonp');
			} else if (cacheEntry !== undefined && this.__currentHTML !== file){
				$('#content').html(cacheEntry);
				this.__currentHTML = file; // current file !== html content (initial load!)
			}


			if (property) {

				var element = document.getElementById(property);
				if (element) {
					element.className = 'open';
				}

			}

		}

	}

});

