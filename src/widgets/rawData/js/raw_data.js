var raw_data_widget = {};
raw_data_widget.execute = function() {
	data_table.announce = function(announcement) {
		OWF.Eventing.publish("testChannel1", announcement);
	};

	d3.json('./raw_data.txt', function(text){
		if (text){
			$('#title').html('<h1>'+text.title+'</h1>');
			data_table.datas = text.fields;
		
			data_table.createHeaders(Object.keys(data_table.datas[0]));
			table = data_table.createTable(data_table.MIN,data_table.MAX);
			data_table.createClickers();
			data_table.setLocations();
		
			owfdojo.addOnLoad(function(){
				OWF.ready(function(){
					setInterval(data_table.resetAndSend, 10000);					//to be removed later on, and put back clearing into resetAndSend
			
					OWF.Eventing.subscribe("testChannel2", function(sender, msg){
						var range = msg.substring(1,msg.length - 1).split(',');
						data_table.createTable(Date.parse(range[0]), Date.parse(range[1]));
						data_table.resetAndSend();
						$('#start').val('');
						$('#end').val('');
					});
				});
			});
		}
	});
};
