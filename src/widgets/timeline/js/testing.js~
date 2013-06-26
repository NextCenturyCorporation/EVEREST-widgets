OWF.relayFile = '/owf-sample-html/js/eventing/rpc_relay.uncompressed.html';
owfdojo.addOnLoad(function(){
	OWF.ready(init);
});

var bars = [];

function init() {
	OWF.Eventing.subscribe("testChannel1", this.add);		

}

var add = function add(sender, msg){
	var objs = msg.split("[");
	var objs1 = objs[1].split("]");
	var objs2 = objs1[0];
	console.log(objs);
	objs = objs.split(",");

	
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
		
		if(checkResult == 0){		
			console.log("creating new: " + date);
			var bar = document.createElement("span");
			bar.className = "element";
			bar.style.height = 30 + "px";
			bar.id = date;
			bar.onclick = send;
			bar.keys = [];
			bar.keys.push(key);		
			bars.push(bar);
		} else if (checkResult == -1) {
				//do nothing
		} else {
			console.log("updating old: " + date);
			var h = checkResult.style.height;		
			checkResult.style.height = (parseInt(h.substr(0,2)) + 10) + "px";
			checkResult.keys.push(key);
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
	var date1 = new Date(parseInt(this.keys[0]));
	date1.setHours(0);
	date1.setSeconds(0);
	date1.setMilliseconds(0);
	var date2 = new Date(parseInt(this.keys[0]));
	date2.setDate(date2.getDate() + 1);
	date2.setHours(0);
	date2.setSeconds(0);
	date2.setMilliseconds(0);
	OWF.Eventing.publish("testChannel2", "["+date1.toString()+","+date2.toString()+"]");

}



var check = function check(key, date){
	console.log(key + " key, " + date);
	for(var i = 0; i < bars.length; i++){
	//	console.log("checking date " + bars[i].id)
				if(bars[i].id === date){
					console.log("date match");
					console.log("checking " + bars[i].keys.length + " keys");
					for(var k = 0; k < bars[i].keys.length; k++){
							if(bars[i].keys[k] === key){
								console.log("key match");
								return -1;								
								}
						}
					console.log("no key match");
					return bars[i];			
				} 
		}	
		console.log("no date match");
		return 0;		
}

