var introService = function () {
	
	var content;

    this.initialize = function() {
        var deferred = $.Deferred();
		/*window.localStorage.setItem("pages_intro", JSON.stringify([
			{id: 1, image: "img/introductie_slider/slide-1.png", title: "Welkom bij ZEGGUT", description: "Met ZEGGUT krijg je de kans om je anoniem uit te spreken over een aantal integriteitsdilemma's."},{id: 2, image: "img/introductie_slider/slide-2.png", title: "Dilemma's", description: "Tussen nu en 15 maart krijg je op onverwachte tijdstippen steeds drie dilemma's voorgelegd."}
			]));*/

		var intro_service_version = window.localStorage.getItem("intro_service_version");
		$.getJSON("http://app.integriteit.creapolis.nl/json/intro.php",{version: intro_service_version}).done(function(json_data){ //?jsoncallback=?
			if(json_data['version']){
				window.localStorage.setItem("intro_service_version", json_data['version']);
				window.localStorage.setItem("intro_pages", JSON.stringify(json_data['page']));
				console.log("intro_service_version = "+window.localStorage.getItem("intro_service_version") + " --> " + window.localStorage.getItem("intro_pages"));				
			}
		});

		deferred.resolve();
        return deferred.promise();
	}
	
    this.getIntro = function (id) {
        var deferred = $.Deferred(),
            pages = JSON.parse(window.localStorage.getItem("intro_pages"));
        deferred.resolve(pages);
        return deferred.promise();
    }	
	
	this.initialize();
}