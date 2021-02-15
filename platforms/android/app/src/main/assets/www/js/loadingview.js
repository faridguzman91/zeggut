var loadingView = function() {

	this.initialize = function() {
		this.$el = $('<div id="loading_view"/>');
	};

	this.render = function() {
		this.$el.html(this.template());
		return this;
	};

	this.initialize();
}