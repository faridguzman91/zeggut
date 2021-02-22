function hideMenu(){
	if($('body').hasClass('menu-visible')){	
		toggleMenu();
	}
}
function showMenu(){
	if(!$('body').hasClass('menu-visible') && app_options.menu){		
		toggleMenu();
	}
}
function toggleMenu($clicked){

	var $body = $('body'),
	$page = $('#app'),
	$menu = $('#menu'),
	clickHide = false;
	
	/* Cross browser support for CSS "transition end" event */
	transitionEnd = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd';
	
	if ($body.hasClass('menu-visible')) {
		$body.addClass('animating slideright');
		$page.off(click);
	} else {
		$body.addClass('animating slideleft');
		clickHide = true;
	}
	
	$page.on( transitionEnd, function() {
		$body
			.removeClass( 'animating slideleft slideright' )
			.toggleClass( 'menu-visible' );
	
		$page.off( transitionEnd );
		
		if(clickHide && $body.hasClass( 'menu-visible' )){			
			$('#app').one(click, function(e) {				
				if($(e.target).closest('#toggle-menu').get(0) == null){		
					CB(e);				
					e.preventDefault;
					$('#app').off(click);				
					hideMenu();
				}
			});				
		}
	});
}