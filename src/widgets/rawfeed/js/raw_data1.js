var raw_data_widget1 = {};

var max_rows = 10;
var max_items = 1000;
var url = 'http://everest-build:8081/rawfeed';
var raw_data_table;
var datas_to_use = [];
var intervalID = -1;

var getIndexes = function(callback){
	$.ajax({
		type: "GET",
		url: url + '/indexes',
		dataType: 'jsonp',
		jsonpCallback: 'callback',
		success: callback,
		error: function(){
			console.log('error');
		}
	});
};

var announceCallback = function(announcement){
	OWF.Eventing.publish("com.nextcentury.everest.data_table_announcing.raw_data", announcement);
};

var getDataCallback = function(params, successCallback){
	var newUrl = url + '?';
	var keys = Object.keys(params);
	keys.forEach(function(k){
		newUrl += k + '=' + params[k] + '&';
	});
	
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
		
	raw_data_table = new data_table1(datas_to_use, announceCallback, getDataCallback, max_rows, max_items, length);
	
	if (raw_data_table.datas.length > 0){
		getIndexes(function(data){
			raw_data_table.createHeaders(Object.keys(raw_data_table.datas[0]), data);
			raw_data_table.createTable();
			raw_data_table.createClickers();
		});
	}
}

raw_data_widget1.execute = function() {

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
						$('#data_table_start').val('');
						$('#data_table_end').val('');
					});
					
					//I don't think this works at the moment....
					//lines 109 - 149 can be removed when this works
					OWF.Eventing.subscribe("com.nextcentury.everest.data.workflow", function(sender, msg){
						//makesure msg.data is of the type you're expecting...
						if (typeof(msg.data) !== 'string'){
							raw_data_table.currentTableView.addSentence(msg.data);
						}
					});
				});
			});
		}
	});
	
	//look for changes and add them to table, no new table creations
	d3.select('.start').on('click', function(){
		if (intervalID === -1){
			intervalID = setInterval(function(){
				getDataCallback({count: max_items, offset: raw_data_table.offset, sort: raw_data_table.sort}, function(data){
					if (data.raw_feeds !== []){
					
						if ( !raw_data_table.currentTableView ){
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
								raw_data_table.currentTableView.addSentence(JSON.parse(new_data[i]));
							};

							tdata = [];
							tdatas_to_use = [];
						}
					}
				});
			}, 5000);
		}
	});
	
	d3.select('.stop').on('click', function(){
		clearInterval(intervalID);
		intervalID = -1;
	});
};
