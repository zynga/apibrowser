/*
==================================================================================================
  API Browser
  Copyright 2012 Zynga Inc.
==================================================================================================
*/

/**
 * The main class of the API Browser.
 *
 * #asset(apibrowser/*)
 * #require(core.io.StyleSheet)
 */
core.Class('apibrowser.Browser', {

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

		var theme = jasy.Env.getValue("theme");

		// Load initial data
		core.io.Queue.load([
			jasy.Asset.toUri("apibrowser/icon/stylesheet.css"),
			jasy.Asset.toUri("apibrowser/reset.css"),
			jasy.Asset.toUri("apibrowser/style.css"),
			jasy.Asset.toUri("apibrowser/theme/" + theme + ".css"),
			jasy.Asset.toUri("apibrowser/syntax.css"),

			"tmpl/main.js",
			"tmpl/entry.js",
			"tmpl/type.js",
			"tmpl/params.js",
			"tmpl/info.js",
			"tmpl/origin.js",
			"tmpl/tags.js",
			"tmpl/error.js",

			"data/meta-index.js",
			"data/meta-search.js"
		], this.__onLoad, this);

		this.__tmpl = {};
		this.__cache = {};

		// This is mostly a cache for our callback / JSONP environment
		this.__current = {
			type: '',
			file: '',
			item: '',
			html: '',
			hash: ''
		};

		window.apiload = this.callback.bind(this);

	},

	members: {

		__onLoad : function() {

			document.body.addEventListener('click', function(event) {

				var element = event.target;

				if (element) {

					element = core.dom.Node.closest(element, function(elem) {
						return elem.tagName == "LI" || elem.tagName == "A";
					});

					if (!element) {
						return;
					}

					if (element.tagName === 'LI') {

						if (element.id) {

							var type, item;
							if (element.id.match(/-/)) {
								type = element.id.split(/-/)[0];
								item = element.id.split(/-/)[1];
							} else {
								item = element.id;
							}

							this.open(this.buildHash(type, null, item), event.target.tagName == "LI");

						}

						event.preventDefault();

					} else if (element.tagName === 'A') {

						if (element.getAttribute('href')) {

							var href = element.getAttribute('href');
							if (href.charAt(0) === '#') {
								this.open(href.slice(1));
							} else {
								return;
							}

						}

						event.preventDefault();

					}

				}

			}.bind(this), true);


			window.addEventListener("hashchange", function() {

				var hash = location.hash.slice(1);
				if (hash !== this.__current.hash) {
					this.open(hash);
				}

			}.bind(this), true);

		},


		/**
		 * Callback method which should be used for loading JSONP-like @data {Map}. The
		 * data is identified and processed via the @id {String} given.
		 */
		callback: function(data, id) {

			if (id.endsWith(".mustache")) {

				var templateName = id.substring(0, id.indexOf(".mustache"));
				this.__tmpl[templateName] = core.template.Compiler.compile(data.template, true);

			} else if (id == "meta-index") {

				this.__treeElem.innerHTML = "<ul>" + this.__treeWalker(data, "") + "</ul>";

				// Open initial hash
				if (location.hash) {

					this.open(location.hash.slice(1));

				} else {

					for (var className in this.__cache) {
						location.hash = "#" + className;
						this.open(className);
						break;
					}

				}


			} else if (id == "meta-search") {

				this.__search = data;

			} else {

				this.__cache[id] = this.__tmpl.main.render(data, this.__tmpl);

				if (this.__current.file === id) {
					var hash = this.buildHash(this.__current.type, this.__current.file, this.__current.item);
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

				// this will let showContent know that the file / class exists
				if (this.__cache[name] == null) {
					this.__cache[name] = true;
				}

				if (entry.$content) {

					html += '<li><a class="tree-package" href="#' + name + '">' + key + '</a><ul>' + this.__treeWalker(entry, name) + '</ul></li>';

				} else {

					html += '<li><a data-type="' + entry.$type + '" class="tree-item" href="#' + name + '">' + key + '</a></li>';

				}

			}

			return html;

		},

		/**
		 * {String} Returns a hash string from the given input parameters:
		 *
		 * - @type {String?null} Type of item to link to
		 * - @file {String?current} File to open (which contains the item)
		 * - @item {String?} Item to open
		 */
		buildHash: function(type, file, item) {

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

		/**
		 * {Map} Parses the given @hash {String} and returns a map with the keys `type`, `file` and `item`.
		 */
		parseHash: function(hash) {

			var regex = new RegExp("((source|static|member|property|event)\:)?([A-Za-z0-9_\.]+)?(\~([A-Za-z0-9_]+))");
			var tmp = unescape(hash).split(regex);

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


		/**
		 * Opens the given @hash {String} with an optional hint @doToggle {Boolean?false} whether the
		 * action should lead to a toggling.
		 */
		open: function(hash, doToggle) {

			if (hash.charAt(0) === '!') {
				hash = hash.slice(1);
			}

			var data = this.parseHash(hash);

 			if (data.type === 'source') {
				return this.__showSource(data);
			}


			this.__showTree(data, doToggle);
			this.__showContent(data, doToggle);

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


				this.__current.hash = this.buildHash(this.__current.type, this.__current.file, this.__current.item);
				location.hash = this.__current.hash;

			}

		},

		__showTree: function(data) {

			if (!data.file) {
				return;
			}

			var segments = data.file.split('.');
			var current = '';


			// Don't close opened items, just un-highlight them
			var oldElements = document.querySelectorAll("#tree .active");
			for (var o = 0; o < oldElements.length; o++) {
				core.bom.ClassName.remove(oldElements[o], 'active');
			}


			for (var s = 0, l = segments.length; s < l; s++) {

				current += segments[s];

				var element = document.querySelector("#tree a[href='#" + current + "']");
				if (element != null) {

					core.bom.ClassName.add(element.parentNode, 'open');

					// Highlight the deepest (= active) item
					if (s === segments.length - 1) {
						core.bom.ClassName.add(element.parentNode, 'active');
						core.bom.ScrollInto.scrollY(element);
					}

				}

				current += '.';

			}

		},

		__showContent: function(data, doToggle) {

			if (data.file) {

				var content = document.getElementById('content'),
					cacheEntry = this.__cache[data.file];

				var fileChanged = this.__current.html !== data.file;

				if (cacheEntry == true) {

					core.io.Script.load('data/' + data.file + '.js', function(uri, error) {

						if (error === true) {

							content.innerHTML = this.__tmpl.error.render({
								name: '404 - Not Found',
								description: 'The selected file "' + data.file + '" was not found.'
							}, this.__tmpl);

							this.__current.html = data.file;

						}

					}, this);

					return;

				} else if (cacheEntry == null) {

					content.innerHTML = this.__tmpl.error.render({
						name: '404 - Not Found',
						description: 'The selected File "' + data.file + '" was not found.'
					}, this.__tmpl);

					this.__current.html = data.file;

					return;

				} else if (fileChanged) {

					content.innerHTML = cacheEntry;
					this.__current.html = data.file;

				}

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
						if (element) {
							break;
						}

					}

				}

				var oldElements = document.querySelectorAll('#content li.open');
				for (var e = 0; e < oldElements.length; e++) {
					core.bom.ClassName.remove(oldElements[e], 'active');
				}


				if (element) {

					if (doToggle) {
						core.bom.ClassName.toggle(element, 'open');
					} else {
						core.bom.ClassName.add(element, 'open');
					}

					core.bom.ClassName.add(element, 'active');
					core.bom.ScrollInto.scrollY(element, fileChanged ? "top" : null);

				}

			}

		},

		__showSource: function(data) {

			if (data.type !== 'source') {
				return false;
			}


			var url = 'data/' + data.file + '.html#line-' + data.item;
			var title = 'Source of ' + data.file;

			var newWindow = window.open(url, title, '');
			newWindow.focus();

		}

	}

});

