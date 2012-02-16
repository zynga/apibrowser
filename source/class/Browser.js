/**
 * The main class of the API Browser
 *
 * #asset(apibrowser/*)
 */
core.Class('api.Browser', {

	construct: function(base) {

		base = base || 'data';

		this.load(base + '/$index.json', function(status, data) {
			this.__base = base;
			this.init(data);
		}, this);

		this.__processor = new api.Processor({
			showPrivate: true
		});

		this.__tree = {};
		this.__index = {};


	},
	
	members: {
		
		callback: function(data, id) {
			
		},

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

			var data = null,
				that = this;

			try {
				data = JSON.parse(json);
			} catch(e) {
				throw 'Invalid JSON';
			}


			if (Object.prototype.toString.call(data) === '[object Object]') {

				this.__tree = data;

				var html = this.walk();
				document.getElementById('menu-tree').innerHTML = html;

				if (!this.__initialized) {

					$('#menu-tree').live('click', function(event) {

						var target = $(event.target);
						if (target.hasClass('tree-class')) {
							that.show(target.attr('data-ns'), target.attr('data-class'));
						} else if (target.hasClass('tree-namespace')) {
							$(target).parent('li').toggleClass('unfold');
						}

					});

					$('#content h3').live('click', function(event) {
						$(this).parent('li').toggleClass('unfold');
					});

					$('#content a').live('click', function(event) {

						var link = $(this).attr('href');

						if (link.substr(0, 1) === '#') {
							that.open(link.substr(1));
							return false;
						}

					});

					this.__initialized = true;
					this.open(document.location.hash);


				}

			} else {
				throw 'Invalid JSON data';
			}

		},

		__getHTML: function(type, what, name, namespace) {

			var html = '';

			namespace = namespace.substr(0, namespace.length - 1);

			if (type === 'folder') {
				if (what === 'start') {
					html += '<li><div class="tree-namespace" data-ns="' + namespace + '">' + name + '</div><ul>';
				} else if (what === 'end') {
					html += '</ul></li>';
				}
			} else if (type === 'file') {
				html += '<li><div class="tree-class" data-ns="' + namespace + '" data-class="' + name + '">' + name + '</div></li>';
            }


			return html;


		},

		walk: function(tree, href) {

			var that = this;

			tree = tree === undefined ? this.__tree : tree;
			href = href === undefined ? '' : href + '.';

			var html = '';

			for (var id in tree) {

				var newHref = href + id;

				var entry = tree[id];
				if (entry.type === undefined) {

					html += this.__getHTML('folder', 'start', newHref, href);
					html += this.walk(entry, newHref, html);
					html += this.__getHTML('folder', 'end', newHref, href);

				} else {

					this.__index[href + id] = entry;
					html += this.__getHTML('file', null, id, href);

				}

			}

			return html;

		},

		open: function(hash) {

			var data, params = [];

			if (hash.match(/\./)) {

				data = hash.substr(2, hash.length - 1).split('.');


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
			if (success === true) {
				document.location.hash = hash;
			}

		},

		show: function(namespace, id, method) {

			namespace = typeof namespace === 'string' ? namespace : null;
			id = typeof id === 'string' ? id : null;
			method = typeof method === 'string' ? method : null;

			if (namespace === null || id === null) {
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

			if (this.__template === undefined) {

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

