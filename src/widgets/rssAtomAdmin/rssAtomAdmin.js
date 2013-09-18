//Base URL of the server the widget is located at.
var baseURL = "http://localhost:8081";


$(function() {
	$("#add-feed").on("click", function () {
			addFieldHandler();
	});
	$("#start-all-feeds").on("click", function () {
		$.post( baseURL+"/atom-rss-ingest/start");
		$("#feed-rows").find(".row").find("#rss-url").css({"background-color": "rgb(152,251,152)"});
			console.log("start");
	});

	$("#stop-all-feeds").on("click", function () {
		$.post( baseURL+"/atom-rss-ingest/stop");
		$("#feed-rows").find(".row").find("#rss-url").css({"background-color": "#fff"});
			console.log("stop");
	});
	var list = $.ajax({
		type: 'GET',
	    url: baseURL+"/atom-rss-ingest"
	});
	list.done(function(result) {
	    	$.each(result, function(i, field) {
				addFieldHandler(field.feed_url,field.polling_interval, field.feed_active, field._id);
			});
			$.each($("#feed-rows").find(".row"), function(i, field) {
				console.log(field);	
			});
	});
	list.fail(function() {
		addFieldHandler();
	});
	
});

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
			    '<li><a href="#">Create Feed</a></li>'+
			    '<li><a href="#">Create and Start Feed</a></li>'+
			    '<li id="remove-feed-option"><a href="#">Remove Feed</a></li>'+
			    '<li class="divider"></li>'+
			    '<li><a href="#">Start/Stop Feed</a></li>'+
		  '</ul>'+
		'</div>'+
	'</div>'+
	'<div class="col-xs-1"></div>'+
'</div>';
};

var numFields =  function() {
	return $(".row").length -3;
};

var addFieldHandler = function(url, interval, active, feedID) {
	interval = interval || 300000;
	interval = Math.floor(interval/60000);
	console.log(interval);
	$("#remove-feed-option").removeClass();
	$("#feed-rows").append(RssInputFields(url, interval, active,feedID));
	$(".dropdown-menu li a").off("click");
	checkLastRow();
	$(".dropdown-menu li a").on("click", function () {
		var selectedValue = $(this).text();
		var rssField =  $(this).closest(".row").find("#rss-url").val();
		var intervalField =  $(this).closest(".row").find("#rss-interval").val();
		console.log($("#feed-rows"));
			console.log(rssField);
			console.log(intervalField);
			 if(selectedValue === "Create Feed") {
			 	console.log("Selected Option:"+ selectedValue);
			 	createFeed(rssField, intervalField);
			 } else if (selectedValue === "Create and Start Feed"){
			 	$(this).closest(".row").find("#rss-url").css({"background-color": "rgb(152,251,152)"});
			 	createAndStartFeed(rssField, intervalField);
			 	console.log("Selected Option:"+ selectedValue);
			 } else if (selectedValue === "Remove Feed") {
			 	if(numFields() > 1) {
			 		var closestRow = $(this).closest(".row").eq(0).attr('id');
			 		removeFeed(closestRow);
			 		$(this).closest(".row").remove();
			 		checkLastRow();
			 	}
			 	console.log("Selected Option:"+ selectedValue);
			 } else {
			 	console.log("Selected Option:"+ selectedValue);
			 }
	});
};

var checkLastRow = function() {
	if(numFields() <= 1) {
			$("#remove-feed-option").addClass('disabled');
		}
};

var createFeed = function(url, interval) {
	$.post(baseURL+"/atom-rss-ingest", {"feed_url":url, "feed_active": false, "polling_interval":interval});
};
var micah = function(data, status, jqXHR) {
	console.log(data);
	console.log(status);
	console.log(jqXHR);
};

var createAndStartFeed = function(url, interval) {
	 interval = interval || 1;
	 interval *= 60000;
	 console.log(interval);
	$.post(baseURL+"/atom-rss-ingest", {"feed_url":url, "feed_active": true, "polling_interval":interval});
};

var removeFeed = function(id) {
	$.ajax({
	    url: baseURL+"/atom-rss-ingest/" + id,
	    type: 'DELETE',
	});
};