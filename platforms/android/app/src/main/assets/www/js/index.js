/* ---------------------------------- Global Variables ---------------------------------- */
var app;

var app_latest_version, //overruled in app.js 
	app_version = 180;
var app_version_display = 'v1.8.0';
var app_options;
var app_beacons;
var app_in_background=false;
var animationEndEventName = ('WebkitAnimation' in document.documentElement.style) ? 'webkitAnimationEnd' : 'animationend';
var slider;
var skip_intro = null;
var skip_intro_val = 1;
var $siteUrl = "https://app.zeggut.nl/";
var app_id,
	user_id,
	user_test,
	user_token,
	device_id,
	device_model,
	device_platform,
	device_version = null;
var current_id = 0;
var current_template = null;
var is_browser = null;
var mobiledetect;
var menuTemplate = null;
var loadingTemplate = null;
var push_cmd = null;

var click = 'click';

$(function(){

  	if(typeof(window.ontouchstart) !== 'undefined'){
		click = 'touchstart';
  	}
	
	NProgress.configure({ showSpinner: false });
	$(document).ajaxStart(function() {
		NProgress.start();
	});
	$(document).ajaxStop(function() {
		NProgress.done();
	});
	
	FastClick.attach(document.body);
	
	menuTemplate = Handlebars.compile($("#menu_tpl").html());
	loadingTemplate = Handlebars.compile($("#loading_tpl").html());	

	Handlebars.registerPartial('questions', Handlebars.compile($("#questions_tpl").html()));
	loginView.prototype.template = Handlebars.compile($("#login_tpl").html());
	introView.prototype.template = Handlebars.compile($("#intro_tpl").html());
	leaderboardView.prototype.template = Handlebars.compile($("#leaderboard_tpl").html());
	questionView.prototype.template = Handlebars.compile($("#question_tpl").html());
	pageView.prototype.template = Handlebars.compile($("#page_tpl").html());
	homeView.prototype.template = Handlebars.compile($("#home_tpl").html());
	contactView.prototype.template = Handlebars.compile($("#contact_tpl").html());
	
	document.addEventListener("deviceready", onDeviceReady, false);	
	
	/**** View direct in browser with iframe */ 
	if(parent.show_app_in_browser){		
		$('html').addClass('is_browser');
		is_browser=true; //Always a browser when viewing this way!
		onDeviceReady();
	}	
	$(document).on(click, 'a[target="_system"], a[target="_blank"]',function(e){
		e.preventDefault();
		var url = this.href;
		if(!is_browser){
			window.open(url,"_system");
		}else{
			window.open(url,"_blank");				
		}
	});	
});


/* ---------------------------------- Local Functions ---------------------------------- */
function onDeviceReady(){
	
	document.addEventListener("resume", onAppToForeground, false);
	document.addEventListener("pause", onAppToBackground, false);
	document.addEventListener("backbutton", onBack, false);
	
	//To clear the badge number automatically if the user taps the app icon		
	cordova.plugins.notification.badge.configure({ autoClear: true });	
	cordova.plugins.notification.badge.clear();

	mobiledetect = new MobileDetect(window.navigator.userAgent);
	if (typeof InAppBrowser !== "undefined"){
		window.open = cordova.InAppBrowser.open;
	}
	
	var is_mobile = mobiledetect.mobile();		
	if(is_mobile != null && is_mobile != ''){
		$('html').addClass('mobile');			
	}		
	
	
	$('body').trigger('update');	
	slider = new PageSlider($('#app'));	
	
	skip_intro = (window.localStorage.getItem('skip_intro') == skip_intro_val);
	app_id = (window.localStorage.getItem('app_id')>0)?parseInt(window.localStorage.getItem('app_id')):null;
	
	if(parent.user_test){
		user_id = parent.user_id;
		user_token = parent.user_token;
	}else{
		user_id = (window.localStorage.getItem('user_id')>0)?parseInt(window.localStorage.getItem('user_id')):null;
		user_token = (window.localStorage.getItem('user_token'))?window.localStorage.getItem('user_token'):null;
	}
	
	/*
	if(navigator.userAgent.toLowerCase().match('chrome')) {
		user_id=744;
		user_token='FZXFZxzeDmRw2N4';
		app_id=10;
		window.localStorage.setItem('app_id', app_id);
		window.localStorage.setItem('user_id', user_id);
		window.localStorage.setItem('user_token', user_token);
	}
	*/	
	alert_notification();	
	device_properties().done(function(){	
		if(is_ios()){
			$('body').addClass('ios');
			//StatusBar.overlaysWebView(false);
			//StatusBar.hide();
		}
		
		var is_tablet = mobiledetect.tablet();		
		if(is_tablet != 'UnknownTablet' && is_tablet != null && is_tablet != ''){
			$('html').addClass('tablet');			
		}
		
		//go.zeggut.nl/code
		if(parent.app_code && parent.app_id){

			$.ajax({
				type: "POST",
				url: $siteUrl+"json/login.php",
				data: {'cmd':'code', 'code': parent.app_code, 'user_id': user_id, 'user_token': user_token, 'app_version': app_version, 'device_id': device_id, 'device_model':device_model,'device_platform': device_platform,'device_version': device_version, 'is_browser': is_browser},		
				dataType: "json",
				success: function(response){		
					if(response.app_id == parent.app_id){
						
						app_id = parseInt(response.app_id);
						user_id = parseInt(response.user_id);
						user_token = response.user_token;
		
						window.localStorage.setItem('app_id', app_id);
						
						if(!parent.user_test){
							window.localStorage.setItem('user_id', user_id);
							window.localStorage.setItem('user_token', user_token);						
						}
						
						setTimeout(function(){
							app_start();
						}, 500);	
					}
				}
			});	
			
		}else{		
		
			loginView.prototype.template = Handlebars.compile($("#login_tpl").html());			
			router.addRoute('login', function(){
				var _loginview = new loginView();
				slider.slidePage(_loginview.render().$el, 'top');
				_loginview.after();
			});
	
			if(!app_id || !user_id || !user_token){
				router.start();
				router.load('login');
				loading('hide');
			}else{
				app_start();
			}
		}
	});	
}

function onAppToForeground(){
	//router.load(router.current);
	app_in_background = false;	
	cordova.plugins.notification.badge.clear();
}

function onAppToBackground(){
	app_in_background = true;
	cordova.plugins.notification.badge.clear();
}

function menu_load(){
	app.getAll('menu').done(function(page){
		$('#menu ul').empty().append(menuTemplate(page));
	});
	
	$('#menu footer').html(app_version_display);
}

function menu_button(){
	toggleMenu();
}

function alert_notification(){
	if (navigator.notification) { // Override default HTML alert with native dialog
		window.alert = function (message) {
			navigator.notification.alert(
				message,    // message
				null,       // callback
				"Zeggut", // title
				'OK'        // buttonName
			);
		};
	}
}

function onBack(){
	
	if(	$('body.menu-visible').length>0){
		hideMenu();
	}else if(router.current() == "login"){//login/code
		app_id=null;    
		navigator.app.exitApp();	
	}else if(router.current() == ""){//homepage
		app_id=null;    
		navigator.app.exitApp();
	}else if(router.current().indexOf('question')>-1){//question back to homepage
		router.load('');
	}else{
		window.history.go(-1);
		//navigator.app.backHistory();
	}
}

var fa_loading_cur = null;
function fa_loading(elem, cur){
	if(cur)
		$(elem).html(fa_loading_cur);		
	else{
		fa_loading_cur = $(elem).html();
		$(elem).html('<i class="fa fa-spinner fa-pulse btn-round-load"></i>');	
	}
}

function loading($do){
	if($do == 'show'){
		$('#loading_wrapper').attr('class', 'animated zoomInUp');
	}else if($do == 'hide'){
		setTimeout(function(){
			$('#loading_wrapper > .animated').removeClass('animated');
			$('#loading_wrapper .loading_image').removeClass('fa-spin');
			$('#loading_wrapper').attr('class', 'animated zoomOut').one(animationEndEventName, function(e) {
				$('#loading').remove();
				$('#app').addClass('zoomIn');
			});
		},250);
	}else if($do == 'stop_anim'){
		$('#loading_wrapper').attr('class','');
	}
}

var get_uuid = function() {
    var deferred = $.Deferred();
	
	if (typeof window.plugins.uniqueDeviceID === "undefined"){
		deferred.resolve('uniqueUnknownDeviceID');
	}else{
	    window.plugins.uniqueDeviceID.get(deferred.resolve, deferred.reject);
	}
	return deferred.promise();
}

function device_properties(){
		
	var deferred = $.Deferred();
	if (is_browser || typeof device === "undefined"){
		
		/*if(!window.localStorage.getItem("device_id")){
			device_id = Math.random().toString().slice(2, 18);
			window.localStorage.setItem("device_id", device_id);		
		}else{
			device_id = window.localStorage.getItem("device_id");
		}	
		*/

		device_model = "browser";
		device_platform = navigator.userAgent;
		device_version = navigator.appVersion;
		deferred.resolve();	
		
	}else{
		
		get_uuid().done(function(uuid) {
			//uniqueDeviceID_succes
			//device_id = device.uuid;
			device_id = uuid;
			device_model = device.model;
			device_platform = device.platform;
			device_version = device.version;	
			deferred.resolve();
		});
	}
    return deferred.promise();
}

function is_ios(){
	return (device_platform.toLowerCase() == 'ios' && parseFloat(device_version) >= 7.0);
}

function app_answer_reset(){
	$.ajax({
		type: "POST",
		url: $siteUrl+"json/update.php",
		data:{cmd: 'answer_reset', 'app_id': app_id, 'user_id': user_id, 'user_token': user_token},
		dataType: "json",
		success: function(response){
			$('#leaderboard_score > .leaderboard_score').html('');
			app_reload();
		},
		error: function(e) {
			alert('Er was een probleem tijdens het resetten. Probeer opnieuw.');
		}
	});
	return false;				
}

var leaderboard_score_timer = null;
function leaderboard_score_animate(current_total, score){
	$('#leaderboard_score > .leaderboard_score').html('<span>'+current_total+'</span><img src="https://zeggut.nl/files/leaderboard/wenb/score_'+score+'.gif" onerror="this.src=\'https://zeggut.nl/files/leaderboard/wenb/score_1.gif\';">').closest('#leaderboard_score').attr('class','show');	
}

function keyboard_hide(){
	document.activeElement.blur();
	$("input").blur();	
}

function selectphoto(){
	navigator.camera.getPicture(onSuccessCamera, onFailCamera, { quality: 60,
		destinationType: Camera.DestinationType.FILE_URL,
		sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
		correctOrientation: false,
		encodingType: Camera.EncodingType.JPEG,
		targetWidth: 1920,
		targetHeight: 1920
	});
}

function takephoto(){
	navigator.camera.getPicture(onSuccessCamera, onFailCamera, { quality: 60,
		destinationType: Camera.DestinationType.FILE_URL,
		encodingType: Camera.EncodingType.JPEG,
		mediaType: Camera.MediaType.PICTURE,
		correctOrientation: true,
		targetWidth: 1920,
		targetHeight: 1920
		//saveToPhotoAlbum: true,
		//targetWidth: 1920,
		//targetHeight: 1920	
	});
}

function onSuccessCamera(imageData) {

	var camera_image = null;
	if(imageData){	
		var image_type = (imageData.indexOf('file:') !== -1)?'url':'data';		
		if(image_type == "url"){
			var camera_image = imageData;
			window.localStorage.setItem("camera_image", camera_image);
		}else if(image_type == "data"){
			var camera_image = "data:image/jpeg;base64," + imageData;
			window.localStorage.setItem("camera_image", camera_image);
		}
	}
	
	//$(".template_camera .question_text").addClass("fadeOut");	
	//$(".template_camera .question_bg").removeClass("transition_delay_1_5 question_bg_blurred").addClass("question_bg_camera");
	//$(".template_camera .question_bg").css("background-image","url("+camera_image+")");
	$('.template_camera #question_camera_answer').val("/files/camera/"+app_id+"/"+current_id+"-"+user_id+".jpg").closest('form').trigger('submit');
	//$('.template_camera #question_submit').removeClass("hide").addClass("show");
}

function onFailCamera(message) {
	//alert('Failed because: ' + message);
}

function json_return(data){
	if(data.response){						
		$.each(data.response, function(key, value){
			jQuery.globalEval(value);
		});	
	}	
}

var CB = function(e){
	if (!e) var e = window.event;
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
};

/********************************************************************** Vimeo **/
function videoplayer_vimeo_load(videoplayer_vimeo_id, videoplayer_vimeo_video_url){
	var options = {
        url: videoplayer_vimeo_video_url,
		autoplay:true,
		playsinline:true,
		title:false,
		width: $(window).width(),
		height: $(window).height()	
    };

    var vimeo_player = new Vimeo.Player(videoplayer_vimeo_id, options);
	
	vimeo_player.on('play',function(){
		$('#videoplayer_end_controls.show').removeClass('show').addClass('hide');
	});
	vimeo_player.on('pause', function(){
		$('#videoplayer_end_controls.hide').removeClass('hide').addClass('show');
	});
	vimeo_player.on('ended', function(){
		$('#videoplayer_end_controls.hide').removeClass('hide').addClass('show');
	});
	
	window.onresize = function(){
		$('#'+videoplayer_vimeo_id).find('iframe').css({width:$(window).width()+"px", height:$(window).height()+"px"});
	}	
}


/********************************************************************** Youtube **/

var videoplayer_youtube;
var videoplayer_youtube_id;
var videoplayer_youtube_video_id;
var videoplayer_youtube_array = [];

function videoplayer_youtube_load(videoplayer_youtube_id, videoplayer_youtube_video_id){

	if(videoplayer_youtube_array.indexOf(videoplayer_youtube_id) === -1){
	
		document.addEventListener('onYouTubeIframeAPIReady'+videoplayer_youtube_id, function (e) {
			
			videoplayer_youtube = new YT.Player(videoplayer_youtube_id, {
				height: $(window).height(),
				width: $(window).width(),
				playerVars: {
					autoplay:1,
					controls: 2,			
					disablekb: 1,
					enablejsapi: 1,
					fullscreen: 0,
					modestbranding:1,
					playsinline: 1,			
					rel: 0,
					showinfo: 0
				},
				videoId: videoplayer_youtube_video_id,				
				events: {
					'onReady': videoplayer_youtube_onReady,
					'onStateChange': videoplayer_youtube_stateChange
				}
			});
		}, false);		
		
		document.dispatchEvent(new CustomEvent('onYouTubeIframeAPIReady'+videoplayer_youtube_id, {}));
		videoplayer_youtube_array.push(videoplayer_youtube_id);		
	}else{
		document.dispatchEvent(new CustomEvent('onYouTubeIframeAPIReady'+videoplayer_youtube_id, {}));
	}
	
	window.onresize = function(){
		videoplayer_youtube.setSize($(window).width(), $(window).height());
	}	
	window.onYouTubeIframeAPIReady = function() { document.dispatchEvent(new CustomEvent('onYouTubeIframeAPIReady'+videoplayer_youtube_id, {})) };	
}

function videoplayer_youtube_onReady(event){
	event.target.playVideo();
}

function videoplayer_youtube_stateChange(event){	
	if (event.data == YT.PlayerState.PLAYING){
		$('#videoplayer_end_controls.show').removeClass('show').addClass('hide');
	}else if (event.data == YT.PlayerState.ENDED){
		$('#videoplayer_end_controls.hide').removeClass('hide').addClass('show');
	}else if (event.data == YT.PlayerState.PAUSED){
		$('#videoplayer_end_controls.hide').removeClass('hide').addClass('show');
	}
}

function videoplayer_youtube_playVideo(){
	videoplayer_youtube.playVideo();
}

function videoplayer_youtube_stopVideo() {
	videoplayer_youtube.stopVideo();
}