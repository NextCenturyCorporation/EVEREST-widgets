var draw = function(){
	var me =  this;
		
	var color = d3.scale.category20();
	var shift = 25;
	me.radius = 8;
	
	me.canvasW = 500;
	me.canvasH = 500;
	me.toolW = 150;
	me.toolH = 500;
	me.toolC = { x: (me.toolW / 2), y: (me.toolH / 2) };
	me.canvasC = { x: (me.canvasW / 2), y: (me.canvasH / 2) };
	
	me.circles = [];
	me.lines = [];
	
	me.mode = "";
	me.lastNodeClicked = null;
	me.num_tools = 0;
	
	me.indexOf = function(c, array){
		for (var i = 0; i < array.length; i++){
			if (c.attr('class') === array[i].class){
				return i;
			}
		}
		return -1;
	};
	
	me.simplify = function(item){	
		return {
			class: item.attr('class'),
			d: item.attr('d'),
			x: item.attr('cx'),
			y: item.attr('cy'),
			r: item.attr('r')
		};
	};

	/**
		called in createToolbar when a new toolbar element is added 
		@param - svg: the container to add the new element to
				 class_name: a string that gives a short description of
				 	  the new toolbar item, which becomes the group's class
		@return - a group containing a rectangle to show mode selection
		@functionality - adds a space for a new toolbar item, providing
				  an on click event callback
		@internal functions - me.toggleSelction
	*/
	me.createSelection = function(svg, class_name){
		//increment the variable representing the number of tools
		me.num_tools++;
		
		//add a new space for the new tool, with an onclick event
		var selection = svg.append('g')
			.attr('class', class_name)
			.on('click', me.toggleSelection);
		
		//add the background svg element to show tool usage
		selection.append('rect')
			.attr('class', 'unselect')
			.attr('x', me.toolC.x - me.radius - 3)
			.attr('y', me.num_tools * shift - me.radius - 3)
			.attr('width', 2*(me.radius + 3) )
			.attr('height', 2*(me.radius + 3) );
			
		return selection;
	};
	
	/**
		the on click callback used when creating a new 
		selection in me.createSelection
		@param - none
		@return - none
		@functionality - either changes the current tool in use or
			toggles the tool usage indicator off.	
			intermediate stored variables are reset.
			if the label selection is toggled, calls me.addAllLabels
		@internal functions - me.addAllLabels
	*/
	me.toggleSelection = function(){
		var item = d3.select(this);
		
		//clear since switching modes
		me.lastNodeClicked = null;
		
		//if the item being toggled is already off, turn it on
		if(item.select('rect').classed('unselect')){
			//untoggle everything else
			d3.selectAll('rect').classed('select', false);
			d3.selectAll('rect').classed('unselect', true);
			item.select('rect')
				.classed('unselect', false)
				.classed('select', true);
			
			//update the mode
			me.mode = item.attr('class');
			
		//if the item being toggled is currently on, just turn it off
		} else {
			item.select('rect')
				.classed('select', false)
				.classed('unselect', true);
				
			//clear mode and remove any labels
			me.mode = '';
			d3.selectAll('.canvas text').remove();
		}	
		
		//if switched to label_hold mode, show all labels for any elements
		if(me.mode === 'label_hold'){
			me.addAllLabels();
		}
	};
	
	me.createCancelClickers = function(){
		d3.select('.ent-cancel').on('click', function(){
			//hide entity form
			$('.ent1').val('');
			$('.ent1-form').animate({
				top: '-'+ 2*$('.ent1-form').height()
			}, 750);
		});
		
		d3.select('.rel-cancel').on('click', function(){
			me.lastNodeClicked = null;
			//hide the relationship form
			$('.rel-only').val('');
			$('.rel-form').animate({
				top: '-'+ 2*$('.rel-form').height()
			}, 750);
		});
		
		d3.select('.rel-ent-cancel').on('click', function(){
			//hide rel-ent2 form
			$('.relate').val('');
				$('.ent2').val('');
				$('.rel-ent2-form').animate({
					top: '-'+ 2*$('.rel-ent2-form').height()
				}, 750);
		});
	};
	
	/**
		called from javascript section in index.html
		@param - none
		@return - none
		@functionality - grabs the .canvas div and adds an svg element
			      to it which will be where any target event definition
			      elements are added to.
			      an on click event is added to the svg element which
			      executes me.appendCircle if the mode is currently node_hold
		@internal functions - me.appendCircle
	*/
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
			})
			.append('svg:defs').append('svg:marker')
				.attr('id', 'Triangle')
				.attr('refX', 0).attr('refY', 3)
				.attr('markerUnits', 'strokeWidth')
				.attr('markerWidth', 100)
				.attr('markerHeight', 100)
				.attr('orient', 'auto')
				.append('svg:path')
					.attr('d', 'M 0 0 L 6 3 L 0 6 z');
	};
	
	/**
		called from javascript section in index.html
		@param - none
		@return - none
		@functionality - grabs the .toolbar div and adds an svg element
				  to it which will be where any toolbar items are held.
				  currently there are 4 tools: label, node, rel and mover.
		@internal functions - me.createSelection
	*/
	me.createToolbar = function(){
		var toolBar = d3.select('.toolbar');
		var svg = toolBar.append('svg')
			.attr('width', me.toolW)
			.attr('height', me.toolH);
		
		//add the tool to show all labels for each item in the canvas
		var label_hold = me.createSelection(svg, 'label_hold');
		label_hold.append('text')
			.attr('x', me.toolC.x)
			.attr('y', me.num_tools * shift)
			.attr('text-anchor', 'middle')
			.attr('dy', '0.35em')
			.text('abc');
		
		//add the tool to allow the user to add new entities to the canvas
		var node_hold = me.createSelection(svg, 'node_hold');
		node_hold.append('circle')
			.attr('class', 'entity')
			.attr('cx', me.toolC.x)
			.attr('cy', me.num_tools * shift)
			.attr('r', me.radius);
		
		//add the tool to allow the user to connect two entities with a line
		var rel_hold = me.createSelection(svg, 'rel_hold');
		rel_hold.append('line')
			.attr('class', 'relationship')
			.attr('x1', me.toolC.x - me.radius)
			.attr('y1', me.num_tools * shift - me.radius)
			.attr('x2', me.toolC.x + me.radius)
			.attr('y2', me.num_tools * shift + me.radius)
			.attr('marker-mid', 'url(#Triangle)');
		
		rel_hold.append('path')
			.attr('class', 'relationship')
			.attr('marker-mid', 'url(#Triangle)')
			.attr('d', function(){
				return 'M'+ (me.toolC.x - me.radius)+' ' + (me.num_tools * shift - me.radius) +
					  ' L'+ me.toolC.x + ' ' + (me.num_tools * shift) +
					  ' L'+ (me.toolC.x + me.radius)+' ' + (me.num_tools * shift + me.radius);
			});
		
		//add the tool to allow the user to move entire groups	
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
			
		//add the tool to undo last change in the canvas
		var undo_hold = me.createSelection(svg, 'undo_hold');
		undo_hold.append('text')
			.attr('x', me.toolC.x)
			.attr('y', me.num_tools * shift)
			.attr('text-anchor', 'middle')
			.attr('dy', '0.35em')
			.attr('font-size', 12)
			.text('undo');
			
		var delete_hold = me.createSelection(svg, 'delete_hold');
		delete_hold.append('circle')
			.attr('cx', me.toolC.x)
			.attr('cy', me.num_tools * shift)
			.attr('r', me.radius)
			.style('stroke', 'red');
		
		delete_hold.append('line')
			.attr('x1', me.toolC.x - me.radius)
			.attr('y1', me.num_tools * shift)
			.attr('x2', me.toolC.x + me.radius)
			.attr('y2', me.num_tools * shift)
			.style('stroke', 'red');
			
		//add reset and submit buttons at the bottom of the toolbar	
		var div = d3.select('body').append('div');
		div.append('button')
			.text('Reset')
			.on('click', function(){
				//clear canvas and remove all items from list of asserts
				d3.select('.canvas svg').selectAll('g').remove();
				me.asserts = [];
			});
		
		div.append('button')
			.text('Submit')
			.on('click', function(){
				//temporary way to show the state of the current target event
				console.log(JSON.stringify(me.lines));
				console.log(JSON.stringify(me.circles));
			});
	};
	
	/**
		currently only called when the user clicks inside the svg canvas
		and the node_hold selection is toggled from the toolbar
		@param - mouse_event is a d3.mouse(this) result containing an array
				 of 2 elements representing the x and y coordinate of the 
				 mouse when the user clicked the svg canvas
		@return - none
		@functionality - user enters a description through a form element.
				 adds an on click event to the submit button that creates
				 a circle/node based on the description the user entered.
		@internal functions - none
	*/
	me.appendCircle = function(mouse_event){
		//bring down entity form
		$('.ent1-form').animate({
			top:( $('.canvas').height() / 2 ) - ( $('.ent1-form').height() / 2 )
		}, 750);
		$('.ent1').focus();
		
		//creates on click event for entity form submit button
		d3.select('.ent-submit').on('click', function(){
			//create a new group to hold new event
			var group = d3.select('.canvas svg')
			
			var circle = group.append('circle')
				.attr('d', $('.ent1').val())
				.attr('class', me.circles.length)
				.attr('cx', mouse_event[0])
				.attr('cy', mouse_event[1])
				.attr('r', me.radius)
				.call(d3.behavior.drag().on('drag', me.move))
				.on('dblclick', me.doubleClickNode)
				.on('mouseover', me.mouseover)
				.on('mouseout', me.mouseout)
				.on('click', me.nodeclick);
			
			var c = me.simplify(circle);
			if (me.indexOf(circle, me.circles) === -1){
				me.circles.push(c);
			}
			
			//hide entity form
			$('.ent1').val('');
			$('.ent1-form').animate({
				top: '-'+ 2*$('.ent1-form').height()
			}, 750);
		});
	};
	
	/** 
		used as a callback added to a new entity when it is dragged
		in the canvas.
		@param - none
		@return - none
		@functionality - depends on what the current mode is, based on 2 only.
			      will move the entire group or just pivot the selected
			      node, depending on what the current mode is
		@internal functions - me.moveCircles
		 					  me.moveLines
							  me.dragGroup
	*/
	me.move = function(){
		//if the mover tool is selected, grab the topmost group that
		//this is a child of and move the entire group around
		if(me.mode === 'mover_hold'){
			var start = this;
			while (start.parentNode.localName !== 'svg'){
				start = start.parentNode;
			}
			me.moveCircles(start);
			me.moveLines(start);
		//if in default/no mode, just drag the element that was selected
		//also only moving any lines that are directly attached to it
		} else if (me.mode === ''){
			me.dragGroup(this);
		}
	};
	
	
	/**
		called from the me.move function
		@param - parent: the parent element to the item we want to move
		@return - none
		@functionality - grabs each line in the group and translates each
				  of the endpoints, moving each line but staying within the
				  bounds of the canvas
		@internal functions - me.computeCoord
							  me.createArrow
	*/
	me.moveLines = function(parent){
		d3.selectAll('.arrow').remove();
		d3.selectAll('.canvas line').each(function(d,i){
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
			
			var path = me.createArrow(line);
			me.lines[me.indexOf(line, me.lines)].path = path.attr('d');
		});
	};
	
	/**
		called from the me.move function
		@param - parent: the parent element to the item we want to move
		@return - none
		@functionality - grabs each circle in the group and translates it,
				  moving each circle but staying within the bounds of the
				  canvas
		@internal functions - me.computeCoord
	*/
	me.moveCircles = function(parent){
		d3.selectAll('.canvas circle').each(function(d,i){
			var circle = d3.select(this);
			
			circle.attr('cx', function() { 
				var newC = d3.event.dx + parseInt(circle.attr('cx'));
				return me.computeCoord(newC, 'x');
			}).attr('cy', function() { 
				var newC =  d3.event.dy + parseInt(circle.attr('cy'));
				return me.computeCoord(newC, 'y'); 
			});
			
			var c = me.circles[me.indexOf(circle, me.circles)];
			c.x = circle.attr('cx');
			c.y = circle.attr('cy');
			});
	};
	
	/**
		called from the me.move function
		@param - that - entity that was clicked upon and is to be dragged
		@return - none
		@functionality - selects the clicked on entity and any lines 
		attached to it and moves those end points attached to the entity 
		@internal functions - me.computeCoord
							  me.createArrow
	*/
	me.dragGroup = function(that){
		
		var circle = d3.select(that);
		var dx = d3.event.dx, dy = d3.event.dy;
		
		//center of entity to be dragged
		var	cx = circle.attr('cx');
		var	cy = circle.attr('cy');

		//move the circle based on the d3 event that occured
		circle.attr('cx', function() { 
			var newC = dx + parseInt(cx,10);
			return me.computeCoord(newC, 'x'); 
		})
		.attr('cy', function() { 
			var newC =  dy + parseInt(cy,10);
			return me.computeCoord(newC, 'y'); 
		});
		
		var c = me.circles[me.indexOf(circle, me.circles)];
		c.x = circle.attr('cx');
		c.y = circle.attr('cy');
		
		d3.selectAll('.arrow').remove();
		
		//for each line in array of lines
		d3.selectAll('.canvas line').each(function(){
			var line = d3.select(this);
			//if entity1 was grabbed, p1 from line matches grabbed circle		
			if (line.attr('x1') === cx && line.attr('y1') === cy){
				x = 'x1';
				y = 'y1';
			//if entity2 was grabbed, p2 from line matches grabbed circle
			} else if ( line.attr('x2') === cx && line.attr('y2') === cy){
				x = 'x2';
				y = 'y2';
			//if entity has no relationship attached to it
			} else {
				x = null, y = null;
			}
			
			//if the entity is attached to a relationship and other entity 
			if (x && y){
				//move the line
				line.attr(x, function() { 
					var newC = dx + parseInt(line.attr(x));
					return me.computeCoord(newC, 'x');
				})
				.attr(y, function() { 
					var newC = dy + parseInt(line.attr(y));
					return me.computeCoord(newC, 'y');
				});
			}
			
			var path = me.createArrow(line);
			me.lines[me.indexOf(line, me.lines)].path = path.attr('d');
		});
	};
	
	/**
		used as a callback added to a new relationship when it is clicked
		@param - none
		@return - none
		@functionality - dependent upon what the current mode is
				  is called when a relationship in the canvas is clicked
				  if the current mode is delete_hold the line is remove
				  along with the arrow that was with it
		@internal functions - none
	*/
	me.lineclick = function(){	
		if(me.mode === 'delete_hold'){
		
			var index = me.indexOf(d3.select(this), me.lines);
			var d = me.lines[index].path;
			d3.selectAll('.arrow').each(function(){
				if (d3.select(this).attr('d') === d){
					d3.select(this).remove();
				} 
			});
			
			me.lines.splice(index,1);
			d3.select(this).remove();
		}
	}
	/**
		used as a callback added to a new entity when it is clicked
		@param - none
		@return - none
		@functionality - dependent upon what the current mode is
				  is called when an entity in the canvas is clicked
				  if the current mode is rel_hold and two entities are 
				  clicked, a line is drawn between the representing
				  a relationship
				  if the current mode is delete_hold it removes the entity
				  and any of its siblings, group(with lines and entities),
				  line or arrow
		@internal functions - me.computeCoord
							  me.mouseover
							  me.mouseout
							  me.createArrow
	*/
	me.nodeclick = function(){
		if(me.mode === 'rel_hold'){
			//if no entities have been clicked before this one
			if (me.lastNodeClicked === null){
				me.lastNodeClicked = this;
			//if this entity was the last node clicked, do nothing
			} else if(this === me.lastNodeClicked){
				return;
			//if this is the second unique entity chosen, draw a line 
			} else {
				//bring down relationship form for user to enter a description
				$('.rel-form').animate({
					top: ( $('.canvas').height() / 2 ) - ( $('.rel-form').height() / 2 )
				}, 750);
				$('.rel-only').focus();		//apparently errors in IE if focus before visible
				
				//so not to confuse this when inside the d3.select function
				var that = this;
				
				//creates on click event for relationship form submit button 
				d3.select('.rel-submit').on('click', function(){	
					//grabs the entities to draw a line/relationship between
					var c1 = d3.select(me.lastNodeClicked);
					var c2 = d3.select(that);
					
					//center of entity 1
					var p1 = {
						x:parseInt(c1.attr('cx'), 10),
						y:parseInt(c1.attr('cy'), 10)
					};
					
					//center of entity 2
					var p2 = {
						x:parseInt(c2.attr('cx'), 10),
						y:parseInt(c2.attr('cy'), 10)
					};
					
					//draw the line before the entities so that it appears behind
					var line = d3.select('.canvas svg').insert('line', ':first-child')
						.attr('class', me.lines.length)
						.attr('d', $('.rel-only').val())
						.attr('x1', function(){ return me.computeCoord(p1.x, 'x'); })
						.attr('y1', function(){ return me.computeCoord(p1.y, 'y'); })
						.attr('x2', function(){ return me.computeCoord(p2.x, 'x'); })
						.attr('y2', function(){ return me.computeCoord(p2.y, 'y'); })
						.on('click', me.lineclick)
						.on('mouseover', me.mouseover)
						.on('mouseout', me.mouseout); 
					
					var path = me.createArrow(line);
					
					var l = {
						class: line.attr('class'),
						d: line.attr('d'),
						source: me.indexOf(c1, me.circles),
						target: me.indexOf(c2, me.circles),
						path: path.attr('d')
					};
					
					if(me.indexOf(line, me.lines) === -1){
						me.lines.push(l);
					}
					
					//clear to allow addition of other relationships
					me.lastNodeClicked = null;
					
					//hide the relationship form
					$('.rel-only').val('');
					$('.rel-form').animate({
						top: '-'+ 2*$('.rel-form').height()
					}, 750);
				});	
			}
		}
		else if (me.mode === 'delete_hold'){
			var index = me.indexOf(d3.select(this), me.circles);
			
			d3.selectAll('.canvas line').each(function(){
				var line_index = me.indexOf(d3.select(this), me.lines);
				var l = me.lines[line_index];
				if (l.source === index || l.target === index){
					d3.selectAll('.arrow').each(function(){
						if (d3.select(this).attr('d') === l.path){
							d3.select(this).remove();
						}
					});
					me.lines.splice(line_index,1);
					d3.select(this).remove();
				}
			});
			me.circles.splice(index, 1);
			d3.select(this).remove();
		}
	};
	
	/**
		used as a callback added to a new entity when it is double clicked
		@param - none
		@return - none
		@functionality - 
		@internal functions - me.computeCoord
							  me.mouseover
							  me.mouseout
							  me.doubleClickNode (this function)
							  me.nodeclick
							  me.createArrow
	*/
	me.doubleClickNode = function(){
		if (me.mode === ''){
			//bring down relationship - entity 2 form
			$('.rel-ent2-form').animate({
				top: ( $('.canvas').height() / 2 ) - ( $('.rel-ent2-form').height() / 2 )
			}, 750);
			$('.relate').focus();		//apparently errors in IE if focus before visible
			
			//so not to confuse this when inside the d3.select function
			var that = this;
	
			//creates on click event for rel - entity 2 form submit button 
			d3.select('.rel-ent-submit').on('click', function(){
				//grab the entity and set variables from its attributes
				var circle = d3.select(that);
				var r = circle.attr('r');
				var parentLayer = parseInt(circle.attr('class'), 10);
				
				//grab a random direction for new entity
				var deg = 360 * Math.random();
				var dx = r * r * Math.cos(deg);
				var dy = r * r * Math.sin(deg);
				
				//grab the double-clicked entity's parent and add a group to it
				var group = d3.select(that.parentNode);
				//var net = group.append('g');
				
				//center of double-clicked entity, point 1 for new line
				var p1 = {
					x:parseInt(circle.attr('cx'), 10),
					y:parseInt(circle.attr('cy'), 10)
				};
				
				//center of new entity to be, point 2 for new line
				var p2 = {
					x:p1.x + dx,
					y:p1.y + dy
				};
				
				//create the line for the new entity 1 entity 2 relationship
				var line = group.insert('line', ':first-child')
					.attr('class', me.lines.length)
					.attr('d', $('.relate').val())
					.attr('x1', function(){ return me.computeCoord(p1.x, 'x'); })
					.attr('y1', function(){ return me.computeCoord(p1.y, 'y'); })
					.attr('x2', function(){ return me.computeCoord(p2.x, 'x'); })
					.attr('y2', function(){ return me.computeCoord(p2.y, 'y'); })
					.on('click', me.lineclick)
					.on('mouseover', me.mouseover)
					.on('mouseout', me.mouseout); 

				var path = me.createArrow(line);
	
				//create the entity 2
				var circle2 = group.append('circle')
					.attr('d', $('.ent2').val())
					.attr('class', parentLayer + 1)
					.attr('cx', function(){ return me.computeCoord(p2.x, 'x'); })
					.attr('cy', function(){ return me.computeCoord(p2.y, 'y'); })
					.attr('r', me.radius)
					.style('fill', color(parentLayer + 1))
					.call(d3.behavior.drag().on('drag', me.move))
					.on('dblclick', me.doubleClickNode)
					.on('mouseover', me.mouseover)
					.on('mouseout', me.mouseout)
					.on('click', me.nodeclick);
								
				if(me.indexOf(circle2, me.circles) === -1){
					var c = me.simplify(circle2);
					me.circles.push(c);
				}
				
				if(me.indexOf(line, me.lines) === -1){
					var l = {
						class: line.attr('class'),
						d: line.attr('d'),
						source: me.indexOf(circle, me.circles),
						target: me.indexOf(circle2, me.circles),
						path: path.attr('d')
					};
					me.lines.push(l);
				}
				
				//hide relationship - entity 2 form
				$('.relate').val('');
				$('.ent2').val('');
				$('.rel-ent2-form').animate({
					top: '-'+ 2*$('.rel-ent2-form').height()
				}, 750);
			});	
		}
	};
	
	/**
		used as a callback added to a new entity when it is hovered over
		@param - none
		@return - none
		@functionality - dependent upon what the mode is
				  if the mode is anything other that label hold
				  when the user hovers over an element, its data is displayed
		@internal funcitons - none
	*/
	me.mouseover = function(){
		if(me.mode !== 'label_hold'){
			var x = 0, y = 0;
			var item = d3.select(this);
			
			//if the element being hovered over is an entity
			if(this.localName === 'circle'){
				x = parseInt(item.attr('cx'), 10) + 15;
				y = parseInt(item.attr('cy'), 10) - 15;
			//if instead it is a relationship
			} else if (this.localName === 'line'){
				x = ((parseInt(item.attr('x1'), 10) + parseInt(item.attr('x2'), 10)) / 2) + 15;
				y = ((parseInt(item.attr('y1'), 10) + parseInt(item.attr('y2'), 10)) / 2) - 15;
			} 
			
			//add text to the canvas near the element
			d3.select('.canvas svg').append('text')
				.attr('x', x).attr('y', y)
				.text(item.attr('d'));
		}
	};
	
	/**
		called from me.toggleSelection when mode is label_hold
		@param - none
		@return - none
		@functionality - shows all labels for any element in the canvas
		@internal functions - none
	*/
	me.addAllLabels = function(){
		var x = 0, y = 0;
		d3.selectAll('.canvas circle').each(function(){
			var circle = d3.select(this);
			x = parseInt(circle.attr('cx'), 10) + 15;
			y = parseInt(circle.attr('cy'), 10) - 15;
			d3.select('.canvas svg').append('text')
				.attr('x', x).attr('y', y)
				.text(circle.attr('d'));
		});
		
		d3.selectAll('line').each(function(){
			var line = d3.select(this);
			x = ((parseInt(line.attr('x1'), 10) + parseInt(line.attr('x2'), 10)) / 2) + 15;
			y = ((parseInt(line.attr('y1'), 10) + parseInt(line.attr('y2'), 10)) / 2) - 15;
			d3.select('.canvas svg').append('text')
				.attr('x', x).attr('y', y)
				.text(line.attr('d'));
		});
		
	};
	
	/**
		used as a callback added to a new entity after it is hovered over
		then the mouse moves off of the object
		@param - none
		@return - none
		@functionality - dependent upon what the mode is
				  if label_hold, all text elements in the canvas
				  are removed
		@internal functions - none
	*/
	me.mouseout = function(){
		if(me.mode !== 'label_hold'){
			d3.selectAll('.canvas text').remove();
		}
	};

	/**
		called when any line or entity is created, within the following
		functions : me.moveLines, me.moveCircles, me.dragGroup, me.nodeclick
		me.doubleClickNode
		@param - newC: coordinate (x or y) within canvas to attempt to add new item
				 axis: 'x' or 'y' to indicate what bound to compare against
		@return - a float within the bounds of the svg element
		@functionality - takes newC and checks to see if it is within the 
				  bounds of the canvas, if it is, returns newC, if not, returns
				  a proper min or max
		@internal functions - none
	*/
	me.computeCoord = function(newC, axis){
		//get the max coordinate based on what axis is
		var max = axis === 'x' ? me.canvasW : me.canvasH;
		
		//on negative x or y axis, return 0
		if (newC < 0){
			return 0;
		//past width or height of canvas, return bound
		} else if (newC > max){
			return max;
		//within canvas, safe, return newC as integer
		} else {
			return Math.floor(newC);
		}
	};
	
	me.createArrow = function(line){
		var path = d3.select('.canvas svg').insert('path', ':first-child')
			.attr('class', 'arrow')
			.attr('marker-mid', 'url(#Triangle)')
			.attr('d', function(){
				var midX = (parseInt(line.attr('x1'), 10) + parseInt(line.attr('x2'), 10)) / 2;
				var midY = (parseInt(line.attr('y1'), 10) + parseInt(line.attr('y2'), 10)) / 2;
				return 'M'+ line.attr('x1')+' ' + line.attr('y1') +
					  ' L'+ midX + ' ' + midY +
					  ' L'+ line.attr('x2')+' ' + line.attr('y2');
			});
		
		return path;
	};
};