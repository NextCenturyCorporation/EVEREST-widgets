var twitter_admin = function() {
	var me = this;

	me.template = null;

	me.execute = function() {
		me.template = me.fetch_template();
		me.setup_view();

		me.admin_view = new me.Admin_View({el: $(".twitter_admin_container")[0]});
	};

	me.fetch_template = function() {
		var templateName = 'twitter_admin';

		var template = $('#template_' + templateName);
    	if (template.length === 0) {
	        var tmpl_dir = './templates';
	        var tmpl_url = tmpl_dir + '/' + templateName + '.tmpl';
	        var tmpl_string = '';

	        $.ajax({
	            url: tmpl_url,
	            method: 'GET',
	            async: false,
	            contentType: 'text',
	            success: function (data) {
	                tmpl_string = data;
	            }
	        });

	        $('head').append('<script id="template_' + 
	        templateName + '" type="text/template">' + tmpl_string + '<\/script>');
	    }
	};

	me.setup_view = function() {
		me.Admin_View = Backbone.View.extend({
			initialize: function() {
				this.render();
			},
			render: function() {
				var template = _.template($("#template_twitter_admin").html(), {});

				this.$el.html(template);
				me.setup_button_handlers();
			}
		});
	};

	me.setup_button_handlers = function() {
		var me = this;
		me.bind_more_filters_button();
	};

	me.bind_more_filters_button = function() {
		var me = this;
		$(".add_more_filters_button").on('click', $.proxy(me.onAddFilter, me));
	}

	me.onAddFilter = function() {
		$(".add_more_filters_button").remove();
		var filter_label = $(".base_filter_label");
		console.log(filter_label);
		filter_label.text("Filters :");

		var filters = $(".filter_line");
		var filter_count = filters.length;
		var last_filter = $(filters[filter_count -1]);
		last_filter.after(me.create_filter(filter_count));
		me.bind_more_filters_button();
	};

	me.onStartButtonClick = function() {
		//make call to start or restart
	};

	me.onStopButtonClick = function() {
		//make call to stop
	};

	me.create_filter = function(i) {

		var filter_html ='<div class="filter_line"> \
			<label for="filter_' + i + '"></label> \
			<input name="filter_' + i + '" class="twitter_admin_filter filter_field_with_more_button multi_filter" /> \
			<button type="button" class="add_more_filters_button">+</button> \
			</div>';

		return filter_html
	}
};

