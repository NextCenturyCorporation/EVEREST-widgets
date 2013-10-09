var data_table = function(datas_to_set, announce_function, update_function, rows, items, length) {
	var me = this;
	var time = 'time';
	
	var MAX_CHARS = 100;
	var TYPE_OF_DATE = 'createdDate';
	var FADE_OUT_TIME = 10000;
	var HILIGHT = 'red';
	var STANDARD = 'black';
	
	me.MIN = 0;
	me.MAX = Number.MAX_VALUE;
	
	me.start = me.MIN;
	me.end = me.MAX;
	
	me.offset = 0;
	me.sort = 'uns';
	me.total = length;
	
	
	me.datas = datas_to_set;
	me.max_rows = (rows ? rows : 10);
	me.max_items = (items ? items : 1000);
	me.max_pages = Math.ceil(me.total / me.max_rows);
	me.count = me.page * me.max_rows;
	me.range_datas = me.datas;
	me.temp_datas = me.datas.slice(0, me.max_rows);
	me.page = 0;
	
	me.headers = [];

	me.announce = announce_function;
	me.update = update_function;
	
	me.currentTableView = {};

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
			d3.select(this.el).on('mouseover', function() { 
				d3.select(this).classed('lit', true).classed('unlit', false);
			}).on('mouseout', function() {
				d3.select(this).classed('unlit', true).classed('lit', false);
			}).selectAll('td')
			.data(vals).enter()
			.append('td').text(function(d){ 
				var str = d.toString();
				return str.length > MAX_CHARS ? str.substring(0, MAX_CHARS) + '...' : str;
			}).on('click', function(d){
				d3.selectAll('.data_table_descr').remove();
				d3.select('.data_table_text')
					.append('text')
					.text(d)
					.classed('data_table_descr', true);
					
				d3.selectAll('td').style('font-weight', 'normal');
				d3.select(this).style('font-weight', 'bold');
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
				me.temp_datas = me.range_datas.slice(me.page * me.max_rows - me.offset, (me.page + 1) * me.max_rows - me.offset);
				that.collection = new me.table(me.temp_datas);
				me.showPageNumbers();
				
				var s = 'Displaying ' + me.temp_datas.length + ' of ' + me.total + ' objects';
				$('.panel-title').text(s);
	
				me.count = me.page * me.max_rows;
				var temp = (1 + me.page) * me.max_rows;
								
				d3.selectAll('tr').remove();
				_.each(this.collection.models, function (item){
					if ( me.count < temp) {
						that.renderSentence(item, false);
						me.count++;
					}
				}, this);
				
				$.unblockUI();
			},
			renderSentence: function(item, location){
				var sentView = new me.sentenceView({
					model: item
				});
				//render this item and add it to the table
				if (location === false){	
					$('.data_table_data').append(sentView.el);
				} else {//including when loc === 0
					$($('tbody').children()[location]).before(sentView.el);
				}
			},
			getTimes: function(){
				return this.collection.pluck(time);
			},
			addSentence: function(item){
				me.datas.push(item);
				me.range_datas.push(item);
				me.total++;
				
				//grab the column we want to sort by
				var col = me.getSortedColumn();
				var colText = me.headers[col.id];
				
				//make sure new item is in its correct location in me.datas 
				if(col.class === 'up'){
					me.range_datas.sort(function(a,b){ return a[colText] > b[colText] ? 1 : -1; });
					me.datas.sort(function(a,b){ return a[colText] > b[colText] ? 1 : -1; });
				} else if (col.class === 'down'){
					me.range_datas.sort(function(a,b){ return a[colText] < b[colText] ? 1 : -1; });
					me.datas.sort(function(a,b){ return a[colText] < b[colText] ? 1 : -1; });
				}
				
				me.range_datas = me.range_datas.slice(0, me.max_items);
				me.datas = me.datas.slice(0, me.max_items);
				
				me.temp_datas = me.range_datas.slice(me.page * me.max_rows - me.offset, (me.page + 1) * me.max_rows - me.offset);						
				this.collection = new me.table(me.temp_datas);

				me.addRow(item, this);
				
				//pages @ top, if data becomes large enough to add another page,
				var expectedPages = Math.ceil(me.total / me.max_rows);
				if (expectedPages > me.max_pages){
					var that = this;
					me.max_pages = expectedPages;
					me.showPageNumbers();
				}
				
				var s = 'Displaying ' + me.temp_datas.length + ' of ' + me.total + ' objects';
				$('.panel-title').text(s);
			}
		}
	);

	me.createTable = function(s, e){
		me.page = 0;
		me.range_datas = me.extractData(s, e);
		me.max_pages = Math.ceil(me.total / me.max_rows);	
		me.currentTableView = new me.tableView(me.range_datas);									
		return me.currentTableView;
	};
	
	me.updateTable = function(data){
		me.offset = Math.floor(me.page * me.max_rows / me.max_items) * me.max_items;
		
		me.datas = data.raw_feeds;
		me.total = data.total_count;
		me.max_pages = Math.ceil(me.total / me.max_rows);
		
		var s = 'Displaying ' + me.temp_datas.length + ' of ' + me.total + ' objects';
		$('.panel-title').text(s);
		
		me.range_datas = me.extractData(me.MIN, me.MAX);
		me.currentTableView = new me.tableView(me.range_datas);
	};
	
	me.renderPage = function(){
		if (me.page * me.max_rows >= me.offset + me.max_items || 
				me.page * me.max_rows < me.offset){
			$.blockUI({ message: '<h3><img src="img/ajax-loader.gif" /> <br /> Please wait... </h3>'});
			var temp_offset = Math.floor(me.page * me.max_rows / me.max_items) * me.max_items;
			me.update({
				count: me.max_items, 
				offset: temp_offset,
				sort: me.sort
			}, me.updateTable);
		} else {
			me.currentTableView.render();
		}
	};
	
	me.createClickers = function() {
		//add a listener to sort the rows based upon what column is clicked
		d3.selectAll('th')
			.on('click', function() {
				var col = parseInt(this.id, 10);
				col = Object.keys(me.temp_datas[0])[col];
				me.sorter(this, col);
			});

		d3.select('.data_table_submit')
			.on('click', function(){
				me.start = Date.parse($('.data_table_start').val());
				me.end = Date.parse($('.data_table_end').val());
				$('.data_table_start').val('');
				$('.data_table_end').val('');
		
				if (me.start && me.end && me.start <= me.end) { 
					me.createTable(me.start,me.end); 
				} else if ( !me.start && me.end){
					me.createTable(me.MIN,me.end); 
				} else if ( me.start && !me.end ){
					me.createTable(me.start,me.MAX); 
				} else { 
					me.createTable(me.MIN,me.MAX); 
				}
			
				me.resetAndSend();
			});

		d3.select('.show_all')
			.on('click', function(){
				me.page = 0;
				me.renderPage();
				me.resetAndSend();
			});		
			
		d3.selectAll('.show').on('click', function(){
			me.setMaxRows(parseInt(this.id, 10));
			me.page = 0;
			me.renderPage();
		});	
	};
	
	/*Get a range of data based on start and end params
	Returns a subset of the array of objects datas containing
	only rows that occur in the specified time range*/
	me.extractData = function(start, end) {
		var currData = [];
		if(time === TYPE_OF_DATE){
			for (var i = 0; i < me.datas.length; i++){
				var ti = Date.parse(me.datas[i][time]);
		
				if (ti <= end && ti >= start) { 
					currData.push(me.datas[i]); 
				}
			}
		} else {
			currData = me.datas;
		}
		return currData;
	};

	//at the moment, this wont work properly, only sorts based on id, colId will be used later
	me.sorter = function(elem, colId){
		//don't bother sorting if range is empty
		if (me.range_datas.length !== 0){
			elem = d3.select(elem);

			var elements = d3.selectAll('th');
			if (elem.classed('up')){
				me.update({
					count: me.max_items, 
					offset: Math.floor(me.page * me.max_rows / me.max_items) * me.max_items, 
					sort: 'desc'
				}, function(data){
					me.updateTable(data);
						
					elements.classed('up', false);
					elements.classed('down', false);
					elements.classed('unsorted', true);
				
					elem.classed('unsorted', false);
					elem.classed('down', true);
					
					me.sort = 'desc';
				});
			} else {
				me.update({
					count: me.max_items, 
					offset: Math.floor(me.page * me.max_rows / me.max_items) * me.max_items, 
					sort: 'asc'
				}, function(data){
					me.updateTable(data);
					
					elements.classed('up', false);
					elements.classed('down', false);
					elements.classed('unsorted', true);
					
					elem.classed('unsorted', false);
					elem.classed('up', true);
					me.sort = 'asc';
				});
			}
		}
	};
	
	me.getSortedColumn = function(){
		var cols = d3.selectAll('th')[0];
		var found = { 
			id: '-1',
			class: 'unsorted'
		};
		
		for (var i = 0; i < cols.length; i++){
			if (cols[i].className === 'up' || cols[i].className === 'down'){
				found.id = cols[i].id;
				found.class = cols[i].className;
				break;
			}
		}
		return found;
	};
	
	me.createHeaders = function(arr){
		time = $.inArray(TYPE_OF_DATE, arr) !== -1 ? TYPE_OF_DATE : arr[0];
		me.headers = arr;
	
		var header = d3.select('.data_table_data');
		header.selectAll('th').remove();
		
		for (var i = arr.length - 1; i >= 0; i--){
			header.insert('th',':first-child')
				.text(arr[i])
				.attr('id', i)
				.attr('class', 'unsorted');
		}
	};
	
	me.resetAndSend = function(){
		var headers = d3.selectAll('th');
		headers.classed('up', false);
		headers.classed('down', false);
		headers.classed('unsorted', true);
			
		var time_data = me.currentTableView.getTimes();
		
		if (Date.parse(time_data[0])){
			for (var i = 0; i < time_data.length; i++){ time_data[i] = Date.parse(time_data[i]); }
		
			me.announce(JSON.stringify(time_data));
		}
	};
	
	me.setMaxRows = function(r){
		if( r > 0 && r < me.max_items){
			me.max_rows = r;
			me.temp_datas = me.range_datas.slice(0, me.max_rows);
			me.max_pages = Math.ceil( me.total / me.max_rows );
		}
	};
	
	me.addRow = function(item, that){
		var ind = me.temp_datas.indexOf(item);
		var isIn = -1 === ind ? false : true;
		
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
			d3.select(lastRow).style('color', HILIGHT)
				.transition()
				.duration(FADE_OUT_TIME)
				.style('color', STANDARD);

		} else {
			//item inserted before this page, re-render table to show shift of elements down
			if (me.range_datas.indexOf(item) < me.page * me.max_rows){
				that.render();
			}
		}		
	};
	
	me.getPageNumbers = function(current, last){
		var maxNumPages = 8;
		var nums = [];
		var j = 0;
		
		//if there are less pages than the max number of pages to show
		if (last <= maxNumPages){
			for (var i = 0; i < last; i++){ 
				nums[i] = i+1; 
			}
				return nums;
		}
		
		if (current <= maxNumPages / 2){
			for (var i = 1; i <= maxNumPages; i++){
				nums[j++] = i;
			}
			return nums;
		}
		
		if (current >= last - maxNumPages / 2){
			for (var i = last - maxNumPages + 1; i <= last; i++){
				nums[j++] = i;
			}
			return nums;
		}
		
		var first = Math.max(1, current - maxNumPages / 2);
		last = Math.min(last, current + maxNumPages / 2);
		
		for (var i = first; i < last; i++){
			nums[j++] = i;
		}
		
		return nums;
	};
	
	me.showPageNumbers = function(){
		d3.selectAll('.pagination li').remove();
		var pages = d3.select('.pagination');
		var nums = me.getPageNumbers(me.page + 1, me.max_pages);

		var li = pages.append('li');
		if (nums[0] === 1){
			li.append('span').text('<<');
		} else {
			li.append('a').attr('class', '#')
				.text('<<').on('click', function(){
					me.page = 0;
					me.renderPage();
				});
		}

		nums.forEach(function(n){
			li = pages.append('li')
				.attr('class', n === (me.page + 1) ? 'active' : 'other');
			li.append('a').attr('xlink:href', '#')
				.text(n).on('click', function(){
					me.page = parseInt(this.text, 10) - 1;
					me.renderPage();
				});
		});
		
		li = pages.append('li');
		if (nums[nums.length - 1] === me.max_pages + 1) {
			li.append('span').text('>>');
		} else {
			li.append('a').attr('class', '#')
				.text('>>').on('click', function(){
					me.page = me.max_pages - 1;
					me.renderPage();
				});
		}
	};
};