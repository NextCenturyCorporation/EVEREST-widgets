var draw = function(){
	var me =  this;
	var svg, node, path;
	var dx = 0, dy = 0;
		
	var count = 0;
	var color = d3.scale.category20();
	me.radius = 8;
	
	me.canvasW = 500, me.canvasH = 500,
	 	me.toolW = 150, me.toolH = 500;
	 	
	me.toolC = { x: (me.toolW / 2), y: (me.toolH / 2) };
	me.canvasC = { x: (me.canvasW / 2), y: (me.canvasH / 2) };
	
	me.asserts = [];
	
	me.createCanvas = function(){
		
		var canvas = d3.select('.canvas');
		var svg = canvas.append('svg')
			.attr('width', me.canvasW)
			.attr('height', me.canvasH);
	}
	
	me.createToolbar = function(){
		var toolBar = d3.select('.toolbar');
		svg = toolBar.append('svg')
			.attr('width', me.toolW)
			.attr('height', me.toolH);
			
		node = svg.append('circle')
			.attr('class', 'entity')
			.attr('cx', me.toolC.x)
			.attr('cy', me.toolC.y - 75)
			.attr('r', me.radius);
			
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
					.attr('cx', me.canvasC.x + dx)
					.attr('cy', me.canvasC.y + dx)
					.attr('r', me.radius)
					.call(d3.behavior.drag().on('drag', me.move))
					.on('dblclick', me.doubleClickNode)
					.on('mouseover', me.mouseover)
					.on('mouseout', me.mouseout); 
						
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
			.on('click', function(){
				d3.select('.canvas svg').selectAll('g').remove();
				me.asserts = [];
			});
		
		div.append('button')
			.text('Submit')
			.on('click', function(){
				console.log(JSON.stringify(me.asserts));
			});
	}
	
	me.move = function(){
		me.moveCircles(this.parentNode);
		me.moveLines(this.parentNode);
	};
	
	me.moveLines = function(parent){
		d3.select(parent).selectAll('line')
			.each(function(d,i){
				var line = d3.select(this);
				
				line.attr('x1', function() { 
						var newC = d3.event.dx + parseInt(line.attr('x1')); 
						return me.computeCoord(newC, 'x');
					})
					.attr('y1', function() { 
						var newC = d3.event.dy + parseInt(line.attr('y1')); 
						return me.computeCoord(newC, 'y'); 
					})
					.attr('x2', function() { 
						var newC = d3.event.dx + parseInt(line.attr('x2')); 
						return me.computeCoord(newC, 'x');
					})
					.attr('y2', function() { 
						var newC = d3.event.dy + parseInt(line.attr('y2')); 
						return me.computeCoord(newC, 'y'); 
					});
			});
	};
	
	me.moveCircles = function(parent){
		d3.select(parent).selectAll('circle')
			.each(function(d,i){
				var circle = d3.select(this);
				
				circle.attr('cx', function() { 
					var newC = d3.event.dx + parseInt(circle.attr('cx'));
					return me.computeCoord(newC, 'x');
				})
				.attr('cy', function() { 
					var newC =  d3.event.dy + parseInt(circle.attr('cy'));
					return me.computeCoord(newC, 'y'); 
				});
			});
	};
	
	me.doubleClickNode = function(){	
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
				.attr('x1', function(){ return me.computeCoord(cx, 'x'); })
				.attr('y1', function(){ return me.computeCoord(cy, 'y'); })
				.attr('x2', function(){ return me.computeCoord(cx + r*dx, 'x'); })
				.attr('y2', function(){ return me.computeCoord(cy + r*dy, 'y'); })
				.on('mouseover', me.mouseover)
				.on('mouseout', me.mouseout); 
				
			var newC = net.append('circle')
				.attr('d', $('.ent2').val())
				.attr('class', parentLayer + 1)
				.attr('cx', function(){ return me.computeCoord(cx + r*dx, 'x'); })
				.attr('cy', function(){ return me.computeCoord(cy + r*dy, 'y'); })
				.attr('r', me.radius)
				.style('fill', color(parentLayer + 1))
				.call(d3.behavior.drag().on('drag', me.dragGroup))
				.on('dblclick', me.doubleClickNode)
				.on('mouseover', me.mouseover)
				.on('mouseout', me.mouseout); 
				
			me.asserts.push({
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
		
	me.dragGroup = function(){
		var circle = d3.select(this);
		circle.attr('cx', function() { 
				var newC = d3.event.dx + parseInt(circle.attr('cx'));
				return me.computeCoord(newC, 'x'); 
			})
			.attr('cy', function() { 
				var newC =  d3.event.dy + parseInt(circle.attr('cy'));
				return me.computeCoord(newC, 'y'); 
			});
			
		var line = d3.select(this.parentNode).select('line');
		line.attr('x2', function() { 
				var newC = d3.event.dx + parseInt(line.attr('x2')); 
				return me.computeCoord(newC, 'x');
			})
			.attr('y2', function() { 
				var newC = d3.event.dy + parseInt(line.attr('y2')); 
				return me.computeCoord(newC, 'y');
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
				return me.computeCoord(newC, 'x');
			})
			.attr('y1', function() { 
				var newC = d3.event.dy + parseInt(l.attr('y1'));
				return me.computeCoord(newC, 'y');
			});
		});
	}
	
	me.mouseover = function(){
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
	
	me.mouseout = function(){
		d3.selectAll('text').remove();
	}
	
	me.computeCoord = function(newC, axis){
		var max = axis === 'x' ? me.canvasW : me.canvasH;
		if (newC < 0){
			return 0;
		} else if (newC > max){
			return max;
		} else {
			return newC;
		}
	}
};