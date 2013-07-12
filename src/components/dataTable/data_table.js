var data_table = function(datas_to_set, announce_function, rows) {
	var me = this;
	var MAX_CHARS = 100;
	var count = 0;
	
	var time = 'time';
	var TYPE_OF_DATE = "createdDate";
	
	me.MIN = 0;
	me.MAX = Number.MAX_VALUE;
	me.datas = datas_to_set;
	me.max_rows = (rows ? rows : 10);
	
	me.temp_datas = me.datas.slice(0, me.max_rows);
	
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
			var keys = me.headers;
			var vals = [];
			var obj = this.model.attributes ? this.model.attributes : this.model;
			
			for (var i = 0; i < keys.length; i++){
				vals[i] = obj[keys[i]];
			}
			
			//grab this element and add d3 functionality
			d3.select(this.el)
				.on("mouseover", function() { 
					d3.select(this)
						.classed("lit", true)
						.classed("unlit", false);
				})
				.on("mouseout", function() {
					d3.select(this)
						.classed("unlit", true)
						.classed("lit", false);
				})					
				.selectAll('td')
				.data(vals)
				.enter().append('td')
					.text(function(d){ 
						var str = d.toString();
						return str.length > MAX_CHARS ? str.substring(0, MAX_CHARS) + "..." : str;
					})
					.on("click", function(d){
						var coord = d3.mouse(this);
						d3.selectAll(".data_table_descr").remove();
						d3.select('.data_table_text')
							.append("text")
							.text(d)
							.classed("data_table_descr", true);
						d3.selectAll('td').style("font-weight", "normal");
						d3.select(this).style("font-weight", "bold");
					})
					.style("color", "red")
					.transition()
						.duration(10000)
						.style("color", "black");
									
			return this;
		}
	});

	me.tableView = Backbone.View.extend({
		el:$('.data_table_data')[0],
		initialize: function(te){
			this.collection = new me.table(te);
			this.render();
		},
		render: function(){	
			count = 0;
			this.collection = new me.table(me.temp_datas);
			d3.selectAll("tr").remove();
			var that = this;
			_.each(this.collection.models, function (item){
				if ( count < me.max_rows) {
					that.renderSentence(item);
					count++;
					console.log(count);
				}
			}, this);
		},
		renderSentence: function(item){
			var sentView = new me.sentenceView({
				model: item
			});
			//render this item and add it to the table
	
			$('.data_table_data').append(sentView.render().el);
		},
		getTimes: function(){
			return this.collection.pluck(time);
		},
		addSentence: function(item){
			me.datas.push(item);
			
			this.collection = new me.table(me.datas);
			if ( count < me.max_rows) {
				this.renderSentence(item);
				me.temp_datas.push(item);
				count++;
				console.log(count);
			}
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
		me.temp_datas = me.extractData(s, e);	
		table = new me.tableView(me.temp_datas);
		return table;
	};

	me.createClickers = function() {
		//add a listener to sort the rows based upon what column is clicked
		d3.selectAll("th")
			.on("click", function() {
				var col = parseInt(this.id, 10);
				col = Object.keys(me.temp_datas[0])[col];
				me.sorter(this, col);
				//table = new me.tableView(me.temp_datas);
				table.render();
			});

		//grab times from forms for use in re-rendering the table will be removed
		//but shows example handling of future input from timeline widget
		d3.select('.data_table_submit')
			.on('click', function(){
				var s = Date.parse($('.data_table_start').val());
				var e = Date.parse($('.data_table_end').val());
				$('.data_table_start').val('');
				$('.data_table_end').val('');
		
				if (s && e && s <= e) { me.createTable(s,e); }
				else { me.createTable(me.MIN,me.MAX); }
			
				me.resetAndSend();
			});

		d3.select('.data_table_reset')
			.on('click', function(){
				me.createTable(me.MIN,me.MAX);
				me.resetAndSend();
			});			
	};

	me.sorter = function(elem, colId){
		//don't bother sorting if temp is empty
		if (me.temp_datas.length !== 0){
			elem = d3.select(elem);

			if (elem.classed("up")){
				var elements = d3.selectAll("th")
				elements.classed('up', false)
				elements.classed('down', false)
				elements.classed('unsorted', true);

				elem.classed('unsorted', false);
				elem.classed('down', true);
				me.temp_datas.sort( function (a, b){ return a[colId] < b[colId] ? 1 : -1; });
			} else {
				var elements = d3.selectAll("th")
				elements.classed('up', false)
				elements.classed('down', false)
				elements.classed('unsorted', true);

				elem.classed('unsorted', false);
				elem.classed('up', true);
				me.temp_datas.sort( function (a, b){ return a[colId] > b[colId] ? 1 : -1; });
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
		var center = me.getCenter(".data_table_hold");
		var text_center = me.getCenter(".data_table_text");
		var input_center = me.getCenter(".data_table_inputs");
		var count_center = me.getCenter(".data_table_display_count");
	
		//push title and inputs over until they are centered
		d3.select(".data_table_text").style("margin-left", (center - text_center) + "px");
		d3.select(".data_table_inputs").style("margin-left", (center - input_center) + "px");
		d3.select(".data_table_display_count").style("margin-left", (center - count_center) + "px");

		//expand the table until it takes up entire width of frame
		d3.select(".data_table_data").style("width", (center * 2) + "px");
	}

	/*Create the headers of the table*/
	me.createHeaders = function(arr){
		if ($.inArray(TYPE_OF_DATE, arr) !== -1){
			time = TYPE_OF_DATE;
		} else {
			time = arr[0];
		}
		
		me.headers = arr;
	
		var header = d3.select(".data_table_data").append("thead");
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
		if(time === TYPE_OF_DATE){
			for (var i = 0; i < me.temp_datas.length; i++){
				var ti = Date.parse(me.datas[i][time]);
		
				if (ti <= end && ti >= start) { currData.push(me.temp_datas[i]); }
			}
		} else {
			currData = me.temp_datas;
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
			
		time_data = table.getTimes();
		
		if (Date.parse(time_data[0])){
			for (i = 0; i < time_data.length; i++){ time_data[i] = Date.parse(time_data[i]); }
		
			me.announce(JSON.stringify(time_data));
		}
		
	};

	me.execute = function() {
		window.onresize = function(){
			me.setLocations();
		};
	};	
	
	me.setMaxRows = function(r){
		me.max_rows = r;
		console.log("Max rows updated to " +me.max_rows);
		me.temp_datas = me.datas.slice(0, me.max_rows);
	};
}
