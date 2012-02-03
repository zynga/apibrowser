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
		
		location.path
		
		base = base || location.href.replace("index.html", "data");

		try{
			core.io.Text.load(base + '/index.json', function(url, errornous, data) {
				if (!errornous) {
					alert("index content: " + data.text)
				}
			}, this);
		} catch(ex) {
			console.error("Could not load index file!");
		}
		
		
		$("#menu-tree").treeview({
			animated: "fast"
		});
		
	},
	
	
	members: {
		
		
		
		
	}
	
});
