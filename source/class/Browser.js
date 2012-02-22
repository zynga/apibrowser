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

		// This is mostly a cache for our callback / JSONP environment
		this.__current = {
			type: '',
			file: '',
			item: '',
			html: ''
		};

	},

	members: {

		__onLoad : function() {

			var that = this;

			$('li').live('click', function(event) {
				if (this.id) {

					var href;
					if (this.id.match(/-/)) {
						href = this.id.split(/-/)[0] + ':' + that.__current.file + '~' + this.id.split(/-/)[1];
					} else {
						href = '~' + this.id;
					}

					that.open(href);
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

				if (this.__current.file === id) {

					var open = this.__current.file;
					if (this.__current.type) {
						open = this.__current.type + ':' + open;
					}

					if (this.__current.item) {
						open += '~' + this.__current.item;
					}

					this.open(open);

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

			if (hash.charAt(0) === '~') {
				hash = this.__current.file + '~' + hash.slice(1);
			}


			this.__showTree(hash);
			this.__showContent(hash);


			location.hash = hash;


			if (hash.match(/:/)) {
				this.__current.file = hash.split(/~/)[0].split(/:/)[1];
				this.__current.type = hash.split(/:/)[0];
			} else {
				this.__current.file = hash.split(/~/)[0];
				this.__current.type = '';
			}

			this.__current.item = hash.split(/~/)[1] || '';

		},

		__showTree: function(hash) {

			var file = hash.split(/~/)[0];
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

			var data = hash.split(/~/);

			var file, item;
			if (hash.match(/:/)) {
				file = hash.split(/~/)[0].split(/:/)[1];
			} else {
				file = hash.split(/~/)[0];
			}

			item = hash.split(/~/)[1] || null;


			var cacheEntry = this.__cache[file];
			if (cacheEntry === undefined && this.__current.file !== file) {
				core.io.Script.load('data/' + file + '.jsonp');
			} else if (cacheEntry !== undefined && this.__current.html !== file){
				$('#content').html(cacheEntry);
				this.__current.html = file; // current file !== html content (initial load!)
			}


			if (item) {

				var type = null,
					element;

				if (data[0].match(/:/)) {
					type = data[0].split(/:/)[0];
				}


				// Search for specified type
				if (type !== null) {
					element = document.getElementById(type + '-' + item);
				}

				// Not found? Search for all types (first found wins)
				if (!element || !type) {

					var types = [
						'static',
						'member',
						'property',
						'event'
					];

					for (var t = 0, l = types.length; t < l; t++) {

						type = types[t];
						element = document.getElementById(type + '-' + item);

						// First found wins
						if (element) break;

					}

				}


				if (element) {
					element.className = 'open';
				} else {
					console.warn('Invalid item selected:', hash);
				}

			}

		}

	}

});

