var draw = function(){
	var me =  this;
	var dx = 0, dy = 0;
		
	var count = 0;
	var color = d3.scale.category20();
	var shift = 25;
	me.radius = 8;
	me.arrowlength = 10;
	
	me.canvasW = 500, me.canvasH = 500,
	 	me.toolW = 150, me.toolH = 500;
	 	
	me.toolC = { x: (me.toolW / 2), y: (me.toolH / 2) };
	me.canvasC = { x: (me.canvasW / 2), y: (me.canvasH / 2) };
	
	me.asserts = [];
	
	me.mode = "";
	me.lastNodeClicked = null;
	me.num_tools = 0;
	
	me.toggleSelection = function(){
		var item = d3.select(this);
		me.lastNodeClicked = null;
		if(item.select('rect').classed('unselect')){
			d3.selectAll('rect').classed('select', false);
			d3.selectAll('rect').classed('unselect', true);
			item.select('rect')
				.classed('unselect', false)
				.classed('select', true);
			me.mode = item.attr('class');
		} else {
			item.select('rect')
				.classed('select', false)
				.classed('unselect', true);
			me.mode = '';
			me.removeAllLabels();
		}	
		
		if(me.mode === 'label_hold'){
			d3.selectAll('.canvas circle').each(me.addLabel);
			d3.selectAll('.canvas line').each(me.addLabel);
		}
	};
	
	me.createSelection = function(svg, class_name){
		me.num_tools++;
		var selection = svg.append('g')
			.attr('class', class_name)
			.on('click', me.toggleSelection);
		
		selection.append('rect')
			.attr('class', 'unselect')
			.attr('x', me.toolC.x - me.radius - 2)
			.attr('y', me.num_tools * shift - me.radius - 2)
			.attr('width', 2*(me.radius + 2) )
			.attr('height', 2*(me.radius + 2) );
			
		return selection;
	};
	
	me.createCanvas = function(){
		
		var canvas = d3.select('.canvas');
		var svg = canvas.append('svg')
			.attr('width', me.canvasW)
			.attr('height', me.canvasH)
			.on('click', function(){
				if (me.mode === 'node_hold'){
					var ev = d3.mouse(this);
					me.appendCircle(ev);
				}
			});
	};
	
	me.createToolbar = function(){
		var toolBar = d3.select('.toolbar');
		var svg = toolBar.append('svg')
			.attr('width', me.toolW)
			.attr('height', me.toolH);
			
		var label_hold = me.createSelection(svg, 'label_hold');
		label_hold.append('text')
			.attr('x', me.toolC.x)
			.attr('y', me.num_tools * shift)
			.attr('text-anchor', 'middle')
			.attr('dy', '0.35em')
			.text('abc');
		
		var node_hold = me.createSelection(svg, 'node_hold');
			
		node_hold.append('circle')
			.attr('class', 'entity')
			.attr('cx', me.toolC.x)
			.attr('cy', me.num_tools * shift)
			.attr('r', me.radius);
		
		var rel_hold = me.createSelection(svg, 'rel_hold');
			
		rel_hold.append('line')
			.attr('class', 'relationship')
			.attr('x1', me.toolC.x - me.radius)
			.attr('y1', me.num_tools * shift - me.radius)
			.attr('x2', me.toolC.x + me.radius)
			.attr('y2', me.num_tools * shift + me.radius);
				
		var mover_hold = me.createSelection(svg, 'mover_hold');
			
		mover_hold.append('line')
			.attr('x1', me.toolC.x)
			.attr('y1', me.num_tools * shift - me.radius)
			.attr('x2', me.toolC.x)
			.attr('y2', me.num_tools * shift + me.radius);
		
		mover_hold.append('line')
			.attr('x1', me.toolC.x - me.radius)
			.attr('y1', me.num_tools * shift)
			.attr('x2', me.toolC.x + me.radius)
			.attr('y2', me.num_tools * shift);	
				
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
	};
	
	me.appendCircle = function(mouse_event){
		$('.ent1-form').animate({
			top:( $('.canvas').height() / 2 ) - ( $('.ent1-form').height() / 2 )
		}, 750);
		$('.ent1').focus();
		
		d3.select('.ent-submit').on('click', function(){
		
			var group = d3.select('.canvas svg')
				.append('g').attr('class', count);
			
			var circle = group.append('circle')
				.attr('d', $('.ent1').val())
				.attr('class', 0)
				.attr('cx', mouse_event[0])
				.attr('cy', mouse_event[1])
				.attr('r', me.radius)
				.call(d3.behavior.drag().on('drag', me.move))
				.on('dblclick', me.doubleClickNode)
				.on('mouseover', me.addLabel)
				.on('mouseout', me.removeAllLabels)
				.on('click', me.mouseclick);
					
			count++;
			
			$('.ent1').val('');
			$('.ent1-form').animate({
				top: '-'+ 2*$('.ent1-form').height()
			}, 750);
		
		});
	};
	
	/** 
		move every element that is attached to what was dragged
	*/
	me.move = function(){
		if(me.mode === 'mover_hold'){
			var start = this;
			while (start.parentNode.localName !== 'svg'){
				start = start.parentNode;
			}
			me.moveCircles(start);
			me.moveLines(start);
		} else if (me.mode === ''){
			me.dragGroup(this);
		}
	};
	
	
	/**
		moves all lines including relationship lines and arrows
	*/
	me.moveLines = function(parent){
		d3.select(parent).selectAll('line')
			.each(function(d,i){
				var line = d3.select(this);
				
				line.attr('x1', function() { 
						var newC = d3.event.dx + parseInt(line.attr('x1')); 
						return me.computeCoord(newC, 'x');
					}).attr('y1', function() { 
						var newC = d3.event.dy + parseInt(line.attr('y1')); 
						return me.computeCoord(newC, 'y'); 
					}).attr('x2', function() { 
						var newC = d3.event.dx + parseInt(line.attr('x2')); 
						return me.computeCoord(newC, 'x');
					}).attr('y2', function() { 
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
				}).attr('cy', function() { 
					var newC =  d3.event.dy + parseInt(circle.attr('cy'));
					return me.computeCoord(newC, 'y'); 
				});
			});
	};
	
	me.mouseclick = function(){
		if(me.mode === 'rel_hold'){
			if (me.lastNodeClicked === null){
				me.lastNodeClicked = this;
			} else if(this === me.lastNodeClicked){
				return;
			} else {
				//this is the second node clicked, 
				//draw a line between the two
				$('.rel-form').animate({
					top: ( $('.canvas').height() / 2 ) - ( $('.rel-form').height() / 2 )
				}, 750);
				$('.rel-only').focus();		//apparently errors in IE if focus before visible
				
				var that = this;
				
				d3.select('.rel-submit').on('click', function(){	
					var c1 = d3.select(me.lastNodeClicked);
					var c2 = d3.select(that);
					
					var p1 = {
						x:parseInt(c1.attr('cx'), 10),
						y:parseInt(c1.attr('cy'), 10)
					};
					
					var p2 = {
						x:parseInt(c2.attr('cx'), 10),
						y:parseInt(c2.attr('cy'), 10)
					};
					
					d3.select(that.parentNode).insert('line', ':first-child')
						.attr('class', 'relation')
						.attr('d', $('.rel-only').val())
						.attr('x1', function(){ return me.computeCoord(p1.x, 'x'); })
						.attr('y1', function(){ return me.computeCoord(p1.y, 'y'); })
						.attr('x2', function(){ return me.computeCoord(p2.x, 'x'); })
						.attr('y2', function(){ return me.computeCoord(p2.y, 'y'); })
						.on('mouseover', me.addLabel)
						.on('mouseout', me.removeAllLabels); 
					
					me.createArrow(p1, p2, that);
					
						
					me.lastNodeClicked.parentNode.appendChild(that.parentNode);
					me.lastNodeClicked.parentNode.appendChild(me.lastNodeClicked);
					me.lastNodeClicked = null;
					
					$('.rel-only').val('');
					$('.rel-form').animate({
						top: '-'+ 2*$('.rel-form').height()
					}, 750);
				});
						
			}
		}
	}
	
	me.doubleClickNode = function(){
		if (me.mode === ''){	
			$('.rel-ent2-form').animate({
				top: ( $('.canvas').height() / 2 ) - ( $('.rel-ent2-form').height() / 2 )
			}, 750);
			$('.relate').focus();		//apparently errors in IE if focus before visible
			
			var that = this;
			
			d3.select('.rel-ent-submit').on('click', function(){
			
				var deg = 360 * Math.random();
				var circle = d3.select(that);
				var r = circle.attr('r');
				var parentLayer = parseInt(circle.attr('class'), 10);
				var dx = r * Math.cos(deg);
				var dy = r * Math.sin(deg);
				
				var group = d3.select(that.parentNode);
				var net = group.append('g');
				
				var p1 = {
					x:parseInt(circle.attr('cx'), 10),
					y:parseInt(circle.attr('cy'), 10)
				};
				
				var p2 = {
					x:p1.x + r*dx,
					y:p1.y + r*dy
				};
				
				net.append('line')
					.attr('class', 'relation')
					.attr('d', $('.relate').val())
					.attr('x1', function(){ return me.computeCoord(p1.x, 'x'); })
					.attr('y1', function(){ return me.computeCoord(p1.y, 'y'); })
					.attr('x2', function(){ return me.computeCoord(p2.x, 'x'); })
					.attr('y2', function(){ return me.computeCoord(p2.y, 'y'); })
					.on('mouseover', me.addLabel)
					.on('mouseout', me.removeAllLabels); 

				net.append('circle')
					.attr('d', $('.ent2').val())
					.attr('class', parentLayer + 1)
					.attr('cx', function(){ return me.computeCoord(p2.x, 'x'); })
					.attr('cy', function(){ return me.computeCoord(p2.y, 'y'); })
					.attr('r', me.radius)
					.style('fill', color(parentLayer + 1))
					.call(d3.behavior.drag().on('drag', me.move))
					.on('dblclick', me.doubleClickNode)
					.on('mouseover', me.addLabel)
					.on('mouseout', me.removeAllLabels)
					.on('click', me.mouseclick);
				
				me.createArrow(p1, p2, that);
				
				me.asserts.push({
					entity1: circle.attr('d'),
					relationship: $('.relate').val(),
					entity2: $('.ent2').val()
				});
					
				that.parentNode.appendChild(that);
				
				$('.relate').val('');
				$('.ent2').val('');
				$('.rel-ent2-form').animate({
					top: '-'+ 2*$('.rel-ent2-form').height()
				}, 750);
			});	
		}
	};
	
	/**
		selects the clicked on circle and any lines attached to it
		and moves those end points attached to the circle around only
	*/
	me.dragGroup = function(that){
		
		var circle = d3.select(that);
		var dx = d3.event.dx, dy = d3.event.dy;
		var cx = circle.attr('cx'), cy = circle.attr('cy');
		circle.attr('cx', function() { 
			var newC = dx + parseInt(cx);
			return me.computeCoord(newC, 'x'); 
		})
		.attr('cy', function() { 
			var newC =  dy + parseInt(cy);
			return me.computeCoord(newC, 'y'); 
		});
		
		var line = d3.select(that.parentNode).select('.relation');
		
		if (!line[0][0]){
			return;
		}
		var x, y;
		if (line.attr('x1') === cx && line.attr('y1') === cy){
			x = 'x1';
			y = 'y1';
		} else {
			x = 'x2';
			y = 'y2';
		}

		line.attr(x, function() { 
			var newC = dx + parseInt(line.attr(x)); 
			return me.computeCoord(newC, 'x');
		})
		.attr(y, function() { 
			var newC = dy + parseInt(line.attr(y)); 
			return me.computeCoord(newC, 'y');
		});
		
		var immKids = that.parentNode.childNodes;
		var groups = [];
		
		for (var i = 0; i < immKids.length; i++){
			if (immKids[i].localName === 'g'){ groups.push(immKids[i]);	}
		}
		
		d3.selectAll(groups).each(function(d, i){
			var l = d3.select(this).select('.relation');
			if (l.attr('x1') === cx && l.attr('y1') === cy){
				x = 'x1';
				y = 'y1';
			} else if ( l.attr('x2') === cx && l.attr('y2') === cy){
				x = 'x2';
				y = 'y2';
			} else {
				x = null, y = null;
			}
			
			if (x && y){
				l.attr(x, function() { 
					var newC = dx + parseInt(l.attr(x));
					return me.computeCoord(newC, 'x');
				})
				.attr(y, function() { 
					var newC = dy + parseInt(l.attr(y));
					return me.computeCoord(newC, 'y');
				});
			}
		});
	};
	
	me.addLabel = function(){
		var x = 0, y = 0;
		var item = d3.select(this);
		
		if(this.localName === 'circle'){
			x = parseInt(item.attr('cx'), 10) + 15;
			y = parseInt(item.attr('cy'), 10) - 15;
		} else if (this.localName === 'line'){
			x = ((parseInt(item.attr('x1'), 10) + parseInt(item.attr('x2'), 10)) / 2) + 15;
			y = ((parseInt(item.attr('y1'), 10) + parseInt(item.attr('y2'), 10)) / 2) - 15;
		} 
			
		d3.select(this.parentNode).append('text')
			.attr('x', x).attr('y', y)
			.text(item.attr('d'));
	};
	
	me.removeAllLabels = function(){
		if(me.mode !== 'label_hold'){
			d3.selectAll('.canvas text').remove();
		}
	};
	
	me.createArrow = function(p1, p2, that){
		var midlineX = (p2.x + p1.x) / 2;
		var midlineY = (p2.y + p1.y) / 2;
		var magline = Math.sqrt((p2.y - p1.y) * (p2.y - p1.y) + (p2.x - p1.x) * (p2.x - p1.x));
		var alpha = Math.atan((p2.y - p1.y) / (p2.x - p1.x)) - 0.523598;
		var beta = Math.atan((p2.y - p1.y) / (p2.x - p1.x)) + 0.523598;

		var dx1 = me.arrowlength * Math.cos(alpha);
		var dy1 = me.arrowlength * Math.sin(alpha);
		
		var dx2 = me.arrowlength * Math.cos(beta);
		var dy2 = me.arrowlength * Math.sin(beta);
		
		var Dx1, Dy1, Dx2, Dy2;
		
		//(+, +) case, accounting for inverted y-axis
		if ((p2.x > p1.x) && (p2.y < p1.y)){
			Dx1 = -dx1;
			Dy1 = -dy1;
			Dx2 = -dx2;
			Dy2 = -dy2;
		//(-, -) case, accounting for inverted y-axis
		} else if((p2.x < p1.x) && (p2.y > p1.y)){
			Dx1 = dx1;
			Dy1 = dy1;
			Dx2 = dx2;
			Dy2 = dy2;
		//either (+, -) or (-, +)
		} else {
			Dx1 = p2.x > p1.x ? -dx1 : dx1;
			Dy1 = p2.y > p1.y ? -dy1 : dy1;
			
			Dx2 = p2.x > p1.x ? -dx2 : dx2;
			Dy2 = p2.y > p1.y ? -dy2 : dy2;
		}
		
		d3.select(that.parentNode).append('line')
			.attr('class', 'triangle')
			.attr('x1', midlineX)
			.attr('y1', midlineY)
			.attr('x2', midlineX + Dx1)
			.attr('y2', midlineY + Dy1);
			
		d3.select(that.parentNode).append('line')
			.attr('class', 'triangle')
			.attr('x1', midlineX)
			.attr('y1', midlineY)
			.attr('x2', midlineX + Dx2)
			.attr('y2', midlineY + Dy2);
	};
	
	me.computeCoord = function(newC, axis){
		var max = axis === 'x' ? me.canvasW : me.canvasH;
		if (newC < 0){
			return 0;
		} else if (newC > max){
			return max;
		} else {
			return newC;
		}
	};
};