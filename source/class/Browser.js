/**
 * The main class of the API Browser
 *
 * #asset(apibrowser/*)
 */
core.Class('api.Browser', {

	construct: function(base) {

		base = base || 'data';
		this.__base = base;

		var that = this;

		$('#content h3').live('click', function(event) {
			$(this).parent('li').toggleClass('unfold');
		});

		$('a').live('click', function(event) {

			var link = $(this).attr('href');

			if (link.substr(0, 1) == '#') {
				that.open(link.substr(1));
				return false;
			}

		});


		core.io.Script.load(base + "/$index.jsonp");

		this.__processor = new api.Processor({
			showPrivate: true
		});

		this.__index = {};

	},

	members: {

		callback: function(data, id) {

			console.debug("Successfully loaded: " + id);

			if (id == "$index") {

				$('#menu-tree').html(this.__treeWalker(data, ''));
				this.open(document.location.hash.substr(1));

			} else if (id == "$search") {



			} else {



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

			if (hash.match(/!/)) {
				hash = hash.substr(1);
			}

			var data, params = [];

			if (hash.match(/\./)) {

				data = hash.substr(1, hash.length - 1).split('.');


				params.push(data[0]); // namespace

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

			} else {
				params.push(null); // namespace
				params.push(hash); // class (id)
			}


			this.showTree.apply(this, params);

			var success = this.showContent.apply(this, params);
			if (success) {
				location.hash = hash;
			}

		},

		showTree: function(namespace, id) {

			var selector = "a[href='#" + namespace + "." + id + "']";
			var entry = $('#menu-tree').find(selector);

			console.log(entry, selector);

		},

		showContent: function(namespace, id, method) {

			namespace = typeof namespace == 'string' ? namespace : null;
			id = typeof id == 'string' ? id : null;
			method = typeof method == 'string' ? method : null;

			if (id == null) {
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

				if (namespace === null) {
					var file = this.__base + '/' + id + '.jsonp';


					core.io.Script.load(base + "/$index.jsonp");


				}
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

			if (!this.__template) {

				this.load('template.mustache', function(status, mustache) {
					this.__template = mustache;
					this.__render(entry);
				}, this);

				return;

			}


			var template = core.template.Compiler.compile(this.__template);
			var html = template.render(entry.data);

			$('#content').html(html);

		}

	}

});

