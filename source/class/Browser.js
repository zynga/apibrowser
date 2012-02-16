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

					$(document).bind('click', function(event) {

						if (event.button === 2) return;


						var target = $(event.target);
						if (target.hasClass('tree-class')) {

							that.show(target.attr('data-ns'), target.attr('data-class'));

						} else if (target.hasClass('tree-namespace')) {

							$(target).parent('li').toggleClass('unfold');

						} else if (target[0].tagName === 'H3') {
							$(target).parent('li').toggleClass('unfold');
						}

					});

					this.__initialized = true;

					if (document.location.hash.match(/!/)) {
						var hashbang = document.location.hash;
						var data = hashbang.substr(2, hashbang.length - 1).split('/');
						this.show(data[0], data[1]);
					}

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

		show: function(namespace, id) {

			var entry = this.__index[namespace + '.' + id];
			document.location.hash = '!' + namespace + '/' + id;

			if (entry === undefined) {
				entry = this.__index[namespace + '.' + id] = {};
			}

			if (
				entry.data === undefined
			) {

				var file = this.__base + '/' + namespace + '.' + id + '.json';
				this.load(file, function(status, json) {

					entry.data = this.__processor.processJSON(json);
					this.__renderTemplate(entry);

				}, this);

			} else {
				this.__renderTemplate(entry);
			}

		},

		__renderTemplate: function(entry) {


			console.log('rendering template');

			if (this.__template === undefined) {

				this.load('template.mustache', function(status, mustache) {
					this.__template = mustache;
					this.__renderTemplate(entry);
				}, this);

				return;

			}


			var template = core.template.Compiler.compile(this.__template);
			var html = template.render(entry.data);

			var content = document.getElementById('content');
			content.innerHTML = html;

		}

	}

});

