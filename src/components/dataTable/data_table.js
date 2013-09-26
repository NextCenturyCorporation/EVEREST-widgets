var data_table = function(datas_to_set, announce_function, rows) {
	var me = this;
	var time = 'time';
	
	var MAX_CHARS = 100;
	var MAX_ROWS = 1000;
	var TYPE_OF_DATE = 'createdDate';
	var FADE_OUT_TIME = 10000;
	var HILIGHT = 'red';
	var STANDARD = 'black';
	
	me.MIN = 0;
	me.MAX = Number.MAX_VALUE;
	
	me.datas = datas_to_set;
	me.max_rows = (rows ? rows : 10);
	me.max_pages = Math.floor(me.datas.length / me.max_rows);
	me.count = me.page * me.max_rows;
	me.shown_datas = me.datas.slice(0, me.max_rows);
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
				var coord = d3.mouse(this);
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
				me.shown_datas = me.datas.slice(me.page * me.max_rows, (me.page + 1) * me.max_rows);
				that.collection = new me.table(me.shown_datas);
				me.showPageNumbers(that);
				
				var s = 'Displaying ' + me.shown_datas.length + ' of ' + me.datas.length + ' objects';
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
				
				//grab the column we want to sort by
				var col = me.getSortedColumn();
				var colText = me.headers[col.id];
				
				//make sure new item is in its correct location in me.datas 
				if(col.class === 'up'){
					me.datas.sort(function(a,b){ return a[colText] > b[colText] ? 1 : -1; });
				} else if (col.class === 'down'){
					me.datas.sort(function(a,b){ return a[colText] < b[colText] ? 1 : -1; });
				}
				
				me.shown_datas = me.datas.slice(me.page * me.max_rows, (me.page + 1) * me.max_rows);						
				this.collection = new me.table(me.shown_datas);

				me.addRow(item, this);
				
				//pages @ top, if data becomes large enough to add another page,
				var expectedPages = Math.floor(me.datas.length / me.max_rows);
				if (expectedPages > me.max_pages){
					var that = this;
					me.max_pages = expectedPages;
					me.showPageNumbers(that);
				}
				
				var s = 'Displaying ' + me.shown_datas.length + ' of ' + me.datas.length + ' objects';
				$('.panel-title').text(s);
			}
		}
	);

	me.createTable = function(s, e){
		me.shown_datas = me.extractData(s, e);	
		table = new me.tableView(me.shown_datas);									
		return table;
	};
	
	me.createClickers = function() {
		//add a listener to sort the rows based upon what column is clicked
		d3.selectAll('th')
			.on('click', function() {
				var col = parseInt(this.id, 10);
				col = Object.keys(me.shown_datas[0])[col];
				me.sorter(this, col);
				table.render();
			});

		d3.select('.data_table_submit')
			.on('click', function(){
				var s = Date.parse($('.data_table_start').val());
				var e = Date.parse($('.data_table_end').val());
				$('.data_table_start').val('');
				$('.data_table_end').val('');
		
				if (s && e && s <= e) { 
					me.createTable(s,e); 
				}
				else { 
					me.createTable(me.MIN,me.MAX); 
				}
			
				me.resetAndSend();
			});

		d3.select('.show_all')
			.on('click', function(){
				me.page = 0;
				me.createTable(me.MIN,me.MAX);
				me.resetAndSend();
			});		
			
		d3.selectAll('.show').on('click', function(){
			me.setMaxRows(parseInt(this.id, 10));
			me.page = 0;
			me.createTable(me.MIN,me.MAX);
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
		
				if (ti <= end && ti >= start) { currData.push(me.datas[i]); }
			}
		} else {
			currData = me.datas;
		}
		return currData;
	};
/*============================================================================================================*/
	
	me.sorter = function(elem, colId){
		//don't bother sorting if temp is empty
		if (me.shown_datas.length !== 0){
			elem = d3.select(elem);

			var elements = d3.selectAll('th');
			
			if (elem.classed('up')){
				elements.classed('up', false)
				elements.classed('down', false)
				elements.classed('unsorted', true);
			
				elem.classed('unsorted', false);
				elem.classed('down', true);
				me.datas.sort( function (a, b){ return a[colId] < b[colId] ? 1 : -1; });
			} else {
				elements.classed('up', false)
				elements.classed('down', false)
				elements.classed('unsorted', true);
				
				elem.classed('unsorted', false);
				elem.classed('up', true);
				me.datas.sort( function (a, b){ return a[colId] > b[colId] ? 1 : -1; });
			}
		}
	};
	
	me.getSortedColumn = function(){
		var cols = d3.selectAll('th');
		var found = { 
			id: '-1',
			class: 'unsorted'
		};
		cols.each(function(){
			if (this.className === 'up' || this.className === 'down'){
				found.id = this.id;
				found.class = this.className;
			}
		});
		return found;
	};
	
	/*Create the headers of the table*/
	me.createHeaders = function(arr){
		time = $.inArray(TYPE_OF_DATE, arr) !== -1 ? TYPE_OF_DATE : arr[0];
		me.headers = arr;
	
		var header = d3.select('.data_table_data').append('thead');
		//var header = d3.select('.data_table_header').append('thead');   //for fixed header
		header.selectAll('th').remove();
		for (var i = arr.length - 1; i >= 0; i--){
			header.insert('th',':first-child')
					.text(arr[i])
					.attr('id', i)
					.attr('class', 'unsorted');
		}
	}
	
	me.resetAndSend = function(){
		var headers = d3.selectAll('th');
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
		if( r > 0 && r < MAX_ROWS){
			me.max_rows = r;
			me.shown_datas = me.datas.slice(0, me.max_rows);
			me.max_pages = Math.floor( me.datas.length / me.max_rows );
		}
	};
	
	me.addRow = function(item, that){
		var ind = me.shown_datas.indexOf(item);
		var isIn = -1 === ind ? false : true;
		
		if (isIn){
			
			if (ind === me.shown_datas.length - 1){
				that.renderSentence(item, false);
			} else {
				that.renderSentence(item, ind);
			}
			
			me.count++;
			var rs = d3.selectAll('tr')[0].length;
			
			if (rs === me.max_rows + 1){
				$('tbody').children()[me.max_rows].remove();
				me.shown_datas.pop();
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
			if (me.datas.indexOf(item) < me.page * me.max_rows){
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
		var last = Math.min(last, current + maxNumPages / 2);
		for (var i = first; i < last; i++){
			nums[j++] = i;
		}
		
		return nums;
	};
	
	me.showPageNumbers = function(that){
		d3.selectAll('.pagination li').remove();
		var pages = d3.select('.pagination');
		var nums = me.getPageNumbers(me.page + 1, me.max_pages + 1);

		var li = pages.append('li');
		if (nums[0] === 1){
			li.append('span').text('<<');
		} else {
			li.append('a').attr('class', '#')
				.text('<<').on('click', function(){
					me.page = 0;
					that.render();
				});
		}

		nums.forEach(function(n){
			li = pages.append('li')
				.attr('class', n === (me.page + 1) ? 'active' : 'other');
			li.append('a').attr('xlink:href', '#')
				.text(n).on('click', function(){
					me.page = parseInt(this.text, 10) - 1;
					that.render();
				});
		});
		
		li = pages.append('li');
		if (nums[nums.length - 1] === me.max_pages + 1) {
			li.append('span').text('>>');
		} else {
			li.append('a').attr('class', '#')
				.text('>>').on('click', function(){
					me.page = me.max_pages;
					that.render();
				});
		}
	};
}