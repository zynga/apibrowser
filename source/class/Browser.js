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

		// Load initial data
		core.io.Queue.load([
			core.io.Asset.toUri("api/reset.css"),
			core.io.Asset.toUri("api/style.css"),
			core.io.Asset.toUri("api/syntax.css"),
			"tmpl/error.js",
			"tmpl/main.js",
			"tmpl/entry.js",
			"tmpl/type.js",
			"tmpl/params.js",
			"tmpl/info.js",
			"tmpl/origin.js",

			"data/$index.js",
			"data/$search.js"
		], this.__onLoad, this);

		// Initialize data processor
		this.__processor = new api.Processor();

		this.__tmpl = {};
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

					var type, item;
					if (this.id.match(/-/)) {
						type = this.id.split(/-/)[0];
						item = this.id.split(/-/)[1];
					} else {
						item = this.id;
					}

					that.open(that.getHash(type, null, item));

				}

			});

			$('a').live('click', function(event) {

				var link = $(this).attr('href');
				if (link.charAt(0) == '#') {
					that.open(link.slice(1));
				}

				return false;

			});

			window.onhashchange = function() {
				that.open(location.hash.slice(1));
			};

			// Open initial hash
			this.open(location.hash.slice(1));

		},


		callback: function(data, id) {

			if (id.endsWith(".mustache")) {

				var templateName = id.substring(0, id.indexOf(".mustache"));
				this.__tmpl[templateName] = core.template.Compiler.compile(data.template, true);

			} else if (id == "$index") {

				this.__treeElem.innerHTML = "<ul>" + this.__treeWalker(data, "") + "</ul>";

			} else if (id == "$search") {

				this.__search = data;

			} else {

				console.debug("Loaded File: " + id);

				this.__cache[id] = this.__tmpl.main.render(this.__processor.process(data), this.__tmpl);


				if (this.__current.file === id) {
					var hash = this.getHash(this.__current.type, this.__current.file, this.__current.item);
					this.open(hash);
				}

			}

		},

		__treeWalker: function(node, base) {

			var html = '';

			var filter = function(value) {
				return value.charAt(0) != "$";
			};

			var comparator = function(a, b) {
				if (node[a].$type != node[b].$type)
				{
					if (node[a].$type == "Package") {
						return -1;
					} else if (node[b].$type == "Package") {
						return 1;
					}
				}

				return a == b ? 0 : a > b ? 1 : -1;
			};

			var keys = Object.keys(node).filter(filter).sort(comparator);

			for (var i=0, l=keys.length; i<l; i++) {

				var key = keys[i];
				var entry = node[key];
				var name = base ? base + "." + key : key;

				if (entry.$type == "Package") {

					html += '<li><a class="tree-package" href="#' + name + '">' + key + '</a><ul>' + this.__treeWalker(entry, name) + '</ul></li>';

				} else {

					// this will let showContent know that the file / class exists
					if (this.__cache[name] === undefined) {
						this.__cache[name] = null;
					}

					html += '<li><a class="tree-class" href="#' + name + '">' + key + '</a></li>';

				}

			}

			return html;

		},

		getHash: function(type, file, item) {

			type = type || null;
			file = file || null;
			item = item || null;


			var hash = '';

			// MewTwo uses confusion! ZackBoomBang!
			if (item === null || type === null) {
				type = '';
			}


			if (type) {
				hash += type + ':';
			}

			if (file) {
				hash += file;
			} else {
				hash += this.__current.file || '';
			}

			if (item) {
				hash += '~' + item;
			}

			return hash;

		},

		getHashData: function(hash) {

			var regex = new RegExp("((static|member|property|event)\:)?([A-Za-z0-9_\.]+)?(\~([A-Za-z0-9_]+))");
			var tmp = hash.split(regex);

			var data = {
				type: null,
				file: null,
				item: null
			};


			// fastest access
			if (tmp.length === 1) {

				if (tmp[0]) {
					data.file = tmp[0];
				}

				return data;
			}


			// ignore empty strings

			if (tmp[2]) {
				data.type = tmp[2];
			}

			if (tmp[3]) {
				data.file = tmp[3];
			}

			if (tmp[5]) {
				data.item = tmp[5];
			}

			return data;

		},

		open: function(hash) {

			if (hash.charAt(0) === '!') {
				hash = hash.slice(1);
			}

			var data = this.getHashData(hash);
			console.log('OPEN', data);

			this.__showTree(data);
			this.__showContent(data);


			if (
				this.__current.type !== data.type
				|| this.__current.file !== data.file
				|| this.__current.item !== data.item
			) {

				// Don't overwrite this.__current.html
				// or this.__current.file with null!
				this.__current.type = data.type;
				this.__current.file = data.file || this.__current.file;
				this.__current.item = data.item;


				location.hash = this.getHash(this.__current.type, this.__current.file, this.__current.item);

			}

		},

		__showTree: function(data) {

			if (!data.file) {
				return;
			}

			var segments = data.file.split('.');
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

		__showContent: function(data) {

			if (!data.file) {
				return;
			}

			var cacheEntry = this.__cache[data.file];
			console.log(typeof cacheEntry);


			if (cacheEntry === null) {

				core.io.Script.load('data/' + data.file + '.js');

			} else if (cacheEntry != null && this.__current.html !== data.file) {

				$('#content').html(cacheEntry);
				this.__current.html = data.file;

			} else if (cacheEntry === undefined) {

				$('#content').html(this.__tmpl.error.render({
					name: '404 - Not Found',
					description: 'The selected File "' + data.file + '" was not found.'
				}, this.__tmpl));

			}


			if (data.item) {

				var element;
				if (data.type !== null) {
					element = document.getElementById(data.type + '-' + data.item);
				}


				// Not found? Search for all types (first found wins)
				if (!element || !data.type) {

					var types = [
						'static',
						'member',
						'property',
						'event'
					];

					for (var t = 0, l = types.length; t < l; t++) {

						data.type = types[t];
						element = document.getElementById(data.type + '-' + data.item);

						// First found wins
						if (element) break;

					}

				}


				if (element) {
					element.className = 'open';
				}

			}

		}

	}

});

