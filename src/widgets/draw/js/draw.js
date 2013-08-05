var draw = function(){
	var me =  this;
	var dx = 0, dy = 0;
		
	var count = 0;
	var color = d3.scale.category20();
	var shift = 25;
	me.radius = 8;
	me.arrowlength = 10;
	
	me.canvasW = 500;
	me.canvasH = 500;
	me.toolW = 150;
	me.toolH = 500;
	me.toolC = { x: (me.toolW / 2), y: (me.toolH / 2) };
	me.canvasC = { x: (me.canvasW / 2), y: (me.canvasH / 2) };
	
	me.asserts = [];
	
	me.mode = "";
	me.lastNodeClicked = null;
	me.num_tools = 0;

	/**
		called in createToolbar when a new toolbar element is added 
		@param - svg: the container to add the new elemnt to
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
			.attr('x', me.toolC.x - me.radius - 2)
			.attr('y', me.num_tools * shift - me.radius - 2)
			.attr('width', 2*(me.radius + 2) )
			.attr('height', 2*(me.radius + 2) );
			
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
			});
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
			.attr('y2', me.num_tools * shift + me.radius);
			
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
				console.log(JSON.stringify(me.asserts));
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
				.append('g').attr('class', count);
			
			var circle = group.append('circle')
				.attr('d', $('.ent1').val())
				.attr('class', 0)
				.attr('cx', mouse_event[0])
				.attr('cy', mouse_event[1])
				.attr('r', me.radius)
				.call(d3.behavior.drag().on('drag', me.move))
				.on('dblclick', me.doubleClickNode)
				.on('mouseover', me.mouseover)
				.on('mouseout', me.mouseout)
				.on('click', me.nodeclick);
			
			//increment count, used with group classes	
			count++;
			
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
	*/
	me.moveLines = function(parent){
		d3.select(parent).selectAll('line').each(function(d,i){
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
		
		var lines = [];
		var remove = [];
		
		//grab the entity's siblings and iterate through them
		var immKids = that.parentNode.childNodes;
		for (var i = 0; i < immKids.length; i++){
			//this kid is a line
			if (immKids[i].localName === 'line'){ 
				//this kid is a relationship, add to lines array
				if (!d3.select(immKids[i]).classed('triangle')){
					lines.push(immKids[i]);	
				//this kid is part of an arrow, will be remade, remove
				} else {
					remove.push(immKids[i]);
				}
			//this kid is a group and should contain a line
			} else if (immKids[i].localName === 'g'){
				//grab the group's children and iterate through them
				var grandKids = immKids[i].childNodes;
				for (var j = 0; j < grandKids.length; j++){
					//this kid is a line
					if (grandKids[j].localName === 'line'){
						//this kid is a relationship, add to lines array
						if (!d3.select(grandKids[j]).classed('triangle')){
							lines.push(grandKids[j]);	
						//this kid is part of an arrow, will be remade, remove
						} else {
							remove.push(grandKids[j]);
						}
					}
				}
			}
		}
		
		for (i = 0; i < remove.length; i++){
			d3.select(remove[i]).remove();
		}
		
		//for each line in array of lines
		d3.selectAll(lines).each(function(d, i){
			var l = d3.select(this);
			//if entity1 was grabbed, p1 from line matches grabbed circle		
			if (l.attr('x1') === cx && l.attr('y1') === cy){
				x = 'x1';
				y = 'y1';
			//if entity2 was grabbed, p2 from line matches grabbed circle
			} else if ( l.attr('x2') === cx && l.attr('y2') === cy){
				x = 'x2';
				y = 'y2';
			//if entity has no relationship attached to it
			} else {
				x = null, y = null;
			}
			
			//if the entity is attached to a relationship and other entity 
			if (x && y){
				//move the line
				l.attr(x, function() { 
					var newC = dx + parseInt(l.attr(x));
					return me.computeCoord(newC, 'x');
				})
				.attr(y, function() { 
					var newC = dy + parseInt(l.attr(y));
					return me.computeCoord(newC, 'y');
				});
			}
			
			//add a new arrow to the newly translated line
			me.createArrow(l);
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
		//current mode is delete_hold
		if(me.mode === 'delete_hold'){
			d3.selectAll(this.parentNode.childNodes).each(function(){
				//remove all lines (relationship and arrows)
				if (this.localName === 'line'){
					d3.select(this).remove();
				}
			});
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
		//if the current mode is rel_hold
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
					var line = d3.select(that.parentNode).insert('line', ':first-child')
						.attr('class', 'relation')
						.attr('d', $('.rel-only').val())
						.attr('x1', function(){ return me.computeCoord(p1.x, 'x'); })
						.attr('y1', function(){ return me.computeCoord(p1.y, 'y'); })
						.attr('x2', function(){ return me.computeCoord(p2.x, 'x'); })
						.attr('y2', function(){ return me.computeCoord(p2.y, 'y'); })
						.on('click', me.lineclick)
						.on('mouseover', me.mouseover)
						.on('mouseout', me.mouseout); 
					
					//add arrow indicating direction				
					me.createArrow(line);
					
					//add the entity 2 group as a child of the 
					//group containing entity 1
					me.lastNodeClicked.parentNode.appendChild(that.parentNode);
					me.lastNodeClicked.parentNode.appendChild(me.lastNodeClicked);
					
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
			var immKids = this.parentNode.childNodes;
			d3.selectAll(immKids).remove();
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
				var net = group.append('g');
				
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
				var line = net.append('line')
					.attr('class', 'relation')
					.attr('d', $('.relate').val())
					.attr('x1', function(){ return me.computeCoord(p1.x, 'x'); })
					.attr('y1', function(){ return me.computeCoord(p1.y, 'y'); })
					.attr('x2', function(){ return me.computeCoord(p2.x, 'x'); })
					.attr('y2', function(){ return me.computeCoord(p2.y, 'y'); })
					.on('click', me.lineclick)
					.on('mouseover', me.mouseover)
					.on('mouseout', me.mouseout); 

				//create the entity 2
				net.append('circle')
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
				
				//add arrow indicating direction
				me.createArrow(line);
				
				//add this ent - rel - ent to asserts array
				me.asserts.push({
					entity1: circle.attr('d'),
					relationship: $('.relate').val(),
					entity2: $('.ent2').val()
				});
					
				//bring original circle to front
				that.parentNode.appendChild(that);
				
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
		//mode is anything other than label_hold
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
		
		d3.selectAll('.relation').each(function(){
			console.log(this);
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
		called when a new line is created in the following functions
		me.dragGroup, me.nodeclick, me.doubleClickNode
		@param - line: the line that we want to add the arrow to
				 that: the item to append the arrows to
		@return - none
		@functionality - calculate the locations of the points that
				  will be used for the arrows that indicate direction
				  between entity 1 and entity 2
		@internal functions - none
	*/
	me.createArrow = function(line){
		var p1 = {
			x: parseInt(line.attr('x1'),10),
			y: parseInt(line.attr('y1'),10)
		};
		
		var p2 = {
			x: parseInt(line.attr('x2'),10),
			y: parseInt(line.attr('y2'),10)
		};
		
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
		
		d3.select(line[0][0].parentNode).append('line')
			.attr('class', 'triangle')
			.attr('x1', midlineX)
			.attr('y1', midlineY)
			.attr('x2', midlineX + Dx1)
			.attr('y2', midlineY + Dy1);
			
		d3.select(line[0][0].parentNode).append('line')
			.attr('class', 'triangle')
			.attr('x1', midlineX)
			.attr('y1', midlineY)
			.attr('x2', midlineX + Dx2)
			.attr('y2', midlineY + Dy2);
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
		//within canvas, safe, return newC
		} else {
			return Math.floor(newC);
		}
	};
};