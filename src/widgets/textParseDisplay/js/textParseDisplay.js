var textParseDisplay = function() {
	var me = this;

	me.template = null;

	me.execute = function() {
		me.loadTemplate();

		me.setup_view();

		//me.admin_view = new me.Admin_View({el: $(".twitter_admin_container")[0]});
	};

	me.loadTemplate = function() {
		if($("#template_text_parse_display").length === 0) {
			$("head").append(
				'<script id="template_text_parse_display" type="text/template">' +
					'<ul class="text_parse_tabs" data-tabs="text_parse_tabs">' +
  						'<li class="active"><a href="#home">Home</a></li>' +
  						'<li><a href="#profile">Profile</a></li>' +
						'<li><a href="#messages">Messages</a></li>' +
						'<li><a href="#settings">Settings</a></li>' +
					'</ul>' +
					'<div class="pill-content">' +
						'<div class="active" id="home">...</div>' +
						'<div id="profile">...</div>' +
						'<div id="messages">...</div>' +
						'<div id="settings">...</div>' +
					'</ul>' +
				'</script>');
		}
	};

	me.setup_view = function() {
		me.Parse_Result_View = Backbone.View.extend({
			initialize: function() {
				this.render();
			},
			render: function() {
				var template = _.template($("#template_text_parse_display").html(), {});

				this.$el.html(template);

				//$(".text_parse_tabs").tabs();

/*				$(".twitter_admin_save_button").hide();
				$(".twitter_admin_cancel_button").hide();
				
				var url = 'http://everest-build:8081/twitter-ingest/';
				$.ajax({
					type: "GET",
					url: url,
					dataType: 'jsonp',
					jsonpCallback: 'callback',
					success: $.proxy(me.handleInitialKeyLoadSuccess, me),
					error: $.proxy(me.onKeySaveError, me)
				});*/
			}
		});
	};
};

