var data_table = function(datas_to_set, announce_function) {
	var me = this;
	

	var time = "time";
	var TYPE_OF_DATE = "created_at";
		
	me.MIN = 0;
	me.MAX = Number.MAX_VALUE;
	me.datas = datas_to_set;
	me.headers = [];

	me.announce = announce_function;

	me.sentence = Backbone.Model.extend({
		defaults: {	}
		//something needs to go here....
	});

	me.table = Backbone.Collection.extend({
		model: me.sentence
	});

	me.sentenceView = Backbone.View.extend({
		tagName: 'tr',
		className: 'unlit',
		initialize: function(){
			this.render();
		},
		render: function(){
			//get keys and values of the attributes of this model
			var keys = me.headers;		//Object.keys(this.model.attributes);
			var vals = [];
			for (var i = 0; i < keys.length; i++)
				//if (this.model.attributes[keys[i]]){
					//vals[i] = JSON.stringify(this.model.attributes[keys[i]]);
					vals[i] = this.model.attributes[keys[i]];
				//} else {
				//	vals[i] = ""
				//}
				
	
			//grab this element and add d3 functionality
			d3.select(this.el)
				.on("mouseover", function(){
					//d3.select(this).style("background", "#366fb4");
					d3.select(this).attr("class", "lit");
				})
				.on("mouseout", function(){
					//d3.select(this).style("background", "white");
					d3.select(this).attr("class", "unlit");
				})
				.selectAll('td')
				.data(vals)
				.enter().append('td')
					.text(function(d){ return d; });
			return this;
		}
	});

	me.tableView = Backbone.View.extend({
		el:$('#raw_data')[0],
		initialize: function(te){
			this.collection = new me.table(te);
			this.render();
		},
		render: function(){	
			d3.selectAll("tr").remove();
			var that = this;
			_.each(this.collection.models, function (item){
				that.renderSentence(item);
			}, this);
		},
		renderSentence: function(item){
			var sentView = new me.sentenceView({
				model: item
			});
			//render this item and add it to the table
			$('#raw_data').append(sentView.render().el);
		},
		getTimes: function(){
			//underscore function to grab all of the times from the data
			return this.collection.pluck(time);								//JSON
		}
	});

	me.generateTable = function() {
		var headers_to_use = Object.keys(me.datas[0]);
		
		me.createHeaders(headers_to_use);
		me.createTable(me.MIN,me.MAX);
		me.createClickers();
		me.setLocations();
	};

	me.createTable = function(s, e){
		temp = me.extractData(s, e);	

		if (time === TYPE_OF_DATE){
			for (var i = 0; i < temp.length; i++)
				temp[i][time] = new Date(temp[i][time]);
		}

		table = new me.tableView(temp);
		return table;
	};

	me.createClickers = function() {
		//add a listener to sort the rows based upon what column is clicked
		d3.selectAll("th")
			.on("click", function() {
				var col = parseInt(this.id, 10);
				col = Object.keys(temp[0])[col];
				me.sorter(this, col);
				table = new me.tableView(temp);
			});

		//grab times from forms for use in re-rendering the table will be removed
		//but shows example handling of future input from timeline widget
		d3.select('#submit')
			.on('click', function(){
				var s = Date.parse($('#start').val());
				var e = Date.parse($('#end').val());
				$('#start').val('');
				$('#end').val('');
		
				if (s && e && s <= e) { me.createTable(s,e); }
				else { me.createTable(me.MIN,me.MAX); }
			
				me.resetAndSend();
			});

		d3.select('#reset')
			.on('click', function(){
				me.createTable(me.MIN,me.MAX);
				me.resetAndSend();
			});
	};

	me.sorter = function(elem, colId){
		//don't bother sorting if temp is empty
		if (temp.length !== 0){
			if (elem.className == "up"){
				d3.selectAll("th").attr("class","unsorted");
				elem.className = "down";
				temp.sort( function (a, b){ return a[colId] < b[colId] ? 1 : -1; });
			} else {
				d3.selectAll("th").attr("class","unsorted");
				elem.className = "up";
				temp.sort( function (a, b){ return a[colId] > b[colId] ? 1 : -1; });
			}
		}
	}

	//grab the x coordinate of the center of the element in the dom with id tag
	me.getCenter = function(tag){
		var width = d3.select(tag).style("width");
		width = width.split("px")[0];
		return parseInt(width,10)/2;
	}

	/*Allows for automatic resizing and recentering of all objects within the
	widget when the window/frame is resized */
	me.setLocations = function(){
		var center = me.getCenter("#hold");
		var title_center = me.getCenter("#title");
		var input_center = me.getCenter("#inputs");
	
		//push title and inputs over until they are centered
		d3.select("#title").style("margin-left", (center - title_center) + "px");
		d3.select("#inputs").style("margin-left", (center - input_center) + "px");
	
		//expand the table until it takes up entire width of frame
		d3.select("#raw_data").style("width", (center * 2) + "px");
	}

	/*Create the headers of the table*/
	me.createHeaders = function(arr){
		if ($.inArray(TYPE_OF_DATE, arr) !== -1){
			time = TYPE_OF_DATE;
		} else {
			time = arr[0];
		}
		
		me.headers = arr;
	
		var header = d3.select("#raw_data");
		header.selectAll("th").remove();
		for (var i = arr.length - 1; i >= 0; i--){
			header.insert("th",":first-child")
					.text(arr[i])
					.attr("id", i)
					.attr("class", "unsorted");
		}
		return header;
	}

	/*Get a range of data based on start and end params
	Returns a subset of the array of objects datas containing
	only rows that occur in the specified time range*/
	me.extractData = function(start, end) {
		var currData = [];
		for (var i = 0; i < this.datas.length; i++){
			var ti = Date.parse(this.datas[i][time]);
	
			if (ti <= end && ti >= start) { currData.push(this.datas[i]); }
		}
		return currData;
	};

	me.resetAndSend = function(){
		var headers = d3.selectAll("th")
		headers.classed('up', false);
		headers.classed('down', false);
		headers.classed('unsorted', true);
		//$('#start').val('');
		//$('#end').val('');
			
		apple = table.getTimes();
		for (i = 0; i < apple.length; i++){ apple[i] = Date.parse(apple[i]); }
	
		me.announce(JSON.stringify(apple));
	};

	me.execute = function() {

		window.onresize = function(){
			me.setLocations();
		};
	};
}
