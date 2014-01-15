var table_widget = function(url, announce, timeline, workflow, datatype){
	var me = this;

	me.max_rows = 10;
	me.max_items = 1000;
	me.url = url;
	me.table = null;
	me.datas_to_use = [];
	me.datatype = datatype;

	var timeRangeChannel= "com.nextcentury.everest.timeRange";
	me.timeline_channel = timeline;
	me.workflow_channel = workflow;
	me.announce_channel = announce;
	me.announceCallback = function(announcement) {
		OWF.Eventing.publish(me.announce_channel, announcement);
	};

	me.getDataCallback = function(params, successCallback) {
		var newUrl = me.url + '?';
		var keys = Object.keys(params);
		keys.forEach(function(k) {
			newUrl += k + '=' + params[k] + '&';
		});

		$.ajax({
			type: "GET",
			url: newUrl,
			dataType: 'jsonp',
			jsonpCallback: 'callback',
			success: successCallback,
			error: function(error) {
				console.log(error);
				me.table.bindHeaderEvent();
			}
		});
	};

	me.getIndexes = function(callback) {
		$.ajax({
			type: "GET",
			url: me.url + '/indexes',
			dataType: 'jsonp',
			success: callback,
			error: function(e){
				console.log(e);
				console.log('error');
			}
		});
	};

	me.getDateTypes = function(callback) {
		$.ajax({
			type: "GET",
			url: me.url + '/datetypes',
			dataType: 'jsonp',
			success: callback,
			error: function(e){
				console.log('error');
				console.log(e);
			}
		});
	};

	me.initTable = function(data, length ){
		me.table = new data_table(me.datas_to_use, me.announceCallback, me.getDataCallback, me.max_rows, me.max_items, length);
		me.getIndexes(function(data) {
			me.table.createHeaders(Object.keys(me.table.datas[0]), data);
			me.table.createConfigOptions(Object.keys(me.table.datas[0]));
			me.table.createTable();
			me.table.createClickers();
		});

		me.getDateTypes(function(dates) {
			dates.forEach(function(d) {
				d3.select('#dates').append('li')
					.append('a').attr('xlink:href', '#')
						.attr('class', 'date')
						.text(d)
						.on('click', function() {
							me.table.setDefaultDateType(this.text);
						});
			});
		});
	};

	me.execute = function(){

		me.getDataCallback({count: me.max_items}, function(data){
			if (data.docs!== []){
				me.datas_to_use = data.docs;
				var length = data.total_count;

				me.initTable(me.datas_to_use, length);

				owfdojo.addOnLoad(function(){
					OWF.ready(function(){
						setInterval(me.table.sendTimes, 10000);

						OWF.Eventing.subscribe(me.workflow_channel, function(sender, msg){
							var data = JSON.parse(msg).data;
							if (data.type === me.datatype){
								me.table.currentTableView.addSentence(data.eventObject);
							}
						});

						OWF.Eventing.subscribe(timeRangeChannel, function(sender, msg){


							var data = JSON.parse(msg);
							if(data && data.startTime && data.endTime) {
								console.log("message revieved");
								  me.getDataCallback({
								  	count: me.max_items,
								  	start: data.startTime,
								  	end: data.endTime,
								  }, function(newData){
								 	me.table.updateTable(newData, true);
								 });
							} else {
								console.log("Could not recognize event message.");
							}
						});

						OWF.Eventing.subscribe('com.nextcentury.everest.tagCloud', function(sender, msg){
							var data = JSON.parse(msg);
							console.log(data);
						});
					});
				});
			}
		});
	};
};
