var raw_data_widget = {};

var max_rows = 10;
var max_items = 1000;
var url = 'http://everest-build:8081/rawfeed';
var raw_data_table;
var datas_to_use = [];
var table = null;

var announceCallback = function(announcement){
	OWF.Eventing.publish("com.nextcentury.everest.data_table_announcing.raw_data", announcement);
};

var getDataCallback = function(params, successCallback){
	var newUrl = url;
	if (params.count){
		newUrl += '?count=' + params.count;
	}
	
	if (params.offset){
		newUrl += '&offset=' + params.offset;
	}
	
	if (params.sort){
		newUrl += '&sort=' + params.sort;
	}

	console.log(newUrl);

	$.ajax({
		type: "GET",
		url: newUrl,
		dataType: 'jsonp',
		jsonpCallback: 'callback',
		success: successCallback,
		error: function(){
			console.log('error');
		}
	});
};

function initTable(data, length){
	datas_to_use = (data === [] ? {} : data);
		
	raw_data_table = new data_table(datas_to_use, announceCallback, getDataCallback, max_rows, max_items, length);
	
	if (raw_data_table.datas.length > 0){
		raw_data_table.createHeaders(Object.keys(raw_data_table.datas[0]));
		table = raw_data_table.createTable(raw_data_table.MIN,raw_data_table.MAX);
		raw_data_table.createClickers();
	}
}

raw_data_widget.execute = function() {

	getDataCallback({count: max_items}, function(data){
		if (data.raw_feeds !== []){
			datas_to_use = data.raw_feeds;
			var length = data.total_count;
					
			initTable(datas_to_use, length);

			owfdojo.addOnLoad(function(){
				OWF.ready(function(){
					//to be removed later on, and put back clearing into resetAndSend
					//UPDATE: set to zero to allow immediate loading of the heatChart widget
					setInterval(raw_data_table.resetAndSend, 10000);
			
					OWF.Eventing.subscribe("com.nextcentury.everest.timeline_announcing", function(sender, msg){
						var range = msg.substring(1,msg.length - 1).split(',');
						raw_data_table.createTable(Date.parse(range[0]), Date.parse(range[1]));
						raw_data_table.resetAndSend();
						$('#start').val('');
						$('#end').val('');
					});
				});
			});
		}
	});
};
