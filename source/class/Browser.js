/**
 * The main class of the API Browser
 *
 * #asset(apibrowser/*)
 */
core.Class('api.Browser', {

	construct: function(base) {

		base = base || 'data';

		this.load(base + '/index.json', function(status, data) {
			this.__base = base;
			this.init(data);
		}, this);

		this.__tree = {};
		this.__index = {};


	},

	members: {

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

					$('#menu-tree').treeview({
						animated: 'fast'
					});


					$('#menu-tree').bind('click', function(data) {

						var target = data.target;
						if (target.className === 'file') {
							that.show(target.getAttribute('data-ns'), target.innerHTML);
						}

					});

					this.__initialized = true;

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
					html += '<li><span class="folder" data-ns="' + namespace + '">' + name + '</span><ul>';
				} else if (what === 'end') {
					html += '</ul></li>';
				}
			} else if (type === 'file') {
				html += '<li><span class="file" data-ns="' + namespace + '">' + name + '</span></li>';
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
			if (
				entry === undefined
				|| this.__base === undefined
			) {
				return false;
			}


			if (
				entry.data === undefined
			) {

				var file = this.__base + '/' + namespace + '.' + id + '.json';
				this.load(file, function(status, json) {

					var data = null;
					try {
						data = JSON.parse(json);
					} catch(e) {
						console.warn('Invalid JSON', file);
					}

					if (data !== null) {
						entry.data = data;
						this.__renderTemplate(entry);
					}

				}, this);

			} else {
				this.__renderTemplate(entry);
			}

//			console.log('showing', namespace, id, this.__index[namespace + '.' + id]);

		},

		__renderTemplate: function(entry) {

			console.log('rendering template now', entry);

		}

	}

});

