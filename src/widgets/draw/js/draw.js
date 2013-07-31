var svg, node, path;
var dx = 0, dy = 0;
	
var count = 0;
var color = d3.scale.category20();
var radius = 8;

var canvasW = 500, canvasH = 500,
 	toolW = 150, toolH = 400;
 	
var toolC = { x: (toolW / 2), y: (toolH / 2) };
var	canvasC = { x: (canvasW / 2), y: (canvasH / 2) };

var asserts = [];

function createCanvas(){
	
	var canvas = d3.select('.canvas');
	var svg = canvas.append('svg')
		.attr('width', canvasW)
		.attr('height', canvasH);
}

function createToolbar(){
	var toolBar = d3.select('.toolbar');
	svg = toolBar.append('svg')
		.attr('width', toolW)
		.attr('height', toolH);
		
	node = svg.append('circle')
		.attr('class', 'entity')
		.attr('cx', toolC.x)
		.attr('cy', toolC.y - 75)
		.attr('r', radius);
		
	node.on('click', function(){
							
		$('.ent1-form').animate({
			top:( $('.canvas').height() / 2 ) - ( $('.ent1-form').height() / 2 )
		}, 750);
		$('.ent1').focus();
		
		d3.select('.ent').on('click', function(){
			var group = d3.select('.canvas svg')
				.append('g')
				.attr('class', count);
				
			var circle = group.append('circle')
				.attr('d', $('.ent1').val())
				.attr('class', 0)
				.attr('cx', canvasC.x + dx)
				.attr('cy', canvasC.y + dx)
				.attr('r', radius)
				.call(d3.behavior.drag().on('drag', move))
				.on('dblclick', doubleClickNode)
				.on('mouseover', mouseover)
				.on('mouseout', mouseout); 
					
			count++;
			
			dx += 2;
			
			$('.ent1').val('');
			$('.ent1-form').animate({
				top: '-'+ 2*$('.ent1-form').height()
			}, 750);
		});
	});
	
	var div = d3.select('body').append('div');
	
	div.append('button')
		.text('Reset')
		d3.select('reset').on('click', function(){
			d3.select('.canvas svg').selectAll('g').remove();
		});
	
	div.append('button')
		.text('Submit')
		.on('click', function(){
			console.log(JSON.stringify(asserts));
		});
}

function move(){
	moveCircles(this.parentNode);
	moveLines(this.parentNode);
};

function moveLines(parent){
	d3.select(parent).selectAll('line')
		.each(function(d,i){
			var line = d3.select(this);
			
			line.attr('x1', function() { 
					var newC = d3.event.dx + parseInt(line.attr('x1')); 
					return computeCoord(newC, 'x');
				})
				.attr('y1', function() { 
					var newC = d3.event.dy + parseInt(line.attr('y1')); 
					return computeCoord(newC, 'y'); 
				})
				.attr('x2', function() { 
					var newC = d3.event.dx + parseInt(line.attr('x2')); 
					return computeCoord(newC, 'x');
				})
				.attr('y2', function() { 
					var newC = d3.event.dy + parseInt(line.attr('y2')); 
					return computeCoord(newC, 'y'); 
				});
		});
};

function moveCircles(parent){
	d3.select(parent).selectAll('circle')
		.each(function(d,i){
			var circle = d3.select(this);
			
			circle.attr('cx', function() { 
				var newC = d3.event.dx + parseInt(circle.attr('cx'));
				return computeCoord(newC, 'x');
			})
			.attr('cy', function() { 
				var newC =  d3.event.dy + parseInt(circle.attr('cy'));
				return computeCoord(newC, 'y'); 
			});
		});
};

function doubleClickNode(){	
	$('.rel-form').animate({
		top: ( $('.canvas').height() / 2 ) - ( $('.rel-form').height() / 2 )
	}, 750);
	$('.relate').focus();		//apparently errors in IE if focus before visible
	
	var that = this;
	
	d3.select('.rel').on('click', function(){
	
		var deg = 360 * Math.random();
		var c = d3.select(that);
		var r = c.attr('r');
		var parentLayer = parseInt(c.attr('class'), 10);
		var dx = r * Math.cos(deg);
		var dy = r * Math.sin(deg);
		
		var group = d3.select(that.parentNode);
		var net = group.append('g');
		
		var cx = parseInt(c.attr('cx'), 10);
		var cy = parseInt(c.attr('cy'), 10);
		
		var p = net.append('line')
			.attr('d', $('.relate').val())
			.attr('x1', function(){ return computeCoord(cx, 'x'); })
			.attr('y1', function(){ return computeCoord(cy, 'y'); })
			.attr('x2', function(){ return computeCoord(cx + r*dx, 'x'); })
			.attr('y2', function(){ return computeCoord(cy + r*dy, 'y'); })
			.on('mouseover', mouseover)
			.on('mouseout', mouseout); 
			
		var newC = net.append('circle')
			.attr('d', $('.ent2').val())
			.attr('class', parentLayer + 1)
			.attr('cx', function(){ return computeCoord(cx + r*dx, 'x'); })
			.attr('cy', function(){ return computeCoord(cy + r*dy, 'y'); })
			.attr('r', radius)
			.style('fill', color(parentLayer + 1))
			.call(d3.behavior.drag().on('drag', dragGroup))
			.on('dblclick', doubleClickNode)
			.on('mouseover', mouseover)
			.on('mouseout', mouseout); 
			
		asserts.push({
			entity1: c.attr('d'),
			relationship: $('.relate').val(),
			entity2: $('.ent2').val()
		});
			
		that.parentNode.appendChild(that);
		
		$('.relate').val('');
		$('.ent2').val('');
		$('.rel-form').animate({
			top: '-'+ 2*$('.rel-form').height()
		}, 750);
	});	
};

function dragGroup(){
	var circle = d3.select(this);
	circle.attr('cx', function() { 
			var newC = d3.event.dx + parseInt(circle.attr('cx'));
			return computeCoord(newC, 'x'); 
		})
		.attr('cy', function() { 
			var newC =  d3.event.dy + parseInt(circle.attr('cy'));
			return computeCoord(newC, 'y'); 
		});
		
	var line = d3.select(this.parentNode).select('line');
	line.attr('x2', function() { 
			var newC = d3.event.dx + parseInt(line.attr('x2')); 
			return computeCoord(newC, 'x');
		})
		.attr('y2', function() { 
			var newC = d3.event.dy + parseInt(line.attr('y2')); 
			return computeCoord(newC, 'y');
		});
		
	var immKids = this.parentNode.childNodes;
	var groups = [];
	
	for (var i = 0; i < immKids.length; i++){
		if (immKids[i].localName === 'g'){ groups.push(immKids[i]);	}
	}
	
	d3.selectAll(groups).each(function(d, i){
		var l = d3.select(this).select('line');
		l.attr('x1', function() { 
			var newC = d3.event.dx + parseInt(l.attr('x1'));
			return computeCoord(newC, 'x');
		})
		.attr('y1', function() { 
			var newC = d3.event.dy + parseInt(l.attr('y1'));
			return computeCoord(newC, 'y');
		});
	});
}

function mouseover(){
	var x = 0, y = 0;
		
	var c = d3.select(this);
	
	if(this.localName === 'circle'){
		x = parseInt(c.attr('cx'), 10) + 15;
		y = parseInt(c.attr('cy'), 10) - 15;
	} else if (this.localName === 'line'){
		x = ((parseInt(c.attr('x1'), 10) + parseInt(c.attr('x2'), 10)) / 2) + 15;
		y = ((parseInt(c.attr('y1'), 10) + parseInt(c.attr('y2'), 10)) / 2) - 15;
	} 
		
	d3.select(this.parentNode).append('text')
		.attr('x', x).attr('y', y)
		.text(c.attr('d'));
}

function mouseout(){
	d3.selectAll('text').remove();
}

function computeCoord(newC, axis){
	var max = axis === 'x' ? canvasW : canvasH;
	if (newC < 0){
		return 0;
	} else if (newC > max){
		return max;
	} else {
		return newC;
	}
}