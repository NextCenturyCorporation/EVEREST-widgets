OWF.relayFile = '/owf-sample-html/js/eventing/rpc_relay.uncompressed.html';

var bars = [];
function init() {
	OWF.Eventing.subscribe("testChannel1", this.add);		

}

var add = function add(sender, msg){
	var objs = msg.substr(1,msg.length-1);
	objs = objs.split(",");

	
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
		
		if(!check(key)){		
			var bar = document.createElement("span");
			bar.className = "element";
			bar.style.height = 30 + "px";
			bar.id = objs[i];
			bar.onclick = send;
			bar.key = key;
			bars.push(bar);			
	 	
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
	var date = new Date(parseInt(this.id));
	var year = date.getYear();
	var month = date.getMonth();
	var day = date.getDate();
	var date1 = new Date();
	date1.setFullYear(year, month, day);
	var date2 = new Date();
	date2.setFullYear(year, month, day + 1);
	var d1 = date1.parse();
	var d2 = date2.parse();

	var range = "[" + d1 + "," + d2 +"]";
	OWF.Eventing.publish("testChannel2", range);

}

owfdojo.addOnLoad(function(){
	OWF.ready(init);
});

var check = function check(key){
	for(var i = 0; i < bars.length; i++){
				if(bars[i].key === key){
					return true;					
				} 
		}	
		return false;		
}
