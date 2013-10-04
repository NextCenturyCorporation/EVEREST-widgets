var twitter_admin = function() {
	var me = this;

	me.template = null;

	me.execute = function() {
		me.loadTemplate();

		me.setup_view();

		me.admin_view = new me.Admin_View({el: $(".twitter_admin_container")[0]});
	};

	me.loadTemplate = function() {
		if($("#template_twitter_admin").length === 0) {
			$("head").append(
				'<script id="template_twitter_admin" type="text/template">'+
					'<div class="twitter_admin_alert"></div>'+
					'<div class="twitter_admin_sub_alert"></div>'+
					'<div class="twitter_filter_form">'+
					'</div>'+
					'<div class="twitter_admin_form">'+
					'</div>'+
					'<div class="twitter_admin_buttons_div">'+
						'<div class="button_inner_div">'+
							'<button type="button" class="twitter_admin_new_key">New Key</button>'+
							'<button type="button" class="twitter_admin_save_button">Save Key</button>'+
							'<button type="button" class="twitter_admin_cancel_button">Cancel</button>'+
						'</div>'+
					'</div>'+
				'</script>');
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
				
				var url = 'http://everest-build:8081/twitter-ingest/';
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
				var id = data[i]._id;
				var keyContainer = $(".twitter_filter_form");
				keyContainer.append(me.createApiIdDiv($(".api_key_div").length, id));
				
				me.createToggle(id, data[i].active);
				me.bindDeleteHandler(id);
				
				var filter = me.createFilter(0, id);
				filter += '<hr class="filter_hr" />';
				$(".api_key_container_" + id).append(filter);
				
				me.bindMoreFiltersButton(id);

			}
		}

		if($(".api_key_div").length === 0) {
			me.onNewKeyButtonClick();
		}
	};

	me.createToggle = function(id, active) {
		$('.toggle-select-'+id).toggles({type:'select', on: active});
		me.bindToggleHandler(id);
	};

	me.bindDeleteHandler = function(id) {
		$(".api_delete_img_" + id).click(function() {
			me.handleDeleteClick(id);
		});
	};

	me.bindToggleHandler = function(id) {
		$('.toggle-select-' + id).on('toggle', function(e, active) {
			me.handleToggle(id, active);
		});
	};

	me.handleToggle = function(id, active) {
		if(active) {

			var url = 'http://everest-build:8081/twitter-ingest/start/' + id;

			//get filters
			var fields = $(".twitter_admin_filter_"+id).val();
			
			$.ajax({
				type: "POST",
				url: "./post_relay.php",
				data: JSON.stringify({url: url, data: {filters: fields}, method: "POST"}),
				success: function() {console.log("success");},
				error: function() {console.log("error");}
			});

			//TODO gray filters
			$(".twitter_admin_filter_" + id).attr('disabled', 'disabled');
		} else {
			//stop call
			var url = 'http://everest-build:8081/twitter-ingest/stop/' + id;

			$.ajax({
				type: "POST",
				url: "./post_relay.php",
				data: JSON.stringify({url: url, data: null, method: "POST"}),
				success: function() {console.log("success");},
				error: function() {console.log("error");}
			});

			//TODO unlock filters
			$(".twitter_admin_filter_" + id).removeAttr('disabled');
		}
	};

	me.setup_button_handlers = function() {
		$(".twitter_admin_new_key").on('click', $.proxy(me.onNewKeyButtonClick, me));
		$(".twitter_admin_save_button").on('click', $.proxy(me.onSaveButtonClick, me));
		$(".twitter_admin_cancel_button").on('click', $.proxy(me.onCancelButtonClick, me));
	};

	me.bindMoreFiltersButton = function(id) {
		var me = this;
		$(".add_more_filters_button_"+id).on('click', function() {
			me.onAddFilters(id);
		});
	};

	me.onAddFilters = function(id) {
		$(".add_more_filters_button_"+id).remove();
		$(".filter_line_"+id+">.filter_item_div>.filter_field_with_more_button").removeClass("filter_field_with_more_button").addClass("filter_field_with_no_button");
		var filter_label = $(".filter_line_"+id+">.base_filter_label");
		filter_label.text("Filters :");

		var filters = $(".filter_line_"+id);
		var filter_count = filters.length;
		var last_filter = $(filters[filter_count -1]);
		last_filter.after(me.createFilter(filter_count, id));
		me.bindMoreFiltersButton(id);
	};

	me.onNewKeyButtonClick = function() {
		var currentKeyCount = $(".api_key_div").length;
		var keyContainer = $(".twitter_filter_form");
		keyContainer.append(me.createApiKeyDiv(currentKeyCount));
		me.changeToApiFormButtons(currentKeyCount);
	};

	me.createApiKeyDiv = function(i) {
		var divHtml = '<div class="api_key_div api_key_entry_form api_key_div_' + i + '"> \
							<hr /> \
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
	};

	me.onSaveButtonClick = function() {

		apiFields = {};

		apiFields.consumer_key = $("input.consumer_key_field").val();
		apiFields.consumer_secret = $("input.consumer_secret_field").val();
		apiFields.access_token_key = $("input.access_token_key_field").val();
		apiFields.access_token_secret = $("input.access_token_secret_field").val();

		var url = 'http://everest-build:8081/twitter-ingest/';
		$.ajax({
			type: "POST",
			url: "./post_relay.php",
			data: JSON.stringify({url: url, data: apiFields, method: "POST"}),
			success: $.proxy(me.onKeySaveSuccess, me),
			error: $.proxy(me.onKeySaveError, me)
		});
	};

	me.onKeySaveSuccess = function(data, status, jqXHR) {
		id = data._id;

		$(".api_key_entry_form").remove();
		//add id line with down arrow and x icon
		var currentKeyCount = $(".api_key_div").length;
		var keyContainer = $(".twitter_admin_form");
		keyContainer.append(me.createApiIdDiv(currentKeyCount, id));
		me.createToggle(id, data.active);
		me.bindDeleteHandler(id);

		$(".api_key_container_" + id).append(me.createFilter(0, id));
		me.bindMoreFiltersButton(id);
		
		me.changeToNewButton();
	};

	me.handleDeleteClick = function(id) {
		//TODO

		//make request
		var url = 'http://everest-build:8081/twitter-ingest/' + id;

		$.ajax({
			type: "POST",
			url: "./post_relay.php",
			data: JSON.stringify({url: url, data: null, method: "DELETE"}),
			success: function() {
				me.handleDeleteSuccess(id);
			},
			error: function() {
				me.handleDeleteError(id);
			}
		});
	};

	me.handleDeleteSuccess = function(id) {
		$(".api_key_container_" + id).remove();
	};

	me.handleDeleteError = function(id) {
		$(".twitter_admin_alert").text("Error: error deleting " + id);
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
	    						<div class="api_delete_img api_delete_img_' + id + '"> \
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
	//TODO on down arrow display

	me.onCancelButtonClick = function() {
		$(".api_key_entry_form").remove();
		me.changeToNewButton();
	};

	me.createFilter = function(i, id) {

		var filter_html ='<div class="filter_line filter_line_' + id + '"> \
				<label for="filter_' + i + '" ' + (i === 0 ? 'class="base_filter_label">Filter' : '>') + '</label> \
				<div class="filter_item_div"> \
					<input name="filter_' + i + '" class="twitter_admin_filter \
						twitter_admin_filter_' + id + ' filter_field_with_more_button multi_filter" /> \
					<button type="button" class="add_more_filters_button add_more_filters_button_' + id + '">+</button> \
				</div> \
			</div>';

		return filter_html;
	};
};

