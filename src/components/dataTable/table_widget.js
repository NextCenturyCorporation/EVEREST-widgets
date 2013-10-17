var table_widget = function(url, announce, timeline, workflow, datatype){
	var me = this;
	
	me.max_rows = 10;
	me.max_items = 1000;
	me.url = url;
	me.table = null;
	me.datas_to_use = [];
	me.datatype = datatype;
	
	me.timeline_channel = timeline;
	me.workflow_channel = workflow;
	me.announce_channel = announce;
	
	me.announceCallback = function(announcement){
		OWF.Eventing.publish(me.announce_channel, announcement);
	};
	
	me.getDataCallback = function(params, successCallback){
		var newUrl = me.url + '?';
		var keys = Object.keys(params);
		keys.forEach(function(k){
			newUrl += k + '=' + params[k] + '&';
		});
	
		$.ajax({
			type: "GET",
			url: newUrl,
			dataType: 'jsonp',
			jsonpCallback: 'callback',
			success: successCallback,
			error: function(error){
				console.log(error);
			}
		});
	};
	
	me.getIndexes = function(callback){
		$.ajax({
			type: "GET",
			url: me.url + '/indexes',
			dataType: 'jsonp',
			jsonpCallback: 'callback',
			success: callback,
			error: function(){
				console.log('error');
			}
		});
	};
	
	me.initTable = function(data, length){
		me.datas_to_use = (data === [] ? {} : data);
			
		me.table = new data_table(me.datas_to_use, me.announceCallback, me.getDataCallback, me.max_rows, me.max_items, length);
		me.getIndexes(function(data){
			me.table.createHeaders(Object.keys(me.table.datas[0]), data);
			me.table.createTable();
			me.table.createClickers();
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
				
						/*OWF.Eventing.subscribe(me.timeline_channel, function(sender, msg){
							var range = msg.substring(1,msg.length - 1).split(',');
							me.table.createTable(Date.parse(range[0]), Date.parse(range[1]));
							me.table.resetAndSend();
							$('#data_table_start').val('');
							$('#data_table_end').val('');
						});*/
						
						OWF.Eventing.subscribe(me.workflow_channel, function(sender, msg){
							var data = JSON.parse(msg).data;
							if (data.type === me.datatype){
								me.table.currentTableView.addSentence(data.eventObject);
							}
						});
					});
				});
			}
		});		
	};
};
