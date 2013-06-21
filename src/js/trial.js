window.onload = function(){
	
	call_with_random();
	var interval = setInterval(call_with_random, 1000);

};


function add(num){

	var container = document.getElementById("container");
	var current = container.childNodes;
	var time = new Date();
	
	var piece = document.createElement("span");
	piece.time = time;
	piece.className = "element";
	piece.style.height = (num * 5) + "px";
	piece.onclick = send;
		//piece.style = "height: " + num * 10 + "px;";
		
	
	
 	container.insertBefore(piece, current[0]);
	
}
	
function call_with_random(){

	var rand = Math.floor((Math.random() * 20) +1);
	add(rand);
		
}
		
function send(){
	console.log(this.time);
	
}

