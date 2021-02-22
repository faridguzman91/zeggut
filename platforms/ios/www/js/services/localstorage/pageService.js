var pageService = function () {

    this.initialize = function() {
        var deferred = $.Deferred();
       	/*window.localStorage.setItem("pages", JSON.stringify([{"id": 1, direction: "right", title: "Dit is pagina 1", description: "Dit is de tekst van 1. right <a href='#page/2' class='btn'>Volgende pagina</a>"},{"id": 2, direction: "left", title: "Dit is pagina 2", description: "Dit is de tekst van 2. left <a href='#page/3' class='btn'>Volgende pagina</a>"}]));*/
		
		var page_service_version = window.localStorage.getItem("page_service_version");
		$.getJSON("http://app.integriteit.creapolis.nl/json/page.php",{version: page_service_version}).done(function(json_data){ //?jsoncallback=?
			if(json_data['version']){
				window.localStorage.setItem("page_service_version", json_data['version']);
				window.localStorage.setItem("pages", JSON.stringify(json_data['page']));
				console.log("page_service_version = "+window.localStorage.getItem("page_service_version") + " --> " + window.localStorage.getItem("pages"));
			}
		});
		
		deferred.resolve();
		return deferred.promise();
	}

    this.findById = function (id) {
        var deferred = $.Deferred(),
            pages = JSON.parse(window.localStorage.getItem("pages")),
            page = null,
            l = pages.length;
			
        for (var i = 0; i < l; i++) {
            if (pages[i].id === id) {
                page = pages[i];
                break;
            }
        }

        deferred.resolve(page);
        return deferred.promise();
    }
	
	this.initialize();
}