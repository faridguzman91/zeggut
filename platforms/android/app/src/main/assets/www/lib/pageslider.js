function PageSlider(container) {

    var container = container,
        currentPage,
        stateHistory = [];
		
	
    // Use this function if you want PageSlider to automatically determine the sliding direction based on the state history
    this.slidePage = function(page, direction) {

        var l = stateHistory.length,
            state = window.location.hash;

        if (l === 0) {	//Startpagina
			if(typeof direction === 'undefined')
				direction = "right";

            stateHistory.push([state,direction]);
            this.slidePageFrom(page);
            return;
        }
		if(l == 1){ //Eerstvolgende slide na start, dan de start 'direction' return zetten
			if(typeof direction === 'undefined')
				direction = "right";
			stateHistory[0][1] = direction;
		}

        if (stateHistory[l-2] && state === stateHistory[l-2][0]){
			//this.slidePageFrom(page, "fadein");
            this.slidePageFrom(page, this.flipDirection(stateHistory[l-2][1]));
            stateHistory.pop();
        } else {
			if(typeof direction === 'undefined')
				direction = "right";			
            
			stateHistory.push([state,direction]);
            this.slidePageFrom(page, direction);
        }

    }

    this.slidePageFrom = function(page, from) {
		
		var transEndEventName = ('WebkitTransition' in document.documentElement.style) ? 'webkitTransitionEnd' : 'transitionend';

        container.append(page);

        if (!currentPage || !from) {
            page.attr("class", "page center");
            currentPage = page;
            return;
        }

        page.attr("class", "page " + from);

        // Force reflow. 
		// http://www.phpied.com/rendering-repaint-reflowrelayout-restyle/
        container[0].offsetWidth;
        page.attr("class", "page transition center");
		
        currentPage.attr("class", "page transition pageOut " + this.flipDirection(from)).on(transEndEventName, function(e) {
            $(e.target).remove();
			$('body').trigger('update'); 
        });
		
        currentPage = page;
    }	
	
	this.flipDirection = function(direction){
		if(direction=="left"){
			return "right";
		}else if(direction=="right"){
			return "left";
		}else if(direction=="top"){
			return "bottom";
		}else if(direction=="bottom"){
			return "top";
		}else if(direction=="topleft"){
			return "bottomright";
		}else if(direction=="bottomright"){
			return "topleft";
		}else if(direction=="topright"){
			return "bottomleft";
		}else if(direction=="bottomleft"){
			return "topright";
		}else if(direction=="fadein"){
			return "fadeout";	
		}else if(direction=="fadeout"){
			return "fadein";	
		}
	}	

}