var raw_data_widget = {};

var max_rows = 1000;
var url = 'http://10.10.16.48:8081/rawfeed/';
var raw_data_table, datas_to_use = [], table = null;

function initTable(data){
	datas_to_use = data === [] ? {} : data;
	console.log("CREATING table of " + datas_to_use + "with a max number of rows of " + max_rows);
	raw_data_table = new data_table(datas_to_use, function(announcement) {
		OWF.Eventing.publish("testChannel1", announcement);
	}, max_rows);
	//console.log(max_rows);
	
	raw_data_table.createHeaders(Object.keys(raw_data_table.datas[0]));
	table = raw_data_table.createTable(raw_data_table.MIN,raw_data_table.MAX);
	raw_data_table.createClickers();
	raw_data_table.setLocations();
	raw_data_table.execute();
};

raw_data_widget.execute = function() {
	
	d3.selectAll("input").on("change", function(){
		//max_rows = this.value !== 'all' ? parseInt(this.value,10) : datas_to_use.length;
		//raw_data_table.setMaxRows(max_rows);
		//console.log(max_rows);
		table.render();
	});

	$.getJSON(url + "?callback=?", function(data){
		if (data !== []){
			//datas_to_use = data.slice(0, max_rows);
			datas_to_use = data;
					
			initTable(datas_to_use);

			owfdojo.addOnLoad(function(){
				OWF.ready(function(){
					setInterval(raw_data_table.resetAndSend, 10000);					//to be removed later on, and put back clearing into resetAndSend
			
					OWF.Eventing.subscribe("testChannel2", function(sender, msg){
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
				console.log("DATA");
				console.log(data);
				console.log("start index " + (datas_to_use.length));
				console.log("end index " + (data.length - 1));
				var diff = data.length - datas_to_use.length - 1;
			
				if (!table ){
					initTable(data);
					datas_to_use = data;
				} else {
				
					var new_data = data.slice(datas_to_use.length, data.length);			
					console.log("NEW_DATA");
					console.log(new_data);
					for (var i = 0; i <= diff; i++){
						table.addSentence(new_data[i]);
					}
					datas_to_use = data;
					table.render();
					
					//make entire list grow if all is checked
					if ($("#all").checked){
						console.log(max_rows);
						//max_rows += diff;
						//raw_data_table.setMaxRows(max_rows);
					}
				}
			}
		});
	}, 2500);
};
