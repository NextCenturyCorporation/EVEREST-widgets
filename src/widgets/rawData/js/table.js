//is it bad that on change, a new table is created?
//should it instead update the collection data and re-render?
//that would have the same functionality as the initialization function
//performance and memory
var MIN = 0;
var MAX = Number.MAX_VALUE;
var table, apple;
var datas = [];
var temp = [];

var Sentence = Backbone.Model.extend({
	defaults: {	}
	//something needs to go here....
});

var Table = Backbone.Collection.extend({
	model: Sentence
});

/*The view for each sentence representation in the table. 
Each view will look like the following html
<tr><td>...</td><td>...</td>.......<td>...</td></tr> 
for each attribute of the sentence, create a td tag around it
which will correspond to a single column in this row*/
var SentenceView = Backbone.View.extend({
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

/*The view of the entire table holding all of the rows of sentences
rendering the table calls the function to render each sentence
in the available collection of sentences*/
var TableView = Backbone.View.extend({
	el:$('#raw_data'),
	initialize: function(te){
		this.collection = new Table(te);
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
		var sentView = new SentenceView({
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

/*Create the table based on start and end params, atm creates an
entirely new table, probs want to just re-render it on change of input
or addition of new data*/
function createTable(s, e){
	
	temp = extractData(s, e);	
	
	for (var i = 0; i < temp.length; i++){
		temp[i].time = new Date(Date.parse(temp[i].time));
	}
	
	table = new TableView(temp);
	return table;
}

function createClickers(){
	//add a listener to sort the rows based upon what column is clicked
	d3.selectAll("th")
		.on("click", function(){
			var col = parseInt(this.id, 10);
			col = Object.keys(temp[0])[col];
			
			if (this.className == "up"){
				d3.selectAll("th").attr("class","unsorted");
				this.className = "down";
				temp.sort( function (a, b){ return a[col] < b[col] ? 1 : -1; });
			} else {
				d3.selectAll("th").attr("class","unsorted");
				this.className = "up";
				temp.sort( function (a, b){ return a[col] > b[col] ? 1 : -1; });
			}
			table = new TableView(temp);
		});

	//grab times from forms for use in re-rendering the table will be removed
	//but shows example handling of future input from timeline widget
	d3.select('#submit')
		.on('click', function(){
			var s = Date.parse($('#start').val());
			var e = Date.parse($('#end').val());
			
			if (s && e && s <= e)
				createTable(s,e);
			else
				createTable(MIN,MAX);
				
			resetAndSend();
		});
	
	d3.select('#reset')
		.on('click', function(){
			createTable(MIN,MAX);
			resetAndSend();
		});
}

function getCenter(tag){
	var center = d3.select(tag).style("width");
	center = center.split("px")[0];
	return parseInt(center,10)/2;
}

function setLocations(){
	var center = getCenter("#hold");
	var title_center = getCenter("#title");
	var input_center = getCenter("#inputs");
	
	d3.select("#title").style("margin-left", (center - title_center) + "px");
	d3.select("#raw_data").attr("width", (center * 2) + "px");
	d3.select("#inputs").style("margin-left", (center - input_center) + "px");
}

/*Create the headers of the table*/
function createHeaders(arr){
	var header = d3.select("#raw_data");
	var h;
	for (var i = 0; i < arr.length; i++){
		h = header.append("th")
				.text(arr[i])
				.attr("id", i)
				.attr("class", "unsorted");
	}
}

/*Get a range of data based on start and end params
Returns a subset of the array of objects datas containing
only rows that occur in the specified time range*/
function extractData(start, end){
	var currData = [];
	for (var i = 0; i < datas.length; i++){
		var ti = Date.parse(datas[i].time);
		
		if (ti <= end && ti >= start) { currData.push(datas[i]); }
	}
	return currData;
}	

function resetAndSend(){
	d3.selectAll("th").attr("class","unsorted");
	$('#start').val('');
	$('#end').val('');
			
	apple = table.getTimes();
	for (i = 0; i< apple.length; i++){ apple[i] = Date.parse(apple[i]);	}
	
	OWF.Eventing.publish("testChannel1", JSON.stringify(apple));
}

d3.json('./raw_data.txt', function(text){
	
	datas = text;
	
	createHeaders(Object.keys(datas[0]));
	table = createTable(MIN,MAX);
	createClickers();
	setLocations();
	
	owfdojo.addOnLoad(function(){
		OWF.ready(function(){
			setInterval(resetAndSend, 10000);					//to be removed later on
		
			OWF.Eventing.subscribe("testChannel2", function(sender, msg){
				var range = msg.substring(1,msg.length - 1).split(',');
				createTable(Date.parse(range[0]), Date.parse(range[1]));
				resetAndSend();
			});
		});
	});
});

window.onresize = function(){
	setLocations();
};