var twitter_admin = function() {
	var me = this;
	var baseURL = "http://everest-build:8081";
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
					'<div class="twitter_admin_alert alert alert-danger" hidden="true"></div>'+
					'<div class="twitter_admin_sub_alert"></div>'+
					'<div class="twitter_filter_form">'+
					'</div>'+
					'<div class="twitter_admin_form">'+
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
				var url = baseURL + '/twitter-ingest/';
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

	me.getTwitStreamsFilters = function() {
		var url = baseURL + '/twitter-ingest/twitStreams';
		$.ajax({
			type: "GET",
			url: url
		}).done(function(data){
			for(i in data) {
 				if(data[i] && data[i].activeStream && data[i].activeStream.filters) {
					var filters = data[i].activeStream.filters;
					if(!(data[i].activeStream.filters instanceof Array)) {
						filters = data[i].activeStream.filters.split(",");
					} else {
						filters = data[i].activeStream.filters;
					}
					if(filters && filters.length > 0) {
						$(".twitter_admin_filter_" + i).val(filters[0]);
						filters.shift();
						$.each(filters, function(index, value) {
							me.onAddFilters(i);
							$(".twitter_admin_filter_" + i).eq(index+1).val(value);
						});
						$(".twitter_admin_filter_" + i).attr('disabled', 'disabled');
					}
				}	
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
				me.createFilter(0, id);
				filter += '<hr class="filter_hr" />';
				$(".api_key_container_" + id).append(filter);
				
				me.bindMoreFiltersButton(id);
			}
				me.getTwitStreamsFilters();
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
			var url =  baseURL +'/twitter-ingest/start/' + id;
			var fields = [];
			//get filters
			$(".twitter_admin_filter_"+id).each(function(i) {
				fields.push($(this).val());
			});
			$.ajax({
				type: "POST",
				url: "./post_relay.php",
				data: JSON.stringify({url: url, data: {filters: fields.join()}, method: "POST"}),
				success: function() {console.log("success");},
				error: function() {console.log("error");}
			});

			$(".twitter_admin_filter_" + id).attr('disabled', 'disabled');
		} else {
			//stop call
			var url =  baseURL +'/twitter-ingest/stop/' + id;

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
		$("#new-ingest-key").on('click', $.proxy(me.onNewKeyButtonClick, me));

		$("#start-all-feeds").on('click', function() {
			$( ".toggle-select" ).each(function( index ) {
				var apiKeyId = $( this ).attr('class').match(/[0-9]+[a-z0-9]+/gi);
				if(apiKeyId) {
					me.handleToggle(apiKeyId, true);
				}
			});
		});
		$("#stop-all-feeds").on('click', function() {
                        $( ".toggle-select" ).each(function( index ) {
                                var apiKeyId = $( this ).attr('class').match(/[0-9]+[a-z0-9]+/gi);
                                if(apiKeyId) {
                                        me.handleToggle(apiKeyId, false);
                                }
                        });
                });
		
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
		var filter_label = $(".base_filter_label");
		filter_label.text("Filters :");

		var filters = $(".filter_line_"+id);
		var filter_count = filters.length;
		var last_filter = $(filters[filter_count -1]);
		last_filter.after(me.createFilter(filter_count, id));
		me.bindMoreFiltersButton(id);
	};

	me.onNewKeyButtonClick = function() {
		if($("#new-ingest-key").attr('class').toString().indexOf('active') >= 0) {
			var currentKeyCount = $(".api_key_div").length;
			var keyContainer = $(".twitter_filter_form");
			keyContainer.append(me.createApiKeyDiv(currentKeyCount));
			me.changeToApiFormButtons(currentKeyCount);
			$(".twitter_admin_save_button").on('click', $.proxy(me.onSaveButtonClick, me));
			$(".twitter_admin_cancel_button").on('click', $.proxy(me.onCancelButtonClick, me));
		}
	};

	me.createApiKeyDiv = function(i) {
		return '<div class="api_key_div api_key_entry_form api_key_div_' + i + '"> \
			<hr/> \
			<form role="form"> \
			<div class="row"> \
				<div class="col-xs-1"></div> \
				<div class="field_input_line form-group col-xs-10"> \
						<label for="consumer_key_' + i + '" class="control-label">Consumer Key</label> \
						<input id="consumer_key_' + i + '" class="twitter_admin_api_field consumer_key_field form-control"></input> \
				</div> \
			</div> \
			<div class="row"> \
				<div class="col-xs-1"></div> \
				<div class="field_input_line form-group col-xs-10"> \
					<label for="consumer_secret_' + i + '" class="control-label">Consumer Secret</label> \
					<input id="consumer_secret_' + i + '" class="twitter_admin_api_field consumer_secret_field  form-control"></input> \
				</div> \
			</div> \
			<div class="row"> \
				<div class="col-xs-1"></div> \
					<div class="field_input_line form-group col-xs-10"> \
						<label for="access_token_key_' + i + '" class="control-label">Access Token Key</label> \
						<input id="access_token_key_' + i + '" class="twitter_admin_api_field access_token_key_field form-control"></input> \
					</div> \
			</div> \
			<div class="row"> \
				<div class="col-xs-1"></div> \
					<div class="field_input_line form-group col-xs-10"> \
						<label for="access_token_secret_' + i + '" class="control-label">Access Token Secret</label> \
						<input id="access_token_secret_' + i + '" class="twitter_admin_api_field access_token_secret_field form-control"></input> \
					</div> \
			</div> \
			<div class="row"> \
				<div class="col-xs-1"></div> \
					<div class="field_input_line form-group col-xs-10"> \
						<button type="button" class="btn btn-primary twitter_admin_save_button">Save Key</button> \
						<button type="button" class="btn btn-default twitter_admin_cancel_button">Cancel</button> \
					</div> \
			</div> \
			</form> \
		</div>';
	};

	me.changeToApiFormButtons = function(currentCount) {
		$("#new-ingest-key").attr('class','disabled');
		$(".twitter_admin_save_button").show();
		if(currentCount > 0) {
			$(".twitter_admin_cancel_button").show();
		}
	};

	me.changeToNewButton = function() {
		$("#new-ingest-key").attr('class','active');
		$(".twitter_admin_save_button").hide();
		$(".twitter_admin_cancel_button").hide();
	};

	me.onSaveButtonClick = function() {

		apiFields = {};

		apiFields.consumer_key = $(".consumer_key_field").val();
		apiFields.consumer_secret = $(".consumer_secret_field").val();
		apiFields.access_token_key = $(".access_token_key_field").val();
		apiFields.access_token_secret = $(".access_token_secret_field").val();
		var url =  baseURL +'/twitter-ingest/';
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
		var url =  baseURL +'/twitter-ingest/' + id;

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
		$(".twitter_admin_alert").text("Error: error deleting " + id).show();
	};

	me.createApiIdDiv = function(i, id) {
		return '<div class="api_key_container_block api_key_container_' + id + '"> \
			<div class="api_key_div api_key_display_line api_key_div_' + id + '"> \
				<div class="row"> \
					<div class="col-xs-1"></div> \
					<div class="alert alert-success col-xs-10"> \
						<div class="input-group"> \
							<div class="api_id_display ">' + 'API Key ID: '+id + '</div> \
							<div class="btn-group dropup"> \
			</div> \
							<span class="input-group-btn"> \
								<div class="buttons_container_div buttons_container_div_' + id + '"> \
									<div class="toggle-dark toggle-dark-' + id + '"> \
										<div class="toggle toggle-select toggle-select-' + id + '" data-type="select"> \
										</div> \
									</div> \
									<div class="api_delete_img api_delete_img_' + id + '"> \
									</div> \
								</div> \
							</span> \
						</div> \
					</div> \
				</div> \
			</div> \
	   </div>';
	};

	me.onKeySaveError = function(jqXHR, textStatus, errorThrown) {
		$(".twitter_admin_alert").text(errorThrown + ": Could not properly connect/access Twitter Ingests").show();
	};

	//TODO edit api key
	//TODO on down arrow display

	me.onCancelButtonClick = function() {
		$(".api_key_entry_form").remove();
		me.changeToNewButton();
	};

	me.createFilter = function(i, id) {
		return '<div class="filter_line filter_line_' + id + '"> \
			<form role="form" id = "form-'+ id +'"> \
			<div class="col-xs-1"></div> \
			<label for="filter_' + i + '" ' + (i === 0 ? 'class="base_filter_label control-label" >Filter' : '>') + '</label> \
			<div class="row"> \
				<div class="col-xs-1"></div> \
				<div class="field_input_line input-group col-xs-10"> \
					<input id="filter_' + i + '" class="form-control twitter_admin_filter \
							twitter_admin_filter_' + id + ' filter_field_with_more_button multi_filter" /> \
					<span class="input-group-btn"> \
						<button type="button" class="btn btn-default add_more_filters_button_' + id + '">+</button>	\
					</span> \
				</div> \
			</div> \
			</form> \
		</div>';
	};
};
