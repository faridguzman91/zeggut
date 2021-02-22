function app_start(cmd){	
	$('body').on(click,'.history_back', function(e){
		e.preventDefault();
		onBack();
		CB(e);
		return false;
	});	
	$("#app").on('mousedown touchstart', 'input[type=range]',
		function(e){
			e.stopPropagation();
		}
	);
	$('body').on(click, '#menu_clicker',function(){
		toggleMenu();
	});
	
	/*
	$("html.mobile #app").swipe( {
		//Generic swipe handler for all directions
        swipe:function(event, direction, distance, duration, fingerCount, fingerData) {			
			var preventDefaultEvents = (direction === 'right' || direction === 'left');
			// prevent (or not) default swipe events on the fly
			$(this).swipe('option', 'preventDefaultEvents', preventDefaultEvents);			
        	if(direction == 'left'){
				hideMenu();
				CB();
			}else if(direction == 'right'){
				if(router.current() == "intro" || router.current() == "login") return;
				//if(router.current().indexOf("question")>-1){
				//	router.load('');
				//	return;
				//}
				showMenu();				
				CB();			
			}
        }
	});*/
	
	if (typeof PushNotification !== "undefined"){
		push_init();
	}
	
	app = new appData();
	app.initialize().done(function(){		
		is_intro=false;
		router.addRoute('', function(){
			if(app_options.home_next_question && (!app_options.startpage || push_cmd == 'next_question')){
				if(push_cmd == 'next_question') push_cmd='';
				current_id = parseInt(app_options.home_next_question);	
				current_template = 'question';
				//app.findById('question', current_id).done(function(page){
				app.getQuestion(current_id).done(function(page){				
					var _questionview = new questionView(page);
					slider.slidePage(_questionview.render().$el, page.direction);
					_questionview.after();
				});
			}else{
				current_template = 'home';
				app.getHome().done(function(page){
					var _homeview = new homeView(page);
					slider.slidePage(_homeview.render().$el,  ((!skip_intro)?'bottom':'right'));
					_homeview.after();
				});
			}
		});
		router.addRoute('home', function() {
			current_template = 'home';
			app.getHome().done(function(page){
				var _homeview = new homeView(page);
				slider.slidePage(_homeview.render().$el,  ((!skip_intro)?'bottom':'right'));
				_homeview.after();
			});			
		});		
		router.addRoute('loading', function() {
			slider.slidePage($('<div id="loading_view"/>').html(loadingTemplate), 'fadein');
		});		
		router.addRoute('intro', function() {	
			current_template = 'intro';			
			app.getIntro().done(function(page){		
				var _introview = new introView(page);
				slider.slidePage(_introview.render().$el, 'top');
				_introview.after();
			});		
		});		
		router.addRoute('contact', function() {			
			current_template = 'contact';			
			app.getAll('options').done(function(page){	
				var _contactview = new contactView(page);
				slider.slidePage(_contactview.render(page).$el, 'left');
				_contactview.after();
			});
		});
		router.addRoute('leaderboard', function() {			
			current_template = 'leaderboard';			
			app.getLeaderboard().done(function(page){		
				var _leaderboardview = new leaderboardView(page);
				slider.slidePage(_leaderboardview.render().$el, 'top');
				_leaderboardview.after();
			});		
		});		
		router.addRoute('page/:id', function(id) {			
			current_id = parseInt(id);			
			current_template = 'page';						
			app.getPage(current_id).done(function(page){
				slider.slidePage(new pageView(page).render().$el, page.direction);
			});
		});		
		router.addRoute('question/:id', function(id) {
			current_id = parseInt(id);	
			current_template = 'question';						
			app.getQuestion(current_id).done(function(page){
				var _questionview = new questionView(page);
				slider.slidePage(_questionview.render().$el, page.direction);
				_questionview.after();
			});
		});	
		//setTimeout(function(){
		menu_load();
		
		router.start();		
		if(!skip_intro && app_options.intro){
			router.load('intro');
		}else{
			router.load('');
		}
		loading('hide');	
		//}, 1);
	});	
}

function app_reset(){
	app_id=null;	
	window.localStorage.removeItem("app_id");	
	window.localStorage.removeItem("current_app_id");
	window.location.replace('');
}

//app_reload(0,\'home\',\'menu_app_refresh\');
function app_reload(what, goto, fa_loading_id){	
	
	var $fa_loading_id;
	if(fa_loading_id){
		$fa_loading_id='#'+fa_loading_id;
		fa_loading($fa_loading_id);
	}
	router.load('loading');
	//window.localStorage.setItem("current_app_id", 0); //Reload all data
	
	app.initialize().done(function(){
		if(what == 'next_question' && app_options.home_next_question>0){
			setTimeout(function(){
				router.load('question/'+app_options.home_next_question);
			}, 500);
		}else{
			setTimeout(function(){
				router.load('');
			},500);
		}		
		if(fa_loading_id){
			fa_loading($fa_loading_id, true);
		}
	});
}


var appData = function () {
	
	this.initialize = function() {
		
		var deferred = $.Deferred();

		var options_version = window.localStorage.getItem("options_version");
		var intro_version = window.localStorage.getItem("intro_version");
		var page_version = window.localStorage.getItem("page_version");
		var menu_version = window.localStorage.getItem("menu_version");

		//Reset when an other app is loaded!
		if(window.localStorage.getItem("current_app_id") != app_id || options_version === 0){
			options_version = 0;
			intro_version = 0;
			page_version = 0;
			menu_version = 0;
			
			window.localStorage.removeItem("options");
			window.localStorage.removeItem("intro");
			window.localStorage.removeItem("page");
			window.localStorage.removeItem("menu");									
		}
		
		window.localStorage.setItem("current_app_id", app_id);
		
		$.getJSON($siteUrl+"json/init.php",{'app_id': app_id, 'user_id': user_id, 'user_token': user_token, 'device_id': device_id, 'app_version': app_version, 'options_version': options_version, 'intro_version': intro_version, 'page_version': page_version, 'menu_version': menu_version}).done(function(data){
			
			if(data['app_version']){
				app_latest_version = data['app_version'];			
			}

			if(data['options']){
				window.localStorage.setItem("options_version", data['options_version']);
				window.localStorage.setItem("options", JSON.stringify(data['options']));
			}

			if(data['intro']){
				window.localStorage.setItem("intro_version", data['intro_version']);
				window.localStorage.setItem("intro", JSON.stringify(data['intro']));
			}
			if(data['page']){
				window.localStorage.setItem("page_version", data['page_version']);
				window.localStorage.setItem("page", JSON.stringify(data['page']));
			}
			if(data['menu']){
				window.localStorage.setItem("menu_version", data['menu_version']);
				window.localStorage.setItem("menu", JSON.stringify(data['menu']));
			}
			
			app_options = JSON.parse(window.localStorage.getItem('options'));
			
			if(app_options.load_external_css)
				$("<link>", {  href : $siteUrl+"app/external/"+app_id+"/external.css", rel : "stylesheet" }).appendTo("head");
			if(app_options.load_external_js)
				$("<script>", {  src : $siteUrl+"app/external/"+app_id+"/external.js", type : "text/javascript" }).appendTo("body");
			

			if(app_options.beacon==1 && data['beacons']){
				//window.localStorage.setItem("beacons", JSON.stringify(data['beacons']));
				app_beacons = data['beacons'];
			}
			
			deferred.resolve();
			
		}).fail(function( jqxhr, textStatus, error ) {
    		var err = textStatus + ", " + error;
			deferred.resolve();
		});
		
        return deferred.promise();
	}
	
	this.findById = function (elem, id) {
        var deferred = $.Deferred();		

		if(elem == "question"){
			$.getJSON($siteUrl+"json/update.php",{'cmd':'question', 'question_id':id, 'app_id': app_id, 'user_id': user_id, 'user_token': user_token}).done(function(data){
				if(data.error){
					app_start();
					deferred.reject( "reloading" );
				}else{
					deferred.resolve(data);
				}					
			}).fail(function(e){
				//maybe next_question_id  from questionnaire overview was invalid and updated
				//refresh data for new link
				router.load('');
				deferred.reject( "reloading" );
				// don't resolve because then question render() will fail
				//deferred.resolve();
			});				
		}else{			
			var pages = JSON.parse(window.localStorage.getItem(elem)),
            page = null,
            l = pages.length;

			for (var i = 0; i < l; i++) {
				if (pages[i].id == id) {
					 page = pages[i];
					 break;
				}
			}
			deferred.resolve(page);
		}         
        return deferred.promise();
    }
	
	this.getAll = function(elem){
		var deferred = $.Deferred(),
			pages = JSON.parse(window.localStorage.getItem(elem));
		
		deferred.resolve(pages);
		return deferred.promise();
	}
	
	this.getHome = function(){
		var deferred = $.Deferred()		
		$.getJSON($siteUrl+"json/update.php",{'cmd':'home', 'app_id': app_id, 'user_id': user_id, 'user_token': user_token}).done(function(data){		
			deferred.resolve(data);			
		}).fail(function(){			
			//deferred.resolve();
		});
		return deferred.promise();
	}
	this.getQuestion = function(id){
		var deferred = $.Deferred()		
		$.getJSON($siteUrl+"json/update.php",{'cmd':'question','question_id':id, 'app_id': app_id, 'user_id': user_id, 'user_token': user_token}).done(function(data){
			deferred.resolve(data);
		}).fail(function(){
			//deferred.resolve();
		});
		return deferred.promise();
	}
	this.getPage = function(page_id){
		var deferred = $.Deferred()		
		$.getJSON($siteUrl+"json/update.php",{'cmd':'page', 'page_id': page_id, 'app_id': app_id, 'user_id': user_id, 'user_token': user_token}).done(function(data){		
			deferred.resolve(data);			
		}).fail(function(){			
			//deferred.resolve();
		});
		return deferred.promise();
	}
	this.getLeaderboard = function(){
		var deferred = $.Deferred()		
		$.getJSON($siteUrl+"json/update.php",{'cmd':'leaderboard','app_id': app_id,'user_id': user_id, 'user_token': user_token}).done(function(data){		
			deferred.resolve(data);			
		}).fail(function(){			
			//deferred.resolve();
		});
		return deferred.promise();
	}	
	this.getIntro = function(){
		var deferred = $.Deferred()		
		$.getJSON($siteUrl+"json/update.php",{'cmd':'intro', 'app_id': app_id, 'user_id': user_id, 'user_token': user_token}).done(function(data){		
			deferred.resolve(data);			
		}).fail(function(){			
			//deferred.resolve();
		});
		return deferred.promise();
	}
	
	this.getFiltered = function (elem, filter_key, filter_value) {
		var deferred = $.Deferred(),
            pages = JSON.parse(window.localStorage.getItem(elem)),
            l = pages.length,
            pages_return = [];
        for (var i = 0; i < l; i++){			
			if (pages[i][filter_key] === filter_value) {
				pages_return.push(pages[i]);
			}
        }
        deferred.resolve(pages_return);
        return deferred.promise();
    }
	
	this.updateLocalstorage = function(elem, id, update_key, update_value){
		var deferred = $.Deferred(),
            pages = JSON.parse(window.localStorage.getItem(elem)),
            l = pages.length;
        for (var i = 0; i < l; i++){			
			if(pages[i].id == id){
				pages[i][update_key]=update_value;
				break;
			}
        }
		window.localStorage.setItem(elem, JSON.stringify(pages));
	}	
}		