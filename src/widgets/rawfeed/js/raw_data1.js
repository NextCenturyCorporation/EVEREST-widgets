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
		table = raw_data_table.createTable(raw_data_table.MIN,raw_data_table.MAX, false);
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
						raw_data_table.createTable(Date.parse(range[0]), Date.parse(range[1]), true);
						raw_data_table.resetAndSend();
						$('#start').val('');
						$('#end').val('');
					});
				});
			});
		}
	});
	
	//look for changes and add them to table, no new table creations
	setInterval(function(){
		getDataCallback({count: max_items, offset: raw_data_table.offset, sort: raw_data_table.sort}, function(data){
			if (data.raw_feeds !== []){
			
				if ( !table ){
					initTable(data.raw_feeds, data.total_count);
					datas_to_use = data.raw_feeds;
				} else {
					var tdata = [];
					var tdatas_to_use = [];
					
					data.raw_feeds.forEach(function(d, i){
						tdata[i] = JSON.stringify(d);
					});
					
					raw_data_table.datas.forEach(function(d, i){
						tdatas_to_use[i] = JSON.stringify(d);
					});	
					
					var new_data = $(tdata).not(tdatas_to_use);
					for (var i = 0; i < new_data.length; i++){
						table.addSentence(JSON.parse(new_data[i]));
					};
										
					tdata = [];
					tdatas_to_use = [];
				}
			}
		});
	}, 10000);
};
