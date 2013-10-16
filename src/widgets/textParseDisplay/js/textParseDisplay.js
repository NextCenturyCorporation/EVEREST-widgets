var textParseDisplay = function() {
	var me = this;

	me.template = null;

	me.execute = function() {
		me.loadTemplate();

		me.setup_view();

		me.display_view = new me.Parse_Result_View({el: $(".text_parse_display_container")[0]});
	};

	me.loadTemplate = function() {
		if($("#template_text_parse_display").length === 0) {
			$("head").append(
				'<script id="template_text_parse_display" type="text/template">' +
					'<div class="parser_tab_container">' +
						'<ul class="nav nav-tabs" data-tabs="tabs">' +
	  						'<li><a data-toggle="tab" href="#parse_selection_text">Select Text</a></li>' +
	  						'<li class="active"><a data-toggle="tab" href="#parse_free_text">Free Form Text</a></li>' +
						'</ul>' +
						'<div class="tab-content">' +
							'<div class="tab-pane" id="parse_selection_text"></div>' +
							'<div class="tab-pane active" id="parse_free_text">' +
								'<div style="height:10px;"></div>' +
								'<div class="row parse-form-row">' +
									'<div class="col-xs-1"></div>' + 
									'<form role="form" class="col-xs-10">' +
										'<div class="form-group">' + 
											'<div class="row">' +
												'<label for="parser-text-input-field" class="col-xs-1">Text:</label>' +
	    										'<textarea class="col-xs-11 free-form-text-area" rows="3" id="parser-text-input-field"></textarea>' +
    										'</div>' +
    										'<div class="row" style="margin-top:10px;">' +
												'<div class="col-xs-11"></div>' +
												'<div class="col-xs-1" style="padding-right:0px;">' +
													'<button type="button" class="parser-submit-free-form-text" style="float:right;">Parse</button>' +
												'</div>' +
											'</div>' +
										'</div>' +
									'</form>'+
									'<div class="col-xs-1"></div>' + 
								'</div>' +
								'<div class="row free-parse-results-display">' +
								'</div>' +
							'</div>' +
						'</ul>' +
					'</div>' +
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

				this.bindHandlers();

			},

			bindHandlers: function() {
				$(".parser-submit-free-form-text").on('click', me.handleFreeFormParseClick);
			}

		});
	};

	me.handleFreeFormParseClick = function() {
		//remove response block
		$(".free-parse-results-display").empty();
		$(".free-parse-results-display").append('' +
			'<div class="col-xs-5"></div>' +
			'<div class="col-xs-2">' +
				'<img src="./lib/ajax-loader.gif">' +	
			'</div>' +
			'<div class="col-xs-5"></div>');
		//get text field contents
		var text = $(".free-form-text-area").val();
		console.log(text);

		var url = "http://localhost:5454/nlp-parser/full-parse-result";
		var data = {text: text};
		//post
		$.ajax({
			type: "POST",
			url: "./post_relay.php",
			data: JSON.stringify({url: url, data: data, method: "POST"}),
			success: me.handleResponseSuccess,
			error: function() {console.log("error");}
		});
	};

	me.handleResponseSuccess = function(data, stringResult, xhr) {
		var sentenceCount = Math.max.apply(null, [
			data.annotation.length,
			data.dependency.length,
			data.dot_product.length,
			data.edge_vertex.length,
			data.pos.length,
			data.root_child_data.length
		]);

		$(".free-parse-results-display").empty();
		
		$(".free-parse-results-display").append('' +
			'<div class="row">' +
				'<div class="col-xs-1"></div>' +
				'<div class="col-xs-2">' +
					'<label>Extracted tuple' + (data.tuples.length > i+1 ? 's' : '') + ':</label>' +
				'</div>' +	
				'<div class="col-xs-8 free-parse-results-display-tuple-div">' +
				'</div>' +
				'<div class="col-xs-1"></div>' +
				'</div>');

		if(data.tuples.length > 0) {
			var i = 0;
			for(i = 0; i < data.tuples.length; i++) {
				$(".free-parse-results-display .free-parse-results-display-tuple-div").append('' +
							'{<br/>' +
							'&nbsp;&nbsp;&nbsp;&nbsp;Entity1: ' + data.tuples[i].entity1 +',<br/>' +
							'&nbsp;&nbsp;&nbsp;&nbsp;Relationship: ' + data.tuples[i].relationship + ',<br/>' +
							'&nbsp;&nbsp;&nbsp;&nbsp;Entity2: ' + data.tuples[i].entity2 + '<br/>' +
							'}' + (data.tuples.length > i+1 ? ', ' : ''));
			}
		} else {
			$(".free-parse-results-display .free-parse-results-display-tuple-div").append('No tuples found');
		}
		
		for(var i = 0; i < sentenceCount; i++) {
			$(".free-parse-results-display").append('' +
				'<div class="row">' +
					'<div class="col-xs-1"></div>' +
					'<div class="col-xs-2">' +
						'<label>POS Tagged:</label>' +
					'</div>' +	
					'<div class="col-xs-8">' +
						data.pos[i] +
					'</div>' +
					'<div class="col-xs-5"></div>' +
				'</div>');

			$(".free-parse-results-display").append('' +
				'<div class="row">' +
					'<div class="col-xs-1"></div>' +
					'<div class="col-xs-2">' +
						'<label>Annotation:</label>' +
					'</div>' +	
					'<div class="col-xs-8">' +
						data.annotation[i].replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;&nbsp;") +
					'</div>' +
					'<div class="col-xs-5"></div>' +
				'</div>');

			$(".free-parse-results-display").append('' +
				'<div class="row">' +
					'<div class="col-xs-1"></div>' +
					'<div class="col-xs-2">' +
						'<label>Dependency tree:</label>' +
					'</div>' +	
					'<div class="col-xs-8">' +
						data.dependency[i].replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;&nbsp;") +
					'</div>' +
					'<div class="col-xs-5"></div>' +
				'</div>');

			$(".free-parse-results-display").append('' +
				'<div class="row">' +
					'<div class="col-xs-1"></div>' +
					'<div class="col-xs-2">' +
						'<label>Root and Children:</label>' +
					'</div>' +	
					'<div class="col-xs-8">' +
						data.root_child_data[i].replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;&nbsp;") +
					'</div>' +
					'<div class="col-xs-5"></div>' +
				'</div>');

			$(".free-parse-results-display").append('' +
				'<div class="row">' +
					'<div class="col-xs-1"></div>' +
					'<div class="col-xs-2">' +
						'<label>Dot Product:</label>' +
					'</div>' +	
					'<div class="col-xs-8">' +
						data.dot_product[i].replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;&nbsp;") +
					'</div>' +
					'<div class="col-xs-5"></div>' +
				'</div>');

			$(".free-parse-results-display").append('' +
				'<div class="row">' +
					'<div class="col-xs-1"></div>' +
					'<div class="col-xs-2">' +
						'<label>Edges and Vetices:</label>' +
					'</div>' +	
					'<div class="col-xs-8">' +
						data.edge_vertex[i].replace(/\n/g, "<br/>").replace(/ /g, "&nbsp;&nbsp;") +
					'</div>' +
					'<div class="col-xs-5"></div>' +
				'</div>');

			$(".free-parse-results-display").append('<br/><br/>');
		}
	};
};

