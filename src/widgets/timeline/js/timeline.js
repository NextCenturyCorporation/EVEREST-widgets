OWF.relayFile = '/owf-sample-html/js/eventing/rpc_relay.uncompressed.html';

// Set up dojo stuff
owfdojo.addOnLoad(function(){
	OWF.ready(init);
});

// Array to hold all the "date" bars
var bars = [];

// Subscribe to the channel provided by raw feed widget
function init() {
	OWF.Eventing.subscribe("com.nextcentury.everest.data_table_announcing.raw_data", this.add);		
}

// Add the new elements to the group
var add = function add(sender, msg){
	var objs = msg.split("[");
	var objs1 = objs[1].split("]");
	var objs2 = objs1[0];
	objs = objs2.split(",");

	// For every object given by raw data feed:
	for (var i = 0; i < objs.length; i++){
		var time = new Date(parseInt(objs[i]));
		var month = time.getMonth() + 1;
		month = month.toString();
		var day = time.getDate().toString();
		var year = time.getYear().toString();	
		if (month < 10){
			month = "0" + month;				
		}
		if (day < 10){
			day = "0" + day;			
		}
		year = "20" + year.substr(1);
		var date = year + month + day;
		var key = objs[i];
		var checkResult = check(key, date);
		
		// Check to see if the date already exists
		// if it doesn't, add a new bar
		if(checkResult == 0){		
			//console.log("creating new: " + date);
			var bar = document.createElement("span");
			bar.className = "element";
			bar.style.height = 30 + "px";
			bar.id = date;
			bar.onclick = send;
			bar.keys = [];
			bar.keys.push(key);		
			bars.push(bar);
		// if the date matches something but the key is already in the date listing, do nothing (duplicate)
		} else if (checkResult == -1) {
				//do nothing
		} else {
			// if the date matches but key does not match, increment the height of that bar
			//console.log("updating old: " + date);
			var h = checkResult.style.height;		
			checkResult.style.height = (parseInt(h.substr(0,2)) + 10) + "px";
			checkResult.keys.push(key);
		}
	}
	
	// Sort the bars by date and add them to the timeline
	bars.sort(function(a,b) {return a.id - b.id});
	var container = document.getElementById("container");
	var current = container.childNodes;
	
	// Add bar in the right location
	for(var i = 0; i < bars.length; i++){
		if(document.getElementById(bars[i].id) == null){
					container.appendChild(bars[i]);
			}
	}
};

// When a bar is clicked, send the date range (one day) to the raw feed widget
var send = function send(){
	var date1 = new Date(parseInt(this.keys[0]));
	date1.setHours(0);
	date1.setSeconds(0);
	date1.setMilliseconds(0);
	var date2 = new Date(parseInt(this.keys[0]));
	date2.setDate(date2.getDate() + 1);
	date2.setHours(0);
	date2.setSeconds(0);
	date2.setMilliseconds(0);
	OWF.Eventing.publish("com.nextcentury.everest.timeline_announcing", "["+date1.toString()+","+date2.toString()+"]");

};


// Check to see if a new date bar is required or an update to an old one is required
var check = function check(key, date){
	//console.log(key + " key, " + date);
	for(var i = 0; i < bars.length; i++){
	//	console.log("checking date " + bars[i].id)
				if(bars[i].id === date){
					//console.log("date match");
					//console.log("checking " + bars[i].keys.length + " keys");
					for(var k = 0; k < bars[i].keys.length; k++){
							if(bars[i].keys[k] === key){
								//console.log("key match");
								return -1;								
								}
						}
					//console.log("no key match");
					return bars[i];			
				} 
		}	
		//console.log("no date match");
		return 0;		
};

