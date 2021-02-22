var messageTransEndEventName = ('WebkitTransition' in document.documentElement.style) ? 'webkitTransitionEnd' : 'transitionend';
messageHide = function($this){	
	$this.removeClass('bounceInRight animated').addClass('bounceOutRight animated').on(messageTransEndEventName, function(e) {
		//$this.remove();
		//$(e.target).remove();
	});
	setTimeout(function(){
		$this.remove();
	},500);
}

message = function(data, type, delay, keepvisible){
	if(!type) type='true';
	if(!delay) delay=7000;
	
	
	if($('#message').length<1) $('body').append('<div id="message"><ul></ul></div>');
	var $this = $('#message ul');
	
	var td = new Date(); 
	ts = td.getTime(); 
	var randnum = Math.floor((Math.random()*10000)+1);
	var	boxid = "message"+ts+randnum; 	
	
	$this.append('<li id="'+boxid+'" class="return_content bounceInRight animated"><div class="return_'+type+'"><div class="return_content_progress"><span class="return_content_progress_bar"></span></div>'+data+'</div></li>');
	
	var $box=$('#'+boxid);

	//$box.show("slow", "easeInOutQuart", function(){
	$box.on('click', function(){
		messageHide($(this));							   
	});
	
	if(!keepvisible){
		setTimeout(function(){
			messageHide($box);
		},delay);
	}
	//});
}