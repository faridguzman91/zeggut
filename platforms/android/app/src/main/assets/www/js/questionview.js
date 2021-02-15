var questionView = function(page) {
	
	var fileupload_do = false;

	this.initialize = function() {
		this.$el = $('<div id="question_view"/>');
	};
	
	current_template = page.template;
	
	this.render = function(){
		//If image == camera , then we use the latest camera image made in a template=camera question
		if(undefined != page.image && null != page.image && page.image.match(/([^\/]*)\/*$/)[1] == 'camera'){
			page.image = window.localStorage.getItem("last_camera_image");
		}		
		this.$el.html(this.template(page));
		return this;
	};
	
	this.next = function($filter){
		var next_question=0;
		if($filter == 'unanswered'){
			app.getFiltered('question','answered',0).done(function(page){
				l = page.length;
				for (var i = 0; i < l; i++){
					if(page[i].id == current_id){
						if(typeof page[parseInt(i+1)] !== 'undefined'){
							next_question = 'question/'+page[parseInt(i+1)].id;
							break;
						}
					}
				}				
				//No more questions, so thank you
				if(next_question === 0)
					next_question='question_thnx';							
			});
		}
		return next_question;
	}
	
	this.after = function(){

		//in browser there's always a rotation
		if(!is_browser){
			var orientation_string = screen.orientation.type;
			if(page.template != 'video'){
				screen.orientation.lock('portrait');
			}else if(page.template == 'video'){
				screen.orientation.unlock();
			}

			$(document).on('fullscreenchange msfullscreenchange mozfullscreenchange webkitfullscreenchange', function(e){
			    if(e.currentTarget.fullscreenElement || e.currentTarget.msFullscreenElement || e.currentTarget.mozFullScreen || e.currentTarget.webkitIsFullScreen) {
			        screen.orientation.unlock();
			    }else if(page.template != 'video'){
					screen.orientation.lock('portrait');
				}
			});
		}
		
		is_question = true;
		
		var can_submit = true;		
		var $this = this;
		var $question_view = this.$el;
		var $form = $question_view.find('form');
		var $question_text = $question_view.find('.question_text');
		var $question_form = $question_view.find('.question_form');
		var $question_bg   = $question_view.find('.question_bg');
		var $question_submit = $question_view.find('#question_submit');
		var $label = null;
		var next_question = null;
		var total_checked = null;
		
		if(page.image_type == 'background'){
			$question_bg.addClass('question_bg_blurred transition_delay_1_5');			
			$question_text.addClass('animated fadeIn animation_delay_1_5');
			$question_text.find('input').addClass('animated fadeIn animation_delay_2');		
			
			if(page.template != "video")
				$question_form.addClass('animated fadeIn animation_delay_2');
		}

		if(page.image_type == 'single' || page.image_type == 'content'){
			$question_text.addClass('animated fadeIn animation_delay_0_5');			
			$question_text.find('input').addClass('animated fadeIn animation_delay_1');		
			$question_form.addClass('animated fadeIn animation_delay_1');
		}		
		
		if(page.template == 'page'){
			$question_submit.addClass('animated fadeIn animation_delay_0_5');
		}		
	
		$question_view.find('.input_app_id').val(app_id);
		$question_view.find('.input_app_version').val(app_version);
		$question_view.find('.input_user_id').val(user_id);
		$question_view.find('.input_user_token').val(user_token);		
		$question_view.find('.input_device_id').val(device_id);
		$question_view.find('.input_device_model').val(device_model);
		$question_view.find('.input_device_platform').val(device_platform); 
		$question_view.find('.input_device_version').val(device_version);		
		
		if(page.template == 'page' && page.button == ''){
			$.ajax({
				type: "POST",
				url: $siteUrl+"json/update.php",
				data: $form.serialize(),
				dataType: "json"
			});
		}		
		if(page.template == 'sortable'){			
			$('.sortable_list').sortable({
				axis: "y",
				start: function(event,ui){
					$(this).find('li.text_visible').removeClass('text_visible').css('height','');
				},
				update: function(event,ui){
					$(this).find('li').each(function(index, value){
						$(this).find('.sortable_list_color').text(parseInt(index+1));
					});
				},
				delay: 100
			});			
		}else if(page.template == 'thumbs' || page.template == 'yesno'){
			
			/*$form.find('label').on(click, function(e){
				var $this_label = $(this);
				$this_label.addClass('choosen tada');
				$question_form.find('label').not($this_label).addClass('hide');
				$question_form.addClass('choosen');
				setTimeout(function(){$form.trigger('submit');},1000);
			});
			*/
			/* 12-12-2019 */
			$form.on('change', function(e){
				$this_label = $(e.target).parent();	
				$this_label.addClass('choosen tada');				
				$question_form.find('label').not($this_label).addClass('hide');
				$question_form.addClass('choosen');
				setTimeout(function(){$form.trigger('submit');},1000);
			});			
		}else if(page.template == 'camera'){
			$('#question_camera_answer').val()
			
		}else if(page.template == 'multipleselect'){			
			$question_submit.addClass("animated bounceIn hide");			
			$form.find('label').on(click, function(e){
				e.preventDefault();			
				var $this_label = $(this);
				var $this_checkbox = $this_label.find('input:checkbox');			
				if(e.target.nodeName.toLowerCase() == 'input' || e.target.nodeName.toLowerCase() == 'textarea'){
					if($this_label.hasClass('custom_input') && $this_label.find('.input_custom_input').val() == '')
						$this_label.find('.input_custom_input').focus();					
					if($this_checkbox.is(':checked'))
        				return false;				
				}				
				CB(e);				
				if($this_checkbox.is(':checked')){
					$this_checkbox.prop('checked', false);
					$this_label.removeClass('active');					
					//if($this_label.hasClass('custom_input'))
					//	$this_label.children('.input_custom_input.show').removeClass("show").addClass("hide");
				}else{
					$this_checkbox.prop('checked', true);
					$this_label.addClass('active');					
					if($this_label.hasClass('custom_input') && $this_label.find('.input_custom_input').val() == '')
						$this_label.find('.input_custom_input').focus();
				}
				//total_checked = $question_form.find("input:checkbox:checked").length;			
				total_checked = $question_form.find("label.active").length;				
				if(total_checked>0)	$question_submit.removeClass("hide").addClass("show");
				else $question_submit.removeClass("show").addClass("hide");				
				return false;
			});
			
			/* // dit werkt niet op de iphone
			$form.find('input:checkbox').on('change', function(){								
				total_checked = $question_form.find("input:checkbox:checked").length;				
				//total_checked = $question_form.find("label.active").length;				
				var total_checked2 = $question_form.find("label.active").length;				
				$question_text.find('h1').text(total_checked  + ' / ' + total_checked2);				
				if(total_checked>0)	$question_submit.removeClass("hide").addClass("show");
				else $question_submit.removeClass("show").addClass("hide");				
				$(this).parent('label').toggleClass('active');
			});
			*/			
		}else if(page.template == 'singleselect'){			
			$question_form.find('#question_submit').addClass("animated bounceIn hide");						
			$form.find('label:not(.active)').on(click, function(e){			
				e.preventDefault();				
				var $this_label = $(this);
				var $this_radio = $this_label.find('input:radio');				
				if(e.target.nodeName.toLowerCase() == 'input' || e.target.nodeName.toLowerCase() == 'textarea'){
					if($this_label.hasClass('custom_input') && $this_label.find('.input_custom_input').val()=='')
						$this_label.find('.input_custom_input').focus();				
					if($this_radio.is(':checked'))
						return false;
				}				
				CB(e);				
				$question_form.find('label.active').removeClass('active').find('input:radio:checked').prop('checked', false);				
				$this_radio.prop('checked', true);
				$this_label.addClass('active');			
				//$question_form.find('label.custom_input').children('.input_custom_input.show').removeClass("show").addClass("hide");				
				total_checked = $question_form.find("label.active").length;
				if(total_checked>0)	$question_submit.removeClass("hide").addClass("show");
				else $question_submit.removeClass("show").addClass("hide");				
				return false;
			});			
		}else if(page.template == 'dropdown'){			
			$question_form.find('#question_submit').addClass("hide");						
			$form.on('change', 'select', function(){				
				if($(this).val())	$question_submit.removeClass("hide").addClass("show");
				else $question_submit.removeClass("show").addClass("hide");				
				return false;
			});			
		}else if(page.template == 'star'){
			$question_submit.addClass("animated bounceIn hide");			
			$form.on('change', function(e){
				$question_submit.removeClass("hide").addClass("show");
			});			
		}else if(page.template == 'picturechoice'){
			$question_submit.addClass("animated bounceIn hide");			
			$form.on('change', function(e){
				$label = $(e.target).parent();	
				$question_form.find('label').removeClass('tada active not_active').not($label).addClass('not_active');
				$label.addClass('active tada');				
				$question_submit.removeClass("hide").addClass("show");
				//setTimeout(function(){$form.trigger('submit');},1000);
			});
		}else if(page.template == 'video'){	
			//youtube
			if(page.meta[0].youtube_video_id){
				if($('script[src="https://www.youtube.com/iframe_api"]').length < 1){
					$("<script>", {  src : "https://www.youtube.com/iframe_api", type : "text/javascript" }).appendTo("body");
				}
				var checkYT = setInterval(function () {
					if(YT.loaded){
						clearInterval(checkYT);
						videoplayer_youtube_load('videoplayer'+page.id, page.meta[0].youtube_video_id);
					}
				}, 100);			
			}else if(page.meta[0].vimeo_video){
				if($('script[src="https://player.vimeo.com/api/player.js"]').length < 1){					
					$.getScript("https://player.vimeo.com/api/player.js", function(){
						videoplayer_vimeo_load('videoplayer'+page.id, page.meta[0].vimeo_video);
					});
				}else{
					videoplayer_vimeo_load('videoplayer'+page.id, page.meta[0].vimeo_video);
				}				
			}else{//mp4 from url			
				var video = $('<video />', {
					id: 'video'+page.id,
					class:'video_mp4',
					src: page.meta[0].video_url,
					type: 'video/mp4',
					width: $(window).width()+"px",
					height: $(window).height()+"px",
					controls: true,
					poster: page.meta[0].video_image
				});				
				video.appendTo($('#videoplayer'+page.id));				
				$('#video'+page.id).on('ended pause', function(){
					$('#videoplayer_end_controls.hide').removeClass('hide').addClass('show');
				}).on('play', function(){  
					$('#videoplayer_end_controls.show').removeClass('show').addClass('hide');				
				}).attr('playsinline','').get(0).play();
				window.onresize = function(){
					video.css({width:$(window).width()+"px", height:$(window).height()+"px"});
				}				
			}			
			//if(player_youtube_array.indexOf(player_youtube_id) > -1){
			//	document.dispatchEvent(new CustomEvent('onYouTubeIframeAPIReady'+player_youtube_id, {}));
			//}
		}else if(page.template == 'fileupload'){
			$question_view.find('#input_file_upload').on('change', function(){
				var file = $(this).get(0).files[0];
				if (file) {
					fa_loading($form.find('label.label_file'));
					$question_form.addClass('pointereventsnone');
					$question_submit.addClass('pointereventsnone');
					//readFile(file, $form);	
					
					reader = new FileReader();
					reader.onload = function (e) {
						//TransferCompleteCallback(e.target.result);
						var formData = new FormData();
						formData.append('question_id', current_id);
						formData.append('device_id', device_id);
						formData.append('app_id',app_id);
						formData.append('app_version',app_version);
						formData.append('user_id', user_id);
						formData.append('user_token', user_token);
						formData.append('cmd',"question_answer");
						formData.append('fileData', file);
						formData.append('fileData2', e.result);
						formData.append('type', file.type);						
						
						$.ajax({
							type: "POST",
							//beforeSend: function (request) {
							//	request.setRequestHeader("Content-Type", file.type);
                			//},
							url: $siteUrl+"json/update.php",
							data: formData,
							contentType: false,
							processData: false,
							success: function(data){
								if(data.response){
									json_return(data);
								}													
								router.load(data.next);
							},
							error: function() {
								alert('Er was een probleem tijdens het opslaan. Probeer opnieuw.');
								router.load('question/'+current_id);
							}
						});
					};
					reader.onerror = function (e) {
						alert("Error " + e.target.error);
					};					
					reader.readAsDataURL(file);					
				}
				return false;
			});
		}else if(page.template == 'videoupload'){
			
			$yt_video_upload_api_key = 'AIzaSyD7cgjeEfIg3Z4NdABp8EcaH6urMS0eNoM'; //Creapolis			
			$yt_video_upload_api_key = 'AIzaSyDg9PT3jrRel1wLxKuOQrt02tafZWaru6A'; //usrvideouploads@gmail.com  Video uploads
			$yt_video_upload_api_key = 'AIzaSyA_G5BsiYIoymHjnjh0ayFu0a1RrsV832Q'; //usrvideouploads@gmail.com  Zeggut video uploads
			$yt_video_upload_api_key = 'AIzaSyCXUJA6dd6XTs-Y-BOrtPlWR1qogyiSmQ4'; //usrvideouploads@gmail.com  Zeggut video uploads
			
			$yt_video_upload_scopes  = ['https://www.googleapis.com/auth/youtube.upload','https://www.googleapis.com/auth/youtube','https://www.googleapis.com/auth/youtubepartner'];
			
			$yt_video_upload_input = $question_view.find('#input_video_upload');
			$yt_video_upload_meta_title = $question_view.find('#yt_video_upload_meta_title'); //$('#yt_video_upload_meta_title')
			$yt_video_upload_meta_description = $question_view.find('#yt_video_upload_meta_description'); //$('#yt_video_upload_meta_description')
			$yt_video_upload_meta_privacy = $question_view.find('#yt_video_upload_meta_privacy');  //$('#yt_video_upload_meta_privacy')
			$yt_video_upload_progress = $question_view.find('#yt_video_upload_progress');  //$('#yt_video_upload_progress')
			$yt_video_upload_text = $question_view.find('#yt_video_upload_text');  //$('#yt_video_upload_text_progress')
			$yt_video_upload_text_progress = $question_view.find('#yt_video_upload_text_progress');  //$('#yt_video_upload_text_progress')
			$yt_video_upload_response = $question_view.find('#yt_video_upload_response'); //$('#yt_video_upload_response')
			$yt_video_upload_during_upload = $question_view.find('#yt_video_upload_during_upload'); //$('#yt_video_upload_response')				
			
			$yt_video_upload_meta_title = page.name;
			$yt_video_upload_meta_description = page.description;
			$yt_video_upload_meta_privacy = "unlisted";
			
			$yt_video_upload_input.on('change', function(){
				fa_loading($form.find('label.label_file'));
				$question_form.addClass('pointereventsnone');
				$question_submit.addClass('pointereventsnone').hide();	
			});			
			$yt_video_upload_response.on('change', function(){
				$form.trigger('submit');
			});
			function yt_video_upload_auth_init(){
				yt_video_upload_auth();
			}
			if($('script[src="https://apis.google.com/js/api.js"]').length < 1){				
			
				var tag = document.createElement("script");
				tag.type = "text/javascript";
				tag.src = "https://apis.google.com/js/api.js";
				tag.onload = function () {
					gapi.load('client:auth2', yt_video_upload_auth_init);
				};
				tag.onreadystatechange = function(){
					if(this.readyState === 'complete'){ 
						this.onload(); 
					}
				};
				tag.defer='';
				tag.async='';
				document.getElementsByTagName('head')[0].appendChild(tag);
			}
		}
		
		$('.li_text_toggler').on(click, function(e){ //need touchstart for sortable?
			CB(e);
			
			var $current_is_visible = $(this).closest('li').hasClass('text_visible');
			$(this).closest('ul').find('li.text_visible').removeClass('text_visible');
			
			if(!$current_is_visible){
				$(this).closest('li').addClass('text_visible');
			}
			return false;
		});		
		
		$form.on('submit', function(e){
			
			e.preventDefault;
						
			if(can_submit){				
				can_submit = false;
			
				if(page.template == "camera" && window.localStorage.getItem("camera_image")){
					
					$question_text.html('');

					var options = new FileUploadOptions();
					
					var imageData = window.localStorage.getItem("camera_image");
					options.fileKey = "file";
					options.fileName = imageData.substr(imageData.lastIndexOf('/') + 1);
					options.mimeType = "image/jpeg";

					var params = new Object();
					params.question_id = current_id;
					params.device_id = device_id;
					params.app_id = app_id;
					params.app_version = app_version;
					params.user_id = user_id;
					params.user_token = user_token;
					params.cmd = "camera_upload";
					options.params = params;

					options.chunkedMode = false;
					var ft = new FileTransfer();
										
					ft.onprogress = function(progressEvent) {
						if (progressEvent.lengthComputable) {
							var upload_perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
							$question_text.html('<a class="btn btn-positive"><i class="fa fa-spinner fa-pulse"></i> '+upload_perc+'% </a>');
							//loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
						} else {
							$question_text.html('<a class="btn btn-positive"><i class="fa fa-check"></i></a>');
							//loadingStatus.increment();
						}
					};
					
				 	ft.upload(imageData, encodeURI($siteUrl+"json/update.php"), function(result){
						
						$question_text.html('<a class="btn btn-positive"><i class="fa fa-check"></i></a>');
						
						var r_jsonobject = JSON.parse(result.response);
						var r_image = r_jsonobject.image;
						var r_image_url = r_jsonobject.image_url;
						$('#question_camera_answer').val(r_image);						
						window.localStorage.setItem("last_camera_image",r_image_url);						
						
						//We need this so the input	is Set!
						$.ajax({
							type: "POST",
							url: $siteUrl+"json/update.php",
							data: $form.serialize(),
							dataType: "json",
							success: function(data){						
								router.load(data.next);
							},
							error: function(e) {
								alert('Er was een probleem tijdens het opslaan. Probeer opnieuw.');
								can_submit = true;
							}
						});						
						
						window.localStorage.removeItem("camera_image");				
				 	}, function(error){
						//alert('Upload failed. Try again');
						//alert('Uploaden misluk ' + JSON.stringify(error));
				 		//console.log(JSON.stringify(error));
				 	}, options);
					
				}else{
					
					$.ajax({
						type: "POST",
						url: $siteUrl+"json/update.php",
						data: $form.serialize(),
						dataType: "json",
						success: function(data){

							$question_submit.removeClass("show").addClass("hide");
							$question_form.find('label, input[type="text"], textarea, select').addClass('pointereventsnone');
							
							if(page.template == 'sortable') //remove sortable so it will bind again when a new sortable page is loaded
								$('.sortable_list').sortable( 'destroy' );
								
							if(data.response){
								json_return(data);
							}
							
							if(data.answer_feedback_hint){
								if(data.answer_feedback_hintclass && data.answer_feedback_text){
									$question_form.addClass( 'hint--bounce hint--rounded hint--white hint--always '+ data.answer_feedback_hintclass).attr('data-hint',data.answer_feedback_text);
								}
							}
							if(data.answer_feedback_html && data.answer_feedback_text){								
								$question_submit.addClass('btn-relative');
								$question_form.find('#answer_feedback_html_text').html(data.answer_feedback_text);
								
								if(data.answer_correct_class)
									$question_form.find('#answer_feedback_html_text_wrapper').addClass(data.answer_correct_class);
									
								$question_form.find('#answer_feedback_html_text_wrapper').addClass('show');
							}
							
							//uitleg / theorie
							if(data.question_feedback && data.question_feedback_text){								
								$question_submit.addClass('btn-relative');
								$question_form.find('#question_feedback_html_text').html(data.question_feedback_text);
								$question_form.find('#question_feedback_html_text_wrapper').addClass('show');
							}
							
							if((data.response && app_options.leaderboard!=1) || data.answer_feedback_hint || data.answer_feedback_html || data.question_feedback){
						
								$question_submit.removeClass("hide").addClass("show"); //show button again for next question					
								
								fa_loading($question_submit, true);
								if(page.button != 'pijl'){
									$question_submit.html('<i class="fa fa-arrow-right animated slideInLeft"></i>');
								}
								
								if(page.template == 'thumbs' || page.template == 'yesno'){
									$question_submit = $question_form;
								}
								
								$question_submit.on(click, function(){									
									$('body').trigger('slide');
									router.load(data.next);
								});
							}else{								
								$('body').trigger('slide');
								router.load(data.next);
							}
						},
						error: function(e) {
							alert('Er was een probleem tijdens het opslaan. Probeer opnieuw.');
							can_submit = true;
						}
					});					
				}
			}
			return false;
		});		
		
		$form.on(click, '#question_submit', function(){
			if(can_submit){
				fa_loading($(this));
				$form.trigger('submit');
			}
			return false;
		});			
		
		return this;
	}
	
	this.initialize();
}