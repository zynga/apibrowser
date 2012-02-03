
this.api = {};


api.Browser = function(base) {

	base = base || 'apidoc/';

	core.io.Asset.load(base + '/index.json', function(data) {
		console.log(data);
	}, this);

};



api.Browser.prototype = {

	init: function(index) {

	}

};

