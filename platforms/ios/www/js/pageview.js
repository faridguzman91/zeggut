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