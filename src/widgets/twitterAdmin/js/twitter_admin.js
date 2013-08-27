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

				$(".twitter_admin_save_button").hide();
				$(".twitter_admin_cancel_button").hide();
				
				var url = 'http://localhost:8081/twitter-ingest/';
				$.ajax({
					type: "GET",
					url: url,
					dataType: 'jsonp',
					jsonpCallback: 'callback',
					success: $.proxy(me.handleInitialKeyLoadSuccess, me),
					error: $.proxy(me.onKeySaveError, me)
				});
			}
		});
	};

	me.handleInitialKeyLoadSuccess = function(data, response) {
		if(data.length !== 0) {
			for(i in data) {
				var keyContainer = $(".twitter_admin_form");
				keyContainer.append(me.createApiIdDiv($(".api_key_div").length, data[i]._id));
				$('.toggle').toggles({type:'select'});
			}

			$(".api_key_container_" + data[i]._id).append(me.createFilter(0));
			me.bindMoreFiltersButton();
		}

		if($(".api_key_div").length === 0) {
			me.onNewKeyButtonClick();
		}
	};

	me.setup_button_handlers = function() {
		//me.bind_more_filters_button();
		$(".twitter_admin_new_key").on('click', $.proxy(me.onNewKeyButtonClick, me));
		$(".twitter_admin_save_button").on('click', $.proxy(me.onSaveButtonClick, me));
		$(".twitter_admin_cancel_button").on('click', $.proxy(me.onCancelButtonClick, me));
	};

	me.bindMoreFiltersButton = function() {
		var me = this;
		$(".add_more_filters_button").on('click', $.proxy(me.onAddFilters, me));
	}

	me.onAddFilters = function() {
		console.log("hit");

		$(".add_more_filters_button").remove();
		var filter_label = $(".base_filter_label");
		console.log(filter_label);
		filter_label.text("Filters :");

		var filters = $(".filter_line");
		var filter_count = filters.length;
		var last_filter = $(filters[filter_count -1]);
		last_filter.after(me.createFilter(filter_count));
		me.bindMoreFiltersButton();
	};

	me.onNewKeyButtonClick = function() {
		var currentKeyCount = $(".api_key_div").length;
		var keyContainer = $(".twitter_admin_form");
		keyContainer.append(me.createApiKeyDiv(currentKeyCount));
		me.changeToApiFormButtons(currentKeyCount);
	};

	me.createApiKeyDiv = function(i) {
		var divHtml = '<div class="api_key_div api_key_entry_form api_key_div_' + i + '"> \
						<div class="field_input_line"> \
							<label for="consumer_key_' + i + '">Consumer Key</label> \
							<input name="consumer_key_' + i + '" class="twitter_admin_api_field consumer_key_field"></input> \
						</div> \
						<div class="field_input_line"> \
							<label for="conusmer_secret_' + i + '">Consumer Secret</label> \
							<input name="conusmer_secret_' + i + '" class="twitter_admin_api_field consumer_secret_field"></input> \
						</div> \
						<div class="field_input_line"> \
							<label for="access_token_key_' + i + '">Access Token Key</label> \
							<input name="access_token_key_' + i + '" class="twitter_admin_api_field access_token_key_field"></input> \
						</div> \
						<div class="field_input_line"> \
							<label for="access_token_secret_' + i + '">Access Token Secret</label> \
							<input name="acesss_token_secret_' + i + '" class="twitter_admin_api_field access_token_secret_field"></input> \
						</div> \
					   </div>';
		return divHtml;
	};

	me.changeToApiFormButtons = function(currentCount) {
		$(".twitter_admin_new_key").hide();
		$(".twitter_admin_save_button").show();
		if(currentCount > 0) {
			$(".twitter_admin_cancel_button").show();
		}
	};

	me.changeToNewButton = function() {
		$(".twitter_admin_new_key").show();
		$(".twitter_admin_save_button").hide();
		$(".twitter_admin_cancel_button").hide();
	}

	me.onSaveButtonClick = function() {

		apiFields = {};

		apiFields.consumer_key = $("input.consumer_key_field").val();
		apiFields.consumer_secret = $("input.consumer_secret_field").val();
		apiFields.access_token_key = $("input.access_token_key_field").val();
		apiFields.access_token_secret = $("input.access_token_secret_field").val();

		var url = 'http://localhost:8081/twitter-ingest/';
		console.log({url: url, data: apiFields});
		$.ajax({
			type: "POST",
			url: "./post_relay.php",
			data: JSON.stringify({url: url, data: apiFields}),
			success: $.proxy(me.onKeySaveSuccess, me),
			error: $.proxy(me.onKeySaveError, me)
		});
	};

	me.onKeySaveSuccess = function(data, status, jqXHR) {
		//figure out id
		json = JSON.parse(data);
		newId = json._id;
		//kill form
		$(".api_key_entry_form").remove();
		//add id line with down arrow and x icon
		var currentKeyCount = $(".api_key_div").length;
		var keyContainer = $(".twitter_admin_form");
		keyContainer.append(me.createApiIdDiv(currentKeyCount, newId));
		$('.toggle').toggles({type:'select'});
		//add form
	};

	me.createApiIdDiv = function(i, id) {
		var divHtml = '<div class="api_key_container_block api_key_container_' + id + '"> \
						<div class="api_key_div api_key_display_line api_key_div_' + id + '"> \
							<div class="api_id_display">' + id + '</div> \
							<div class="buttons_container_div buttons_container_div_' + id + '"> \
								<div class="toggle-dark toggle-dark-' + id + '"> \
	      							<div class="toggle toggle-select toggle-select-' + id + '" data-type="select"> \
	    							</div> \
	    						</div> \
	    						<div class="api_down_arrow api_down_arrow_' + id + '"> \
								</div> \
							</div> \
						</div> \
					   </div>';
		return divHtml;
	};

	me.onKeySaveError = function(jqXHR, textStatus, errorThrown) {
		$(".twitter_admin_alert").text(errorThrown);
	};

	//TODO edit api key
	//on down arrow display

	me.onCancelButtonClick = function() {
		$(".api_key_entry_form").remove();
		me.changeToNewButton();
	};

	me.createFilter = function(i) {

		var filter_html ='<div class="filter_line"> \
			<label for="filter_' + i + '" ' + (i === 0 ? 'class="base_filter_label">Filter' : '>') + '</label> \
			<input name="filter_' + i + '" class="twitter_admin_filter filter_field_with_more_button multi_filter" /> \
			<button type="button" class="add_more_filters_button">+</button> \
			</div>';

		return filter_html
	}
};

