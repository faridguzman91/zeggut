var homeView = function (page) {

    this.initialize = function () {
		this.$el = $('<div id="home_view"/>');	
    };
	
	this.render = function() {
		var $this = this;
			
		new_version_link='';
		if(app_latest_version > app_version){
			var new_version_link='market://details?id=nl.zeggut.app'; //bundle_id
			if(is_ios()){
				//new_version_link='itms-apps://itunes.apple.com/app/nl.zeggut.app';
				//new_version_link='itms-apps://itunes.apple.com/us/app/zeggut/id1114838317?mt=8';
				new_version_link='itms-apps://itunes.apple.com/app/id1114838317';
			}			
		}

		if(typeof page == 'undefined' || page['questionnaire'] == null){
			app_reset();
		}
		
		page.questionnaire = ((page['questionnaire'].length>0)?page['questionnaire']:'');
		page.questionnaire_multiple = (app_options.questionnaire_multiple>0)?true:false;
		
		if(page.questionnaire_multiple)
			page.questionnaires = page['questionnaire'];

		page.next_question_id = ((page['questionnaire'].length>0)?page['questionnaire'][0].next_question_id:'');

		page.header_start = app_options.header_start;
		page.content_start_questions = app_options.content_start_questions;
		page.content_start_no_questions = app_options.content_start_no_questions;
		page.new_version_link = new_version_link;
		page.background_image = app_options.background_image_start;
		page.menu = app_options.menu;
		page.intro = app_options.intro;
		page.startpage = app_options.startpage;
		page.beacons = app_options.beacon;		
		page.leaderboard = app_options.leaderboard;
			
		
		if(app_options.leaderboard == 1){
			page.rank = page['leaderboard_rank'];
			page.score = page['leaderboard_score'];
			page.user_name = page['leaderboard_user_name'];
			
			$('body').attr('data-leaderboard', 1);
			$('#leaderboard_score .leaderboard_score').html(page['leaderboard_score']);
		}
			
		$this.$el.html($this.template(page));
		return this;
	};
	
	this.after = function(){
		
		$('.progress_bar > span').each(function(){
			var $this = $(this);
			var $this_progress = $this.attr('data-progress-val');
			$this.css('width', $this_progress+"%");
		});
		
		$('.li_text_toggler').on(click, function(){
			var $current_is_visible = $(this).closest('li').hasClass('text_visible');
			$(this).closest('ul').find('li.text_visible').removeClass('text_visible');
			
			if(!$current_is_visible){
				$(this).closest('li').addClass('text_visible');
			}
		});
		
		if(app_options.beacon==1 && !is_browser){
			beaconStart();
		}	
	}

    this.initialize();

}

var pageView = function(page) {

	this.initialize = function() {
		this.$el = $('<div id="page_view" data-id="'+current_id+'"/>');
	};

	this.render = function() {
		this.$el.html(this.template(page));
		return this;
	};

	this.initialize();
}


var introView = function (page) {
	this.initialize = function() {
		this.$el = $('<div id="intro_view"/>');
	};

	this.render = function() {
		page.header_uitleg=app_options.header_uitleg;
		this.$el.html(this.template(page));
		return this;
	};

	this.after = function(){
		$('.introductie_slider').bxSlider({
			pause: 350,
			speed: 200,
			nextSelector: '#introductie_slider_next',
			prevSelector: '#introductie_slider_prev',
			infiniteLoop: false,
			hideControlOnEnd: true,
			nextText: '<i class="fas fa-chevron-right"></i>',
			prevText: '<i class="fas fa-chevron-left"></i>'
		});
		
		$('#skip_intro').on(click, function(e){		
			window.localStorage.setItem('skip_intro', skip_intro_val);
			skip_intro = true;
			router.load('');
			return false;
		});
		$('.history_back_intro').on(click, function(e){
			router.load('');
			return false;
		});	
		
		return this;
	}

	this.initialize();
}


var leaderboardView = function (page) {
	this.initialize = function() {
		this.$el = $('<div id="leaderboard_view"/>');
	};
	this.render = function(){
		this.$el.html(this.template(page));
		return this;
	};
	this.after = function(){
		return this;
	}
	this.initialize();
}


var contactView = function(page) {

	this.initialize = function() {
		this.$el = $('<div id="contact_view"/>');
	};
	
	this.render = function() {
		page.contact = app_options.contact;
		this.$el.html(this.template(page));
		return this;
	};
		
	this.after = function(){
		var can_submit = true;		
		
		var $this = this;
		var $contact_view = this.$el;
		var $form = $contact_view.find('form');
		var $form_submit = $contact_view.find('#contact_submit');

		$contact_view.find('.input_app_id').val(app_id);
		$contact_view.find('.input_app_version').val(app_version);
		$contact_view.find('.input_user_id').val(user_id);
		$contact_view.find('.input_user_token').val(user_token);		
		$contact_view.find('.input_device_id').val(device_id);
		$contact_view.find('.input_device_model').val(device_model);
		$contact_view.find('.input_device_platform').val(device_platform); 
		$contact_view.find('.input_device_version').val(device_version);			
	
		$form.on('submit', function(e){
			e.preventDefault;
						
			if(can_submit){				
				//can_submit = false;
				
				$.ajax({
					type: "POST",
					url: $siteUrl+"json/update.php",
					data: $form.serialize(),
					dataType: "json",
					success: function(data){

						$form_submit.removeClass("show").addClass("hide");
						$form.addClass('pointereventsnone');
						
						if(data.response){
							json_return(data);
						}
					},
					error: function(jqXHR,error, errorThrown) { }
				});	
			}
			
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