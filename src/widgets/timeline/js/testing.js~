OWF.relayFile = '/owf-sample-html/js/eventing/rpc_relay.uncompressed.html';

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
//			console.log(time);
			var month = time.getMonth().toString();
			if (month < 10){
				month = "0" + month;				
			}
			var day = time.getDate().toString();
			var year = time.getYear().toString();	
			
			var key = year + month + day;

			var container = document.getElementById("container");
			var current = container.childNodes;

			var bar = document.createElement("span");
			bar.className = "element";
			bar.style.height = (e.count * 10) + "px";
			bar.id = key;
			bar.onclick = send;
		 	container.insertBefore(bar, current[0]);
	}
};

var send = function send(){
	OWF.Eventing.publish("testChannel2", new Date(this.id));

}

owfdojo.addOnLoad(function(){
	OWF.ready(init);
});
