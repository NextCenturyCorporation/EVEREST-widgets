var raw_data_widget = {};

var max_rows = 10;
var url = 'http://everest-build:8081/rawfeed/';
var raw_data_table, datas_to_use = [], table = null;

function initTable(data){
	datas_to_use = (data === [] ? {} : data);
	
	console.log("CREATING table of " + datas_to_use + "with a max number of rows of " + max_rows);
	
	raw_data_table = new data_table(datas_to_use, function(announcement) {
		OWF.Eventing.publish("com.nextcentury.everest.data_table_announcing.raw_data", announcement);
	}, max_rows);
	console.log(max_rows);
		
	raw_data_table.createHeaders(Object.keys(raw_data_table.datas[0]));
	table = raw_data_table.createTable(raw_data_table.MIN,raw_data_table.MAX);	//LOCATION OF RENDER TABLE
	raw_data_table.createClickers();
	raw_data_table.setLocations();
	raw_data_table.execute();
};

raw_data_widget.execute = function() {
	
	d3.selectAll("input").on("change", function(){
		raw_data_table.setMaxRows(parseInt(this.value,10));
		raw_data_table.page = 0;
		table.render();	//LOCATION OF RENDER TABLE
	});

	$.getJSON(url + "?callback=?", function(data){
		if (data !== []){
			//datas_to_use = data.slice(0, max_rows);
			datas_to_use = data;
					
			initTable(datas_to_use);//LOCATION OF RENDER TABLE

			owfdojo.addOnLoad(function(){
				OWF.ready(function(){
					setInterval(raw_data_table.resetAndSend, 10000);					//to be removed later on, and put back clearing into resetAndSend
			
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
	
	//look for changes and add them to table, no new table creations
	setInterval(function(){
		$.getJSON(url + "?callback=?", function(data){
			
			
			if (data !== [] && data.length !== datas_to_use.length){
				var diff = data.length - datas_to_use.length - 1;
			
				if (!table ){
					initTable(data);//LOCATION OF RENDER TABLE
					datas_to_use = data;
				} else {
					var new_data = data.slice(datas_to_use.length, data.length);
					for (var i = 0; i <= diff; i++){
						table.addSentence(new_data[i]);
					}
					datas_to_use = data;					
				}
			}
		});
	}, 2500);
};
