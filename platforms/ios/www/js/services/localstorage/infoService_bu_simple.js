var InfoService = function () {
	
	var content;

    this.initialize = function() {
        var deferred = $.Deferred();
		content = [
			{id: 1, image: "img/introductie_slider/slide-1.png", title: "Welkom bij ZEGGUT", description: "Met ZEGGUT krijg je de kans om je anoniem uit te spreken over een aantal integriteitsdilemma's."},
			{id: 2, image: "img/introductie_slider/slide-2.png", title: "Dilemma's", description: "Tussen nu en 15 maart krijg je op onverwachte tijdstippen steeds drie dilemma's voorgelegd."},
			{id: 3, image: "img/introductie_slider/slide-3.png", title: "Ronde 1", description: "In Ronde 1 beoordeel je de voorgelegde dilemma's met een duimpje of een duimpje."},
			{id: 4, image: "img/introductie_slider/slide-4.png", title: "Ronde 2", description: "In Ronde 2 beoordeel je de voorgelegde dilemma's met ja of nee"},			
			{id: 5, image: "img/introductie_slider/slide-5.png", title: "Ronde 3", description: "In Ronde 3 rangschik je de voorgelegde dilemma's op volgorde van belangrijkheid"},
			{id: 6, image: "img/introductie_slider/slide-6.png", title: "Resultaat", description: "Er ontstaat uiteindelijk een Top 3 van meest knellende integriteitsdilemma's binnen de Raad van Zwijndrecht."},
			{id: 7, image: "img/introductie_slider/slide-7.png", title: "Einde", description: "Met deze Top 3 gaan we op 15 maart 2016 aan de slag."}
		];
		return content;
        //return deferred.promise(content);   	
	}
	
	this.initialize();
}