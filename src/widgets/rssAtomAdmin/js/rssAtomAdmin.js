//Base URL of the server the widget is located at.
var baseURL = "http://localhost:8081";

$(function() {
	var rssAdmin = new rssAtomAdmin();

	$("#add-feed").on("click", function () {
		rssAdmin.addFieldHandler();
	});
	$("#start-all-feeds").on("click", function () {
		$.post(baseURL+"/atom-rss-ingest/start");
		rssAdmin.changeCSSGreen($("#feed-rows").find(".row").find("#rss-url"));
		$("#feed-rows").find(".row").find("#start-stop-feed-option a").text("Stop Feed");
	});

	$("#stop-all-feeds").on("click", function () {
		$.post(baseURL+"/atom-rss-ingest/stop");
		rssAdmin.changeCSSWhite($("#feed-rows").find(".row").find("#rss-url"));
		$("#feed-rows").find(".row").find("#start-stop-feed-option a").text("Start Feed");
	});

	//This pre-populates all of the fields with whatever feeds are already in the database.
	var list = $.ajax({
		type: 'GET',
	    url: baseURL+"/atom-rss-ingest"
	});
	list.done(function(result) {
		if(result && result.length > 0) {
			$.each(result, function(i, field) {
				rssAdmin.addFieldHandler(field.feed_url,field.polling_interval, field.feed_active, field._id);
			});
			var rows = $("#feed-rows").find(".row");
			rows.each(function(index, elem) {
				if($(elem).attr("active") === "true") {
					rssAdmin.changeCSSGreen($(elem).find("#rss-url"));
					$(elem).find("#start-stop-feed-option a").text("Stop Feed");
				}
				$(elem).find("#create-option").remove();
				$(elem).find("#create-and-start-option").remove();
			});
		} else {
			rssAdmin.addFieldHandler();
		}
    	
	});
	list.fail(function() {
		rssAdmin.addFieldHandler();
	});
});

var rssAtomAdmin = function() {
	var self =this;

	//Strings used to dynamically generate certain fields.
	var defaultMessage = '<div class="alert alert-info">Enter the URL for each RSS stream you want to collect below.</div>';

	var alertSuccess = '<div class="alert alert-success">Feed Sucessfully Started.</div>';

	var alertStopped = '<div class="alert alert-warning">Feed Has Been Stopped.</div>';

	//This is a row comprised of the RSS URL polling interval and an Actions Drop Down
	var RssInputFields = function(url, interval, active, feedID) {
		url = url || '';
		active = active || false;
		feedID = feedID || 1;
		return '<div class="row" id='+ feedID +' active='+active+'>'+
		'<div class="col-xs-1"></div>'+
		'<div class="col-xs-6">'+
			'<input id="rss-url" type="text"  data-placement="bottom" data-original-title="URL of the RSS/ATOM feed." class="form-control" placeholder="Enter RSS URL ..." value='+ url + '>'+
		'</div>'+
		'<div class="col-xs-2">'+
			'<input id="rss-interval"type="number" data-placement="bottom" data-original-title="How often you would like to poll the stream (in minutes)." class="form-control" placeholder="Interval" value='+ interval + '>'+
		'</div>'+
		'<div class="col-xs-2">'+
			'<div class="btn-group dropup">'+
				'<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">'+'Action <span class="glyphicon glyphicon-chevron-down"></span></button>'+
				'<ul class="dropdown-menu" role="menu">'+
				    '<li id="create-option"><a href="#">Create Feed</a></li>'+
				    '<li id="create-and-start-option"><a href="#">Create and Start Feed</a></li>'+
				    '<li id="remove-feed-option"><a href="#">Remove Feed</a></li>'+
				    '<li class="divider"></li>'+
				    '<li id="start-stop-feed-option"><a href="#">Start Feed</a></li>'+
			  '</ul>'+
			'</div>'+
		'</div>'+
		'<div class="col-xs-1"></div>'+
	'</div>';
	};

	var numFields =  function() {
		return $(".row").length -3;
	};

	self.addFieldHandler = function(url, interval, active, feedID) {
		interval = interval || 300000;
		interval = Math.floor(interval/60000);
		$("#remove-feed-option").removeClass();
		$("#feed-rows").append(RssInputFields(url, interval, active,feedID));
		$(".dropdown-menu li a").off("click");
		checkLastRow();
		$(".dropdown-menu li a").on("click", function () {
			var selectedValue = $(this).text();
			var rssField =  $(this).closest(".row").find("#rss-url").val();
			var intervalField =  $(this).closest(".row").find("#rss-interval").val();
			if(selectedValue === "Create Feed") {
				if(rssField && validURL(rssField)) {
					createFeedClickHandler($(this), rssField, intervalField, false);
				} else {
					toggleAlertMessage(true);
				}
			} else if (selectedValue === "Create and Start Feed"){
				if(rssField && validURL(rssField)) {
					createFeedClickHandler($(this), rssField, intervalField, true);
				} else {
					toggleAlertMessage(true);
				}
			} else if (selectedValue === "Remove Feed") {
				if(numFields() > 1) {
					var closestRow = $(this).closest(".row").eq(0).attr('id');
					removeFeed(closestRow);
					$(this).closest(".row").remove();
					checkLastRow();
				} 
			} else {
				console.log("Selected Option:"+ selectedValue);
				self.toggleStartStop($(this));
			}
		});
	};

	self.toggleStartStop = function(element, start) {
		var currRow = $(element).closest(".row");
		var currRowID = currRow.attr('id');
		var textField = currRow.find("#rss-url");
		if($(element).text() === "Start Feed") {
			startFeed(currRowID);
			self.changeCSSGreen(textField);
			$(element).text("Stop Feed");
		} else {
			stopFeed(currRowID);
			self.changeCSSWhite(textField);
			$(element).text("Start Feed");
		}
	};

	self.changeCSSGreen = function(element) {
		$(element).css({"background-color": "rgb(152,251,152)"});
	};

	self.changeCSSWhite = function(element) {
		$(element).css({"background-color": "#fff"});
	};

	var createFeedClickHandler = function(element, rssField, intervalField, start) {
		var temp = $(element).parent().parent();
		if(start) {
			self.changeCSSGreen($(element).closest(".row").find("#rss-url"));
			createFeedAjax($(element).closest(".row"), rssField, intervalField, true);
		} else {
			createFeedAjax(element, rssField, intervalField, false);
		}
		toggleAlertMessage();
		$(temp).find("#create-and-start-option").remove();	
		$(temp).find("#create-option").remove();
		
	};

	var toggleAlertMessage = function(alert) {
		if(alert) {
			$("#info-alert").hide();
			$("#error-alert").show();
		} else {
			$("#info-alert").show();
			$("#error-alert").hide();
		}
	}

	var checkLastRow = function() {
		if(numFields() <= 1) {
			$("#remove-feed-option").addClass('disabled');
		}
	};

	var createFeedAjax = function(element, url, interval, feedStarted) {
		interval = interval || 1;
		interval *= 60000;
		//This pre-populates all of the fields with whatever feeds are already in the database.
		var create = $.ajax({
			type: 'POST',
		    url: baseURL+"/atom-rss-ingest",
		    data: {"feed_url":url, "feed_active": feedStarted, "polling_interval":interval}
		});
		//This is a way to guarentee that the item row that is created will have the item id
		create.done(function(result) {
			console.log(result);
			var getCreated = $.ajax({
				type: 'GET',
			    url: baseURL+"/atom-rss-ingest",

			});
			getCreated.done(function(list) {
				var createdItemID = $(list).eq(list.length-1).attr("_id");
				var row = $(".row").filter(function() {
					return $(this).attr("id") == 1;
				});
				row.attr("id", createdItemID);
			});
		});
	}

	var removeFeed = function(id) {
		$.ajax({
		    url: baseURL+"/atom-rss-ingest/" + id,
		    type: 'DELETE',
		});
	};

	var startFeed = function(id) {
		$.ajax({
		    url: baseURL+"/atom-rss-ingest/start/" + id,
		    type: 'POST',
		});
	};

	var stopFeed = function(id) {
		$.ajax({
		    url: baseURL+"/atom-rss-ingest/stop/" + id,
		    type: 'POST',
		});
	};

	function validURL(str) {
		var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
	    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
	    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
	    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
	    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
	    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
		return pattern.test(str);
	}
};

