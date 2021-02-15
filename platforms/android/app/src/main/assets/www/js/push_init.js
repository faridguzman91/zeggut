var push;

function reset_push_registration_id(){
	window.localStorage.setItem('push_registration_id', '');
}

function push_init(){
	/****** PUSH */

	if (typeof PushNotification !== "undefined"){	
	
		push = PushNotification.init({
			"android": {
				"senderID": "1010592068648"
			},
			"ios": {
				"alert": true,
				"sound": true
			},
            "browser": {
                pushServiceURL: 'http://push.api.phonegap.com/v1/push'
            },
			"windows": {}
		});

		push.on('registration', (data) => {
			
			var old_push_registration_id = window.localStorage.getItem('push_registration_id');
			var new_push_registration_id = data.registrationId;			
			var old_push_registration_date = window.localStorage.getItem('push_registration_date');
			var new_push_registration_date_object = new Date();
			var new_push_registration_date_time = new_push_registration_date_object.getTime();
			if(!old_push_registration_date){
				window.localStorage.setItem('push_registration_date', (new_push_registration_date_time - 3600001));
			}			
			if((old_push_registration_id !== new_push_registration_id) || ((new_push_registration_date_time - old_push_registration_date) > 3600000)){ // 1 hour   86400000  = 1 day	
				$.ajax({
					type: "POST",
					url: $siteUrl+"json/update.php",
					data: {'cmd':'gcm_registration', 'app_id': app_id, 'user_id': user_id, 'user_token': user_token, 'app_version': app_version, 'reg_id': new_push_registration_id, 'device_id': device_id, 'device_model': device_model, 'device_platform': device_platform, 'device_version': device_version},
					dataType: "json"
				}).done(function(result){
					window.localStorage.setItem('push_registration_id', new_push_registration_id);
					window.localStorage.setItem('push_registration_date', new_push_registration_date_time);					
				}).fail(function( jqXHR, textStatus ){
				
				}); 
			 }
		 });
		
/*		push.on('data', function(data) {
			var $push_app_id = data.additionalData.app_id;	
			if($push_app_id>0 && $push_app_id != app_id){
				window.localStorage.setItem('app_id', $push_app_id);
				app_id=$push_app_id;
				setTimeout(function(){
					app_reload();
				}, 100);						
			}
			push.finish(function() {
				//console.log('success');
			}, function() {
				//console.log('error');
			});
		});
*/		
/*		push.on('nextquestion', (data) => {
			message('xxx');
			app_reload('next_question');
		});
*/	
		push.on('notification', (data) => {
			
			var $app_was_open = data.additionalData.foreground;
			var $push_app_id = data.additionalData.app_id;
			
			push_cmd = data.additionalData.cmd;
	
			if(!$app_was_open && ($push_app_id>0 && $push_app_id != app_id)){
				window.localStorage.setItem('app_id', $push_app_id);
				app_id=$push_app_id;
			}			
			if(!$app_was_open && push_cmd == 'next_question'){
				app_reload('next_question');
			}
						
			if($app_was_open){
				//Reload questions
				//message('<strong>'+data.title+'</strong><br />'+data.message, 'alert');
				navigator.notification.confirm(
					data.message,   // message
					onNotificationConfirm,       	// callback
					data.title,		// title
					['Ok','Cancel'] //Buttons
				);
			}

			function onNotificationConfirm(buttonIndex) {
				if(buttonIndex == 1){
					if($push_app_id>0 && $push_app_id != app_id){
						window.localStorage.setItem('app_id', $push_app_id);
						app_id=$push_app_id;
					}					
    				app_reload('next_question');
				}
			}
			
			push.finish(function(){				
				setTimeout(function(){
					cordova.plugins.notification.badge.set(1);
				}, 1000);

			}, function() {
				//console.log('error');
			});			
		}); 
		
		push.on('error', (e) => {
			// e.message
		});
	}
}