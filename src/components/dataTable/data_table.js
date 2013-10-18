var data_table = function(datas_to_set, announce_function, update_function, rows, items, length) {
	var me = this;
	var time = 'time';
	
	var MAX_CHARS = 75;
	var TYPE_OF_DATE = 'createdDate';
	var FADE_OUT_TIME = 10000;
	var HILIGHT = 'red';
	var STANDARD = 'black';
	
	me.MIN = 0;
	me.MAX = 32500000000000;
	
	me.start = me.MIN;
	me.end = me.MAX;
	
	me.page = 0;
	me.offset = 0;
	me.sort = 'uns';
	me.sortKey = '_id';
	me.total = length;
	
	me.datas = datas_to_set;
	me.max_rows = (rows ? rows : 10);
	me.max_items = (items ? items : 1000);
	me.max_pages = Math.ceil(me.total / me.max_rows);
	me.count = me.page * me.max_rows;
	me.temp_datas = me.datas.slice(0, me.max_rows);
	
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
				if (d !== undefined){
					var str = d.toString();
					return str.length > MAX_CHARS ? str.substring(0, MAX_CHARS) + '...' : str;
				} else {
					return 'N/A';
				}
			}).on('click', function(d){
				console.log(JSON.stringify({message: d}));
				d3.selectAll('.data_table_descr').remove();
				d3.select('.data_table_text')
					.append('text')
					.text(d)
					.classed('data_table_descr', true);
					
				d3.selectAll('td').style('font-weight', 'normal');
				d3.select(this).style('font-weight', 'bold');
				
				var id = $(this).parent('tr').children('td:nth-child(1)').text();

				me.announce(JSON.stringify({_id: id, field_value: d}));
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
				me.temp_datas = me.datas.slice(me.page * me.max_rows - me.offset, (me.page + 1) * me.max_rows - me.offset);
				that.collection = new me.table(me.temp_datas);
				me.showPageNumbers();
				
				var s = 'Displaying ' + me.temp_datas.length + ' of ' + me.total + ' objects';
				$('#panel-title').text(s);
	
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
				var item_time = new Date(item[time]);
				var start_time = new Date(me.start);
				var end_time = new Date(me.end);
				if (item_time > start_time && item_time < end_time){
					me.datas.push(item);
					me.total++;
				
					//grab the column we want to sort by
					var col = me.getSortedColumn();
					var colText = me.headers[col.id];
				
					//make sure new item is in its correct location in me.datas 
					if(col.class === 'up'){
						me.datas.sort(function(a,b){ return a[colText] > b[colText] ? 1 : -1; });
					} else if (col.class === 'down'){
						me.datas.sort(function(a,b){ return a[colText] < b[colText] ? 1 : -1; });
					}
					
					me.datas = me.datas.slice(0, me.max_items);
					
					me.temp_datas = me.datas.slice(me.page * me.max_rows - me.offset, (me.page + 1) * me.max_rows - me.offset);						
					this.collection = new me.table(me.temp_datas);
	
					me.addRow(item, this);
					
					//pages @ top, if data becomes large enough to add another page,
					var expectedPages = Math.ceil(me.total / me.max_rows);
					if (expectedPages > me.max_pages){
						me.max_pages = expectedPages;
						me.showPageNumbers();
					}
				
					var s = 'Displaying ' + me.temp_datas.length + ' of ' + me.total + ' objects';
					$('#panel-title').text(s);
				}
			}
		}
	);

	me.createTable = function(s, e){
		if (s && e){
			me.start = s;
			me.end = e;
			
			me.update({
				count: me.max_items,
				start: me.start,
				end: me.end
			}, me.updateTable);
		} else {
			me.currentTableView = new me.tableView(me.datas);
		}
	};
	
	me.updateTable = function(data){
		me.offset = Math.floor(me.page * me.max_rows / me.max_items) * me.max_items;

		me.datas = data.docs;
		me.total = data.total_count;
		me.max_pages = Math.ceil(me.total / me.max_rows);
				
		me.currentTableView = new me.tableView(me.datas);
	};
	
	me.renderPage = function(){
		if (me.page * me.max_rows >= me.offset + me.max_items || 
				me.page * me.max_rows < me.offset){
			$.blockUI({ message: '<h3><img src="../../components/dataTable/img/ajax-loader.gif" /> <br /> Please wait... </h3>'});
			var temp_offset = Math.floor(me.page * me.max_rows / me.max_items) * me.max_items;
			me.update({
				count: me.max_items, 
				offset: temp_offset,
				sort: me.sort,
				sortKey: me.sortKey,
				start: me.start,
				end: me.end
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

		d3.select('#data_table_submit')
			.on('click', function(){
				me.start = $('#data_table_start').val();
				me.end = $('#data_table_end').val();
				$('#data_table_start').val('');
				$('#data_table_end').val('');		
			
				me.validateDates();
				
				me.page = 0;
				me.update({
					count: me.max_items, 
					start: me.start,
					end: me.end,
				}, me.updateTable);
				me.sendTimes();
			});

		d3.select('.show_all')
			.on('click', function(){
				me.page = 0;
				me.start = me.MIN;
				me.end = me.MAX;
				me.update({count: me.max_items}, me.updateTable);
				me.sendTimes();
			});		
			
		d3.selectAll('.show').on('click', function(){
			me.setMaxRows(parseInt(this.id, 10));
			me.page = 0;
			me.renderPage();
		});	
	};

	me.sorter = function(elem, colId){
		if (me.datas.length !== 0){
			elem = d3.select(elem);

			var elements = d3.selectAll('th');
			if (elem.classed('up')){
				me.update({
					count: me.max_items, 
					offset: Math.floor(me.page * me.max_rows / me.max_items) * me.max_items, 
					sort: 'desc',
					sortKey: colId,
					start: me.start,
					end: me.end
				}, function(data){
					me.updateTable(data);
						
					elements.each(function(){
						if (d3.select(this).attr('class') !== 'no_sort'){		
							d3.select(this).classed('up', false);
							d3.select(this).classed('down', false);
							d3.select(this).classed('unsorted', true);
						}
					});
							
					elem.classed('unsorted', false);
					elem.classed('down', true);
					
					me.sort = 'desc';
					me.sortKey = colId;
				});
			} else if (!elem.classed('no_sort')){
				me.update({
					count: me.max_items, 
					offset: Math.floor(me.page * me.max_rows / me.max_items) * me.max_items, 
					sort: 'asc',
					sortKey: colId,
					start: me.start,
					end: me.end
				}, function(data){
					me.updateTable(data);
					
					elements.each(function(){
						if (d3.select(this).attr('class') !== 'no_sort'){		
							d3.select(this).classed('up', false);
							d3.select(this).classed('down', false);
							d3.select(this).classed('unsorted', true);
						}
					});
					
					elem.classed('unsorted', false);
					elem.classed('up', true);
					
					me.sort = 'asc';
					me.sortKey = colId;
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
	
	me.createHeaders = function(arr, indexes){
		time = $.inArray(TYPE_OF_DATE, arr) !== -1 ? TYPE_OF_DATE : arr[0];
		me.headers = arr;
	
		var header = d3.select('.data_table_data');
		header.selectAll('th').remove();
		
		for (var i = arr.length - 1; i >= 0; i--){
			header.insert('th',':first-child')
				.text(arr[i])
				.attr('id', i)
				.attr('class', function(){
					if (indexes.indexOf(arr[i]) === -1){
						return 'no_sort';
					} else {
						return 'unsorted';
					}
				});
		}
	};
	
	me.sendTimes = function(){
		var time_data = me.currentTableView.getTimes();
		
		if (Date.parse(time_data[0])){
			for (var i = 0; i < time_data.length; i++){ 
				time_data[i] = Date.parse(time_data[i]); 
			}
		
			me.announce(JSON.stringify({times:time_data}));
		}
	};
	
	me.setMaxRows = function(r){
		if( r > 0 && r < me.max_items){
			me.max_rows = r;
			me.temp_datas = me.datas.slice(0, me.max_rows);
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
	
	me.validateDates = function(){
		var startdate = new Date(me.start);
		var enddate = new Date(me.end);
		if (!startdate){
			me.start = me.MIN;
		}
		
		if (!enddate){
			me.end = me.MAX;
		}
		
		if (startdate > enddate){
			me.start = me.MIN;
			me.end = me.MAX;
		}
	};
};
