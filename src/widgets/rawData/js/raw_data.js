var raw_data_widget = {};
raw_data_widget.execute = function() {

	var url = 'http://10.10.16.48:8081/rawfeed/';
	var max_rows = 10;
	setInterval(function(){
		$.getJSON(url + "?callback=?", function(data){
			
			var max_keys = {"amount":0,"index":0}

			var datas_to_use = data;
			if (data === []){
				data = {};
			}
			
			//extract the text field out from the json file
			for (var i = 0; i < datas_to_use.length; i++){
				var temp = datas_to_use[i].feedSource;
				datas_to_use[i] = JSON.parse(datas_to_use[i].text);
				datas_to_use[i].feedSource = temp;
				
				//find index with most keys
				if (Object.keys(datas_to_use[i]).length > max_keys.amount){
					max_keys.amount = Object.keys(datas_to_use[i]).length;
					max_keys.index = i;
				}
			}
		
			var raw_data_table = new data_table(datas_to_use, function(announcement) {
				OWF.Eventing.publish("testChannel1", announcement);
			});
			
			raw_data_table.createHeaders(Object.keys(raw_data_table.datas[max_keys.index]));
			table = raw_data_table.createTable(raw_data_table.MIN,raw_data_table.MAX);
			raw_data_table.createClickers();
			raw_data_table.setLocations();
		
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
		});
	}, 1000);
};