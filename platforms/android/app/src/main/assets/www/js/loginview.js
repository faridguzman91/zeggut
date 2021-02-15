var loginView = function() {

	this.initialize = function() {
		this.$el = $('<div id="login_view"/>');
	};
	
	this.render = function() {
		this.$el.html(this.template());
		return this;
	};
		
	this.after = function(){
		var $this = this;
		var $login_view = this.$el;
		var $form = $login_view.find('form');
		var $input = $form.find('input:text');
		var $form_submit = $form.find('#login_submit');

		$form.on('submit', function(e){
			e.preventDefault;
			$.ajax({
				type: "POST",
				url: $siteUrl+"json/login.php",
				data: {'cmd':'code', 'code': $input.val(), 'user_id': user_id, 'user_token': user_token, 'app_version': app_version, 'device_id': device_id, 'device_model': device_model,'device_platform': device_platform, 'device_version': device_version, 'is_browser': is_browser},				
				dataType: "json",
				success: function(response){
					if(response.app_id){												
						keyboard_hide();						
						$form_submit.addClass('btn-positive');
						$form_submit.html('<i class="fa fa-thumbs-up"></i>');
						app_id = response.app_id;
						user_id = response.user_id;
						user_token = response.user_token;
						window.localStorage.setItem('app_id', app_id);
						window.localStorage.setItem('user_id', user_id);
						window.localStorage.setItem('user_token', user_token);						
						
						setTimeout(function(){
							app_start();
						}, 100);
						
					}else{
						alert('De ingevoerde code is onjuist');	
						$input.addClass('error').on('blur click change', function(){ $(this).removeClass('error');});
						fa_loading($form_submit, true);
						return false;
					}					
				},
				error: function(e) {
					console.log('current = '+router.current());
					alert('Er was een probleem tijdens het verbinden. Probeer opnieuw.');
					router.load('login');					
				}
			});
			return false;			
		});	
		
		
		$form_submit.on(click, function(){
			fa_loading($form_submit);
			$form.trigger('submit');
			return false;
		});		
		
		return this;
	}
	
	this.initialize();
}