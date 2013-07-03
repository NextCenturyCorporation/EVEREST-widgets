var raw_data_widget = {};
raw_data_widget.execute = function() {
	d3.json('./raw_data.txt', function(text){
		if (text){
			$('#title').html('<h1>'+text.title+'</h1>');
			var datas_to_use = text.fields;

			var raw_data_table = new data_table(datas_to_use, function(announcement) {
				OWF.Eventing.publish("testChannel1", announcement);
			});
		
			raw_data_table.createHeaders(Object.keys(raw_data_table.datas[0]));
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
		}
	});
};
