var raw_data_widget = {};

var max_rows = 10;
var url = 'http://everest-build:8081/rawfeed';
var raw_data_table;
var datas_to_use = [];
var table = null;

var announceCallback = function(announcement){
	OWF.Eventing.publish("com.nextcentury.everest.data_table_announcing.raw_data", announcement);
};

var updateDataCallback = function(successCallback){

	$.ajax({
		type: "GET",
		url: url,
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
		
	raw_data_table = new data_table(datas_to_use, announceCallback, updateDataCallback, max_rows, length);
	
	if (raw_data_table.datas.length > 0){
		raw_data_table.createHeaders(Object.keys(raw_data_table.datas[0]));
		table = raw_data_table.createTable(raw_data_table.MIN,raw_data_table.MAX);
		raw_data_table.createClickers();
	}
}

raw_data_widget.execute = function() {	
	//TODO Add ability to ask for count offset and sort
	$.ajax({
		type: "GET",
		url: url,
		dataType: 'jsonp',
		jsonpCallback: 'callback',
		success: function(data){
			if (data !== []){
				datas_to_use = data.slice(0,1001);
				var length = data.length;
						
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
		},
		error: function(){
			console.log('error');
		}
	});
};
