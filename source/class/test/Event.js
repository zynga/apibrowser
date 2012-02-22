
core.Class('api.test.Event', {

	construct: function(data, target) {

		if (Object.prototype.toString.call(data) === '[object Object]') {
			this.data = data;
		} else {
			this.data = null;
		}

		this.target = target || null;

	}

});

