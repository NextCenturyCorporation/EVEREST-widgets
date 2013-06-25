OWF.relayFile = '/owf-sample-html/js/eventing/rpc_relay.uncompressed.html';


	var events = [];
// Get an array of timestamps from Ashley
function init() {
	OWF.Eventing.subscribe("testChannel1", this.add);		

}
// For each item in the array:
// check to see if we've already added that day before
// if we have, increment that things height and rebuild it
// else, make a new bar with height 1


var add = function add(sender, msg){
	var objs = msg.substr(1,msg.length-1);
	objs = objs.split(",");
	var bars = [];
	
	for (var i = 0; i < objs.length; i++){
		var time = new Date(parseInt(objs[i]));
		var month = time.getMonth().toString();
		var day = time.getDate().toString();
		var year = time.getYear().toString();	
		console.log(year);
		if (month < 10){
			month = "0" + month;				
		}
		if (day < 10){
			day = "0" + day;			
		}
		year = year.substr(1,year.length);

		var key = year + month + day;
		console.log(key);
		if(!check(key)){		
			var bar = document.createElement("span");
			bar.className = "element";
			bar.style.height = 30 + "px";
			bar.id = objs[i];
			bar.onclick = send;
			bar.key = key;
			bars.push(bar);			
			
//	 	container.insertBefore(bar, current[0]);
			
			events.push(key);		 	
		}
	}
			bars.sort(function(a,b) {return a.key - b.key});
			var container = document.getElementById("container");
			var current = container.childNodes;
			
			for(var i = 0; i < bars.length; i++){
				container.appendChild(bars[i]);
			}

	
};

var send = function send(){
	var date = new Date(parseInt(this.id)).toString();
	OWF.Eventing.publish("testChannel2", date);

}

owfdojo.addOnLoad(function(){
	OWF.ready(init);
});

var check = function check(key){
	for(var i = 0; i < events.length; i++){
				if(events[i] === key){
					i++;
					return true;					
				} 
		}	
		return false;		
}
