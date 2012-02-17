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
				
				document.getElementById('menu-tree').innerHTML = this.__treeWalker(data, "");
				this.open(location.hash);
				
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

					html += '<li><div class="tree-namespace" data-name="' + name + '">' + key + '</div><ul>' + this.__treeWalker(entry, name) + '</ul></li>';
					
				} else {

					html += '<li><div class="tree-class" data-name="' + name + '">' + key + '</div></li>';

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
			if (success) {
				location.hash = hash;
			}

		},

		show: function(namespace, id, method) {

			namespace = typeof namespace == 'string' ? namespace : null;
			id = typeof id == 'string' ? id : null;
			method = typeof method == 'string' ? method : null;

			if (namespace == null || id == null) {
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

