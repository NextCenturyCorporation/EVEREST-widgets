var raw_data_widget = {};

var max_rows = 10;
var url = 'http://everest-build:8081/rawfeed/';
var raw_data_table;
var datas_to_use = [];
var table = null;

function initTable(data){
	datas_to_use = (data === [] ? {} : data);
		
	raw_data_table = new data_table(datas_to_use, function(announcement) {
		OWF.Eventing.publish("com.nextcentury.everest.data_table_announcing.raw_data", announcement);
	}, max_rows);
	
	raw_data_table.createHeaders(Object.keys(raw_data_table.datas[0]));
	table = raw_data_table.createTable(raw_data_table.MIN,raw_data_table.MAX);
	raw_data_table.createClickers();
	raw_data_table.setLocations();
	//raw_data_table.adjustDataWidths();
	raw_data_table.execute();
};

raw_data_widget.execute = function() {
	
	d3.selectAll('input').on('change', function(){
		raw_data_table.setMaxRows(parseInt(this.value,10));
		raw_data_table.page = 0;
		table.render();
	});

	$.getJSON(url + "?callback=?", function(data){
		if (data !== []){
			datas_to_use = data;
					
			initTable(datas_to_use);

			owfdojo.addOnLoad(function(){
				OWF.ready(function(){
					//to be removed later on, and put back clearing into resetAndSend
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
	
	//look for changes and add them to table, no new table creations
	setInterval(function(){
		$.getJSON(url + "?callback=?", function(data){
			
			if (data !== []){
			
				if (!table ){
					initTable(data);
					datas_to_use = data;
				} else {
					var new_data = [];
					var tdata = [];
					var tdatas_to_use = [];
					
					for (var m = 0; m < data.length; m++){
						tdata[m] = JSON.stringify(data[m]);
					}
					
					for (m = 0; m < datas_to_use.length; m++){
						tdatas_to_use[m] = JSON.stringify(datas_to_use[m]);
					}
					
					new_data = $(tdata).not(tdatas_to_use);
					
					for(m = 0; m < new_data.length; m++){
						new_data[m] = JSON.parse(new_data[m]);
					}
									
					tdata = [];
					tdatas_to_use = [];

					for (var i = 0; i < new_data.length; i++){
						table.addSentence(new_data[i]);
					}				
				}
			}
		});
	}, 5000);

};
