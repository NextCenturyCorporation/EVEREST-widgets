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
	
	for (var i = 0; i < objs.length; i++){
		var time = new Date(parseInt(objs[i]));
		var month = time.getMonth().toString();
		var day = time.getDate().toString();
		var year = time.getYear().toString();	
		if (month < 10){
			month = "0" + month;				
		}
		if (day < 10){
			day = "0" + day;			
		}

		var key = year + month + day;
		if(!check(key)){		
		
			var container = document.getElementById("container");
			var current = container.childNodes;

			var bar = document.createElement("span");
			bar.className = "element";
			bar.style.height = 30 + "px";
			bar.id = objs[i];
			bar.onclick = send;
		 	container.insertBefore(bar, current[0]);
			
			events.push(key);		 	
		}
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
				console.log(events[i] + " against " + key);
				if(events[i] === key){
					return true;					
				} 
				return false;		
		}	
}
