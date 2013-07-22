var data_table = function(datas_to_set, announce_function, rows) {
	var me = this;
	var time = 'time';
	
	var MAX_CHARS = 100;
	var TYPE_OF_DATE = 'createdDate';
	var FADE_OUT_TIME = 10000;
	var HILIGHT = 'red';
	var STANDARD = 'black';
	
	me.MIN = 0;
	me.MAX = Number.MAX_VALUE;
	
	me.datas = datas_to_set;
	me.max_rows = (rows ? rows : 10);
	me.max_pages = Math.floor(me.datas.length / rows);
	me.count = me.page * max_rows;
	me.temp_datas = me.datas.slice(0, me.max_rows);
	me.page = 0;
	
	me.headers = [];

	me.announce = announce_function;

	me.sentence = Backbone.Model.extend({
		defaults: {	}
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
					});
		}
	});

	me.tableView = Backbone.View.extend({
			el:$('.data_table_data')[0],
			initialize: function(data_array){
				this.collection = new me.table(data_array);
				this.render();
			},
			render: function(){	
				var that = this;
				me.showPageNumbers(that);
				
				me.temp_datas = me.datas.slice(me.page * me.max_rows, (me.page + 1) * me.max_rows);
				this.collection = new me.table(me.temp_datas);
				
				var s = "Displaying " + me.temp_datas.length + " of " + me.datas.length + " objects";
				$('.data_table_display_info').text(s);
	
				me.count = me.page * me.max_rows;
				var temp = (1 + me.page) * me.max_rows;
								
				d3.selectAll("tr").remove();
				_.each(this.collection.models, function (item){
					if ( me.count < temp) {
						that.renderSentence(item, false);
						me.count++;
					}
				}, this);
								
				//me.adjustDataWidths();
			},
			renderSentence: function(item, location){
				var sentView = new me.sentenceView({
					model: item
				});
				var loc = location;
				//render this item and add it to the table
				if (loc === false){	
					$('.data_table_data').append(sentView.el);
				} else {				//including when loc === 0
					$($('tbody').children()[location]).before(sentView.el);
				}
			},
			getTimes: function(){
				return this.collection.pluck(time);
			},
			addSentence: function(item){
				me.datas.push(item);
				
				//grab the column we want to sort by
				var col = me.getSortedColumn();
				var colText = me.headers[col.id];
				
				//make sure new item is in its correct location in me.datas 
				if(col.class === 'up'){
					me.datas.sort(function(a,b){ return a[colText] > b[colText] ? 1 : -1; });
				} else if (col.class === 'down'){
					me.datas.sort(function(a,b){ return a[colText] < b[colText] ? 1 : -1; });
				}
				
				me.temp_datas = me.datas.slice(me.page * me.max_rows, (me.page + 1) * me.max_rows);						
				this.collection = new me.table(me.temp_datas);

				me.addRow(item, this);
				
				//pages @ top, if data becomes large enough to add another page,
				var expectedPages = Math.floor(me.datas.length / me.max_rows);
				if (expectedPages > me.max_pages){
					var that = this;
					me.max_pages = expectedPages;
					me.showPageNumbers(that);
				}
				
				var s = "Displaying " + me.temp_datas.length + " of " + me.datas.length + " objects";
				$('.data_table_display_info').text(s);
			}
		}
	);

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
	
	me.getPageNumbers = function(current, last){
		var maxNumPages = 10; 		
		var nums = [], j = 0;
			
		//if there are less pages than the max number of pages to show
		if (last <= maxNumPages){
			for (var i = 0; i < last; i++){ nums[i] = i+1; }
			return nums;
		}
		
		//if on page at least half the max number of pages to show above page 1
		if (current - (maxNumPages / 2) > 1){
			nums[j] = 1;
			nums[j+1] = "...";
			j += 2;
		}
		
		var low = Math.max(1, current - (maxNumPages / 2));
		var high = Math.min(last, low + maxNumPages - 1);
		
		for (var i = low; i <= high; i++){
			nums[j] = i;
			j++;
		}
		
		//if on page at least half the max number of pages below last page
		if (current + (maxNumPages / 2) <= last){
			nums[j] = "...";
			nums[j+1] = last;
		}
		
		return nums;
	};
	
	me.showPageNumbers = function(that){
		d3.selectAll('a').remove();
		var pages = d3.select(".data_table_pages");
		var nums = me.getPageNumbers(me.page + 1, me.max_pages + 1);

		for (i = 0; i <= nums.length; i++){
			if (nums[i] === "..."){
				pages.append('a').text(nums[i]);
			} else {
				pages.append('a')
					.attr('class', nums[i] === (me.page + 1) ? 'current' : 'other')
					.text(nums[i])
					.on('click', function(){
						me.page = parseInt(this.text,10) - 1;
						that.render();
					});
			}
		}
	}

	me.createClickers = function() {
		//add a listener to sort the rows based upon what column is clicked
		d3.selectAll("th")
			.on("click", function() {
				var col = parseInt(this.id, 10);
				col = Object.keys(me.temp_datas[0])[col];
				me.sorter(this, col);
				table.render();
			});

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
				me.datas.sort( function (a, b){ return a[colId] < b[colId] ? 1 : -1; });
				//me.temp_datas.sort( function (a, b){ return a[colId] < b[colId] ? 1 : -1; });
			} else {
				var elements = d3.selectAll("th")
				elements.classed('up', false)
				elements.classed('down', false)
				elements.classed('unsorted', true);

				elem.classed('unsorted', false);
				elem.classed('up', true);
				//me.temp_datas.sort( function (a, b){ return a[colId] > b[colId] ? 1 : -1; });
				me.datas.sort( function (a, b){ return a[colId] > b[colId] ? 1 : -1; });
			}
		}
	}
	
	me.getSortedColumn = function(){
		var cols = d3.selectAll('th');
		var found = { 
			id: '-1',
			class: "unsorted"
		};
		cols.each(function(){
			if (this.className === "up" || this.className === "down"){
				found.id = this.id;
				found.class = this.className;
			}
		});
		return found;
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
	
		//push title and inputs over until they are centered
		d3.select(".data_table_text").style("margin-left", (center - text_center) + "px");
		d3.select(".data_table_inputs").style("margin-left", (center - input_center) + "px");

		//expand the table until it takes up entire width of frame
		d3.select(".data_table_container").style("width", (center * 2) + "px");
		d3.select(".data_table_data").style("width", (center * 2 - 15) + "px");
		//d3.select(".data_table_headers").style("width", (center * 2 - 15) + "px");
	}

	/*Create the headers of the table*/
	me.createHeaders = function(arr){
		time = $.inArray(TYPE_OF_DATE, arr) !== -1 ? TYPE_OF_DATE : arr[0];
		me.headers = arr;
	
		var header = d3.select(".data_table_data").append("thead");
		//var header = d3.select(".data_table_header").append("thead");   //for fixed header
		header.selectAll("th").remove();
		for (var i = arr.length - 1; i >= 0; i--){
			header.insert("th",":first-child")
					.text(arr[i])
					.attr("id", i)
					.attr("class", "unsorted");
		}
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
		me.temp_datas = me.datas.slice(0, me.max_rows);
		me.max_pages = Math.floor(me.datas.length / me.max_rows);
	};
	
	me.addRow = function(item, that){
		var isIn = -1 === me.temp_datas.indexOf(item) ? false : true;
		var ind = me.temp_datas.indexOf(item);
	
		if (isIn){
			
			if (ind === me.temp_datas.length - 1){
				that.renderSentence(item, false);
			} else {
				that.renderSentence(item, ind);
			}
			
			me.count++;
			var rs = d3.selectAll('tr')[0].length;
			
			if (rs === me.max_rows + 1){
				$('tbody').children()[me.max_rows].remove();
				me.temp_datas.pop();
			}
			
			//hi-light the row as it is added, with a fade out
			var rows = d3.select('.data_table_data').selectAll('tr');
			var lastRow = rows[0][ind];
			d3.select(lastRow).style("color", HILIGHT)
				.transition()
				.duration(FADE_OUT_TIME)
				.style("color", STANDARD);

		} else {
			//item inserted before this page, re-render table to show shift of elements down
			if (me.datas.indexOf(item) < me.page * me.max_rows){
				that.render();
			}
		}		
	};
		
	me.adjustDataWidths = function(){
		var rowData = d3.select('tr').selectAll('td')[0];
		var heads = d3.selectAll('th')[0];
		for (var i = 0; i < rowData.length; i++){
			var rowWidth = parseInt(d3.select(rowData[i]).style('width').split('px')[0], 10);
			var headerWidth = parseInt(d3.select(heads[i]).style('width').split('px')[0], 10);
			if (rowWidth > headerWidth){
				d3.select(heads[i]).style('width', rowWidth + "px");
			} else if (headerWidth > rowWidth){
				d3.selectAll('tr').each(function(d,j){
					var c = d3.select(this).selectAll('td')[0][i];
					d3.select(c).style('width', headerWidth + 'px');
				});
			}
		}
	};
}