var data_table = function(datas_to_set, announce_function, update_function, rows, items, length) {
	var me = this;
	
	//var MAX_CHARS = 75;
	var FADE_OUT_TIME = 10000;
	var HILIGHT = 'red';
	var STANDARD = 'black';
	
	me.MIN = 0;
	me.MAX = 32500000000000;
	
	me.start = me.MIN;
	me.end = me.MAX;
	
	me.page = 0;
	me.offset = 0;
	me.sort = 'unsorted';
	me.sortKey = '_id';
	me.total = length;
	me.dateType = 'createdDate';
	
	me.datas = datas_to_set;
	me.max_rows = (rows ? rows : 10);
	me.max_items = (items ? items : 1000);
	me.max_pages = Math.ceil(me.total / me.max_rows);
	me.count = me.page * me.max_rows;
	me.temp_datas = me.datas.slice(0, me.max_rows);
	
	me.headers = [];
	me.indexes = [];
	me.idColumn = null;

	me.announce = announce_function;
	me.update = update_function;
	
	me.currentTableView = {};

	me.sentence = Backbone.Model.extend({
		defaults: {	}
	});

	me.table = Backbone.Collection.extend({
		model: me.sentence
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
			_.each(this.collection.models, function (item) {
				if ( me.count < temp) {
					that.renderSentence(item, false);
					me.count++;
				}
			}, this);
			
			$.unblockUI();
		},
		renderSentence: function(item, location){
			var sentView = new rowView({model: item, keys: me.headers}).render();
			//render this item and add it to the table
			if (location === false){	
				$('.data_table_data').append(sentView.el);
			} else {//including when loc === 0
				$($('tbody').children()[location]).before(sentView.el);
			}
		},
		getTimes: function(){
			return this.collection.pluck(me.dateType);
		},
		addSentence: function(item){
			var item_time = new Date(item[me.dateType]);
			var start_time = new Date(me.start);
			var end_time = new Date(me.end);
			if (item_time > start_time && item_time < end_time){
				me.datas.push(item);
				me.total++;
			
				//grab the column we want to sort by
				var col = me.getSortedColumn();
				var colText = me.headers[col.id];
			
				//make sure new item is in its correct location in me.datas 
				if(col.class === 'asc'){
					me.datas.sort(function(a,b){ return a[colText] > b[colText] ? 1 : -1; });
				} else if (col.class === 'desc'){
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
	});

	me.createTable = function(s, e){
		if (s && e){
			me.start = s;
			me.end = e;
			
			me.update({
				count: me.max_items,
				start: me.start,
				end: me.end,
				date: me.dateType
			}, function(data){
				me.updateTable(data);
			});
			getAllFeeds(me.start,me.end);
		} else {
			me.currentTableView = new me.tableView(me.datas);
		}
	};
	
	me.getAllFeeds = function(s,e) {
		me.update({
			count: null,
			start: me.start,
			end: me.end,
			date: me.dateType
		}, me.announceAllFeeds);
	};

	me.announceAllFeeds = function(data) {
		console.log(data);
	};

	me.updateTable = function(data, setFirstPage){
		if(setFirstPage) {
			me.page = 0;
		}
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
				end: me.end,
				date: me.dateType
			}, function(data){
				me.updateTable(data);
			});
		} else {
			me.currentTableView.render();
		}
	};
	
	me.createClickers = function() {
		me.bindHeaderEvent();

		d3.select('#data_table_submit').on('click', function() {
			me.start = $('#data_table_start').val();
			me.end = $('#data_table_end').val();
			$('#data_table_start').val('');
			$('#data_table_end').val('');		
		
			var dates = me.validateDates();
			
			me.page = 0;
			me.update({
				count: me.max_items,
				start: dates[0],
				end: dates[1],
				date: me.dateType
			}, function(data){
				me.start = dates[0];
				me.end = dates[1];	
				me.sort = 'uns';
				me.sortKey = '_id';
				
				me.updateTable(data);
				me.resetHeaderClasses();
			});
			
			me.sendTimes();
		});

		d3.select('.show_all').on('click', function() {
			me.page = 0;
			me.update({count: me.max_items, date: me.dateType}, function(data) {
				me.start = me.MIN;
				me.end = me.MAX;
				me.sort = 'uns';
				me.sortKey = '_id';
				
				me.updateTable(data);
				me.resetHeaderClasses();
			});
			
			me.sendTimes();
		});		
			
		d3.selectAll('.show').on('click', function(){
			me.setMaxRows(parseInt(this.id, 10));
			me.page = 0;
			me.renderPage();
		});

		$('input[type=checkbox]').change(function() {
			var box = this;
			var label = $(box)[0].nextSibling.textContent;

			if (!$(box).prop('checked')) {
				$('th').each(function(i, t){
					if (this.textContent === label) {
						me.headers.splice(i, 1);
					}
				});
			} else {
				me.headers.push(label);
			}

			me.createHeaders(me.headers, me.indexes);
			me.currentTableView.render();
			me.bindHeaderEvent();
		});
	};

	me.sorter = function(elem, colId) {
		elem = d3.select(elem);
		if (me.datas.length !== 0 && !elem.classed('no_sort')) {
			var newClass = elem.classed('asc') ? 'desc' : 'asc';

			me.update({
				count: me.max_items, 
				offset: Math.floor(me.page * me.max_rows / me.max_items) * me.max_items, 
				sort: newClass,
				sortKey: colId,
				start: me.start,
				end: me.end,
				date: me.dateType
			}, function(data) {
				me.updateTable(data);
				me.resetHeaderClasses();
						
				elem.classed('unsorted', false);
				elem.classed(newClass, true);
				
				me.sort = newClass;
				me.sortKey = colId;
				
				me.bindHeaderEvent();
			});
		}
	};
	
	me.getSortedColumn = function(){
		var cols = d3.selectAll('th')[0];
		var found = { 
			id: '-1',
			class: 'unsorted'
		};
		
		for (var i = 0; i < cols.length; i++){
			if (cols[i].className === 'asc' || cols[i].className === 'desc'){
				found.id = cols[i].id;
				found.class = cols[i].className;
				break;
			}
		}
		return found;
	};
	
	me.createHeaders = function(arr, indexes){
		me.indexes = indexes;
		me.dateType = $.inArray(me.dateType, arr) !== -1 ? me.dateType : arr[0];
		me.headers = arr;

		var headerId = 0;
		for (headerId = 0; headerId < me.headers.length; headerId++) {
			if (me.headers[headerId] === "_id") {
				me.idColumn = headerId;
			}
		}
	
		var header = d3.select('.data_table_data thead');
		header.selectAll('th').remove();

		for (var i = arr.length - 1; i >= 0; i--) {
			header.insert('th',':first-child')
				.text(arr[i]).attr('id', i)
				.attr('class', function(){
					return indexes.indexOf(arr[i]) === -1 ? 'no_sort' : 'unsorted';
				});
		}
	};

	me.createConfigOptions = function(arr) {
		for (var i = 0; i < arr.length; i++) {
			var vis = d3.select('#vis').append('li');
			vis.append('label').attr('for', 'check'+i).text(arr[i]);
			vis.insert('input', ':first-child')
				.attr('type', 'checkbox')
				.attr('id', 'check' + i);

			$('#check' + i).prop('checked', true);

			var sort = d3.select('#prim-sort').append('li');
			sort.append('label').attr('for', 'radio'+i).text(arr[i]);
			var radio = sort.insert('input', ':first-child')
				.attr('type', 'radio')
				.attr('id', 'radio' + i);


			if (arr[i] === '_id') {
				radio.attr('checked', 'checked');
			}
		}
	};
	
	me.sendTimes = function() {
		var time_data = me.currentTableView.getTimes();
		
		if (Date.parse(time_data[0])) {
			for (var i = 0; i < time_data.length; i++){ 
				time_data[i] = Date.parse(time_data[i]); 
			}
		
			me.announce(JSON.stringify({times:time_data}));
		}
	};
	
	me.setMaxRows = function(r) {
		if( r > 0 && r < me.max_items) {
			me.max_rows = r;
			me.temp_datas = me.datas.slice(0, me.max_rows);
			me.max_pages = Math.ceil( me.total / me.max_rows );
		}
	};
	
	me.addRow = function(item, that) {
		var ind = me.temp_datas.indexOf(item);
		var isIn = -1 === ind ? false : true;
		item = new row(item);
		
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
	
	me.validateDates = function() {
		var startdate = new Date(me.start);
		var enddate = new Date(me.end);
		if ( !Date.parse(me.start) ) {
			startdate = new Date(me.MIN);
		} 
		
		if ( !Date.parse(me.end) ) {
			enddate = new Date(me.MAX);
		}
		
		if ( startdate > enddate ) {
			startdate = new Date(me.MIN);
			enddate = new Date(me.MAX);
		}
		
		return [startdate, enddate];
	};
	
	me.setDefaultDateType = function(date_str) {
		me.dateType = date_str;
	};
	
	me.bindHeaderEvent = function() { 
		d3.selectAll('th').on('click', function() {
			d3.selectAll('th').on('click', null);
			var col = parseInt(this.id, 10);
			col = me.headers[col];
			me.sorter(this, col);
		});
	};

	me.resetHeaderClasses = function(){
		d3.selectAll('th').each(function(){
			if (d3.select(this).attr('class') !== 'no_sort') {		
				d3.select(this).classed('asc', false);
				d3.select(this).classed('desc', false);
				d3.select(this).classed('unsorted', true);
			}
		});
	};

	me.showFromList = function(objs){
		var ids = me.datas.map(function(e){ return e._id; });
		var temp = [];
		objs.forEach(function(obj){
			var ind = ids.indexOf(obj._id);
			if (ind !== -1){
				temp.push(me.datas[ind]);
			}
		});

		me.updateTable({docs: temp, total_count: objs.length}, true);
	};
};