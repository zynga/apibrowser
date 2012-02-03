/**
 * The main class of the API Browser
 *
 * #asset(apibrowser/*)
 */
core.Class("api.Browser", {
	
	/**
	 * Initialize with the @base {String} URL for the data
	 */
	construct : function(base) {
		
		base = base || './data';

		core.io.Text.load(base + '/index.json', function(data) {
			console.log(data);
		}, this);
		
		
		$("#menu-tree").treeview({
			animated: "fast"
		});
		
	},
	
	
	members: {
		
		
		
		
	}
	
});
