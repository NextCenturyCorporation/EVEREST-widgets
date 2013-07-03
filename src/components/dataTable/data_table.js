var data_table = {
	MIN: 0,
	MAX: Number.MAX_VALUE,
	datas: null
}
	
data_table.sentence = Backbone.Model.extend({
	defaults: {	}
	//something needs to go here....
});

data_table.table = Backbone.Collection.extend({
	model: data_table.sentence
});

data_table.sentenceView = Backbone.View.extend({
	tagName: 'tr',
	className: 'unlit',
	initialize: function(){
		this.render();
	},
	render: function(){
		//get keys and values of the attributes of this model
		var keys = Object.keys(this.model.attributes);
		var vals = [];
		for (var i = 0; i < keys.length; i++)
			vals[i] = this.model.attributes[keys[i]];
	
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
				.text(function(d){ 
					if (typeof(d) === 'object') {
						// Don't display GMT part and after (for now)?
						var reg = /(.*) GMT-/i;
						var results = reg.test(d.toString());
						return RegExp.$1;
					}
					return d;
				});
		return this;
	}
});

data_table.tableView = Backbone.View.extend({
	el:$('#raw_data'),
	initialize: function(te){
		this.collection = new data_table.table(te);
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
		var sentView = new data_table.sentenceView({
			model: item
		});
		//render this item and add it to the table
		this.$el.append(sentView.render().el);
	},
	getTimes: function(){
		//underscore function to grab all of the times from the data
		return this.collection.pluck('time');							//JSON
	}
});

data_table.createTable = function(s, e){
	var tableView = this.tableView;
	
	temp = data_table.extractData(s, e);	

	for (var i = 0; i < temp.length; i++){
		temp[i].time = new Date(temp[i].time);
	}

	table = new data_table.tableView(temp);
	return table;
};

data_table.createClickers = function() {
	//add a listener to sort the rows based upon what column is clicked
	d3.selectAll("th")
		.on("click", function() {
			var col = parseInt(this.id, 10);
			col = Object.keys(temp[0])[col];
			data_table.sorter(this, col);
			table = new tableView(temp);
		});

	//grab times from forms for use in re-rendering the table will be removed
	//but shows example handling of future input from timeline widget
	d3.select('#submit')
		.on('click', function(){
			var s = Date.parse($('#start').val());
			var e = Date.parse($('#end').val());
			$('#start').val('');
			$('#end').val('');
		
			if (s && e && s <= e) { data_table.createTable(s,e); }
			else { data_table.createTable(MIN,MAX); }
			
			resetAndSend();
		});

	d3.select('#reset')
		.on('click', function(){
			data_table.createTable(MIN,MAX);
			resetAndSend();
		});
};

data_table.sorter = function(elem, colId){
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
data_table.getCenter = function(tag){
	var width = d3.select(tag).style("width");
	width = width.split("px")[0];
	return parseInt(width,10)/2;
}

/*Allows for automatic resizing and recentering of all objects within the
widget when the window/frame is resized */
data_table.setLocations = function(){
	var center = getCenter("#hold");
	var title_center = getCenter("#title");
	var input_center = getCenter("#inputs");
	
	//push title and inputs over until they are centered
	d3.select("#title").style("margin-left", (center - title_center) + "px");
	d3.select("#inputs").style("margin-left", (center - input_center) + "px");
	
	//expand the table until it takes up entire width of frame
	d3.select("#raw_data").style("width", (center * 2) + "px");
}

/*Create the headers of the table*/
data_table.createHeaders = function(arr){
	var header = d3.select("#raw_data");
	for (var i = 0; i < arr.length; i++){
		header.append("th")
				.text(arr[i])
				.attr("id", i)
				.attr("class", "unsorted");
	}
	return header;
}

/*Get a range of data based on start and end params
Returns a subset of the array of objects datas containing
only rows that occur in the specified time range*/
data_table.extractData = function(start, end) {
	var currData = [];
	for (var i = 0; i < this.datas.length; i++){
		var ti = Date.parse(this.datas[i].time);
	
		if (ti <= end && ti >= start) { currData.push(this.datas[i]); }
	}
	return currData;
};

data_table.resetAndSend = function(){
	var headers = d3.selectAll("th").attr("class","unsorted");
	//$('#start').val('');
	//$('#end').val('');
			
	apple = table.getTimes();
	for (i = 0; i < apple.length; i++){ apple[i] = Date.parse(apple[i]); }
	
	OWF.Eventing.publish("testChannel1", JSON.stringify(apple));
};

data_table.execute = function() {

	d3.json('./raw_data.txt', function(text){
		if (text){
			$('#title').html('<h1>'+text.title+'</h1>');
			datas = text.fields;
		
			createHeaders(Object.keys(datas[0]));
			table = data_table.createTable(MIN,MAX);
			data_table.createClickers();
			setLocations();
		
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

	window.onresize = function(){
		setLocations();
	};
};
