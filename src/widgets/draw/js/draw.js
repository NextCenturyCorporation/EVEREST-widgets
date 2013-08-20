//with help from threedubmedia.com/code/event/drop/demo/selection
var draw = function(){
	var me =  this;
	var url = 'http://localhost:8081/target_assertion/';
		
	var color = d3.scale.category20();
	var shift = 25;
	
	var entity1Color = '#333399';
	var entity2Color = '#339966';
	var bothColor = '#9900cc';
	var white = '#ffffff';
	me.radius = 8;
	
	me.canvasW = 500;
	me.canvasH = 500;
	me.toolW = 150;
	me.toolH = 500;
	me.toolC = { x: (me.toolW / 2), y: (me.toolH / 2) };
	me.canvasC = { x: (me.canvasW / 2), y: (me.canvasH / 2) };
	me.startClick;
	
	me.circles = [];
	me.lines = [];
	
	me.circleCount = 0;
	me.lineCount = 0;
	
	me.mode = "";
	me.lastNodeClicked = null;
	me.num_tools = 0;
	me.count = 0;
	
	Array.prototype.indexOfObj = function(d3obj, attribute){
		if (!attribute){
			attribute = 'class';
		}
		
		for (var i = 0; i < this.length; i++){
			if (d3obj.attr(attribute) === this[i][attribute]){
				return i;
			}
		}
		
		return -1;
	};
	
	/**
		@param			item: a d3.select()'ed circle
		@return			an object containing the desired attributes of item
		@functionality	simplifies the circle for storage in me.circles
	*/
	me.simplify = function(item){	
		return {
			class: item.attr('class'),
			html: item[0][0],
			d: item.attr('d'),
			x: item.attr('cx'),
			y: item.attr('cy'),
			r: item.attr('r')
		};
	};
	
	/**
		used when saving the state of the canvas
		saves assertions (ent - rel - ent) and single entities
		@pararm			circle: simplified circle object from me.circles
		@return			boolean stating whether circle is connected by a line
						to another circle
		@functionality	search through each line in me.lines to see if this
						circle's class is used as a source or target for any
						of the lines. if it is, something is connected to it
	*/
	me.isAlone = function(circle){
		var alone = true;
		for (var i = 0; i < me.lines.length; i++){
			if(me.lines[i].source === circle.html || me.lines[i].target === circle.html){
				alone = false;
			}
		}
		return alone;
	};
	
	/**
		@param 			g: group number 
		@return 		an array of indicies pointing back to circles in
						me.circles, which all have the same group number
		@functionality	searches through me.circles for any circles that
						have the same group as specified by g
	*/
	me.extractCircles = function(g){
		var array = [];
		for (var i = 0; i < me.circles.length; i++){
			if(me.circles[i].group === g){
				array.push(i);
			}
		}
		return array;
	};
	
	/**
		called when any line or entity is created, within the following
		functions : me.dragGroup, me.nodeclick
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
		var max = axis === 'x' ? me.canvasW : me.canvasH;
		
		if (newC < 0){	
			return 0;
		} else if (newC > max){
			return max;
		} else {
			return Math.floor(newC);
		}
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
		the on click callback used when creating a new selection
		@functionality - either changes the current tool in use or
			toggles the tool usage indicator off.	
			intermediate stored variables are reset.
			if the label selection is toggled, calls me.addAllLabels
		@internal functions - me.addAllLabels
	*/
	me.toggleSelection = function(){
		var item = d3.select(this);
		me.lastNodeClicked = null;
		
		//if the item being toggled is already off, turn it on
		if(item.select('rect').classed('unselect')){
			d3.selectAll('rect').classed('select', false);
			d3.selectAll('rect').classed('unselect', true);
			item.select('rect').classed('unselect', false)
				.classed('select', true);
			
			me.mode = item.attr('class');
			
		//if the item being toggled is currently on, just turn it off
		} else {
			item.select('rect').classed('select', false)
				.classed('unselect', true);
				
			//clear mode and remove any labels
			me.mode = '';
			d3.selectAll('.canvas text').remove();
		}	
		
		if (me.mode === 'label_hold'){
			me.addAllLabels();
		} else if (me.mode !== 'select_hold'){
			me.resetColors();
		}
	};
	
	/**
		@functionality	selects all of the cancel buttons in each of the
		hidden forms and adds a hide function to them for when they are clicked
	*/
	me.createCancelClickers = function(){
		d3.select('.ent-cancel').on('click', function(){
			$('.ent1').val('');
			$('.ent1-form').animate({
				top: '-'+ 2*$('.ent1-form').height()
			}, 750);
		});
		
		d3.select('.rel-cancel').on('click', function(){
			me.lastNodeClicked = null;
			$('.rel-only').val('');
			$('.rel-form').animate({
				top: '-'+ 2*$('.rel-form').height()
			}, 750);
		});
		
		d3.select('.rel-ent-cancel').on('click', function(){
			$('.relate').val('');
				$('.ent2').val('');
				$('.rel-ent2-form').animate({
					top: '-'+ 2*$('.rel-ent2-form').height()
				}, 750);
		});
	};

	/**
		called from javascript section in index.html
		@functionality - grabs the .canvas div and adds an svg element to it 
		which will be where any target event definition elements are added to.
		an on click event is added to the svg element which executes 
		me.appendCircle if the mode is currently node_hold
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
				} else if (me.mode === 'select_hold'){
					me.resetColors();
				}
			});
			
		svg.append('rect')
			.attr('class', 'background')
			.attr('x', 0).attr('y', 0)
			.attr('width', me.canvasW).attr('height', me.canvasH)
			.style('opacity', 0)
			.call(d3.behavior.drag().on('dragstart', me.dragstart)
				.on('drag', me.drag)
				.on('dragend', me.dragend));
			
		svg.append('g').attr('class', 'node-link-container');	
		svg.append('svg:defs').append('svg:marker')
			.attr('id', 'Triangle')
			.attr('refX', 0).attr('refY', 3)
			.attr('markerUnits', 'strokeWidth')
			.attr('markerWidth', 100)
			.attr('markerHeight', 100)
			.attr('orient', 'auto')
			.append('svg:path')
				.attr('class', 'keeper')
				.attr('d', 'M 0 0 L 6 3 L 0 6 z');
				
		$(document).keyup(function(e){
			if (e.keyCode === 46){
				var nodesToRemove = [];
				var linksToRemove = [];
				d3.selectAll('.canvas circle').each(function(){
					var c = d3.select(this);
					if(c.style('fill') === '#ff0000'){
						nodesToRemove.push(this);
					}
				});
				
				for (var i = 0; i < nodesToRemove.length; i++){
					me.deleteNode(nodesToRemove[i]);
				}
				
				d3.selectAll('.canvas line').each(function(){
					var l = d3.select(this);
					if (l.style('stroke') === '#ff0000'){
						linksToRemove.push(this);
					}
				});
				
				for (var i = 0; i < linksToRemove.length; i++){
					me.deleteLink(linksToRemove[i]);
				}
			}
		});
	};
	
	/**
		called from javascript section in index.html
		@functionality - grabs the .toolbar div and adds an svg element to it 
		which will be where any toolbar items are held. currently there are 
		five functioning tools: label, node, rel, mover and delete.
		@internal functions - me.createSelection
	*/
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
			
		var select_hold = me.createSelection(svg, 'select_hold');
		select_hold.select('rect').style('stroke', 'black');
			
		//add reset and submit buttons at the bottom of the toolbar	
		var div = d3.select('body').append('div');
		div.append('button').text('Reset')
			.on('click', function(){
				d3.select('.node-link-container').remove();
				d3.select('.canvas svg').append('g')
					.attr('class', 'node-link-container');
				
				me.circles = [];
				me.lines = [];
			});
		
		div.append('button').text('Submit')
			.on('click', me.saveTargetAssertions);
	};
	
	me.createCircle = function(x, y, d){
		var circle = d3.select('.node-link-container').append('circle')
			.attr('d', d).attr('class', me.circleCount)
			.attr('cx', x).attr('cy', y)
			.attr('r', me.radius)
			.style('fill', 'white')
			.call(d3.behavior.drag().on('drag', me.move))
			.on('dblclick', me.doubleClickNode)
			.on('mouseover', me.mouseover)
			.on('mouseout', me.mouseout)
			.on('click', me.nodeclick);
		
		return circle;
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
		$('.ent1-form').animate({
			top:( $('.canvas').height() / 2 ) - ( $('.ent1-form').height() / 2 )
		}, 750);
		$('.ent1').focus();
		
		//click event gets defined every time a new node is created...?
		d3.select('.ent-submit').on('click', function(){			
			var circle = me.createCircle(mouse_event[0], 
								mouse_event[1], $('.ent1').val());
			if (me.circles.indexOfObj(circle) === -1){
				var c = me.simplify(circle);
				c.group = me.count;
				c.color = '#ffffff';
				me.circles.push(c);
			}

			me.count++;
			me.circleCount++;
			
			$('.ent1').val('');
			$('.ent1-form').animate({
				top: '-'+ 2*$('.ent1-form').height()
			}, 750);
		});
	};
	
	/** 
		used as a callback added to a new entity when it is dragged
		in the canvas
		@param - none
		@return - none
		@functionality - depends on what the current mode is, based on 2 only.
			      will move the entire group or just pivot the selected
			      node, depending on what the current mode is
		@internal functions - me.dragGroup
	*/
	me.move = function(){
		if(me.mode === 'mover_hold'){
			var circles = [];
			var group = me.circles.indexOfObj(d3.select(this));
			var x = me.extractCircles(me.circles[group].group);
			
			for (var i = 0; i < x.length; i++){
				var circle = me.circles[x[i]].html;
				me.dragGroup(circle);
			}
		} else if (me.mode === 'select_hold'){
			if (d3.select(this).style('fill') === '#ff0000'){
				var nodesToDrag = [];
				d3.selectAll('.canvas line').each(function(){
					if (d3.select(this).style('stroke') === '#ff0000'){
						d3.select(this.parentNode).select('path').remove();
					}
				});
				
				d3.selectAll('.canvas circle').each(function(){
					var c = d3.select(this);
					if (c.style('fill') === '#ff0000'){
						me.dragGroup(this);
					}
				});
			}
		} else if (me.mode === ''){
			me.dragGroup(this);
		}
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
		
		var	cx = circle.attr('cx');
		var	cy = circle.attr('cy');

		//move the circle based on the d3 event that occured
		circle.attr('cx', function() { 
			var newC = dx + parseInt(cx,10);
			return me.computeCoord(newC, 'x'); 
		}).attr('cy', function() { 
			var newC =  dy + parseInt(cy,10);
			return me.computeCoord(newC, 'y'); 
		});
		
		var c = me.circles[me.circles.indexOfObj(circle)];
		c.x = circle.attr('cx');
		c.y = circle.attr('cy');
		
		d3.selectAll('.arrow').remove();
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
				line.attr(x, function() { 
					var newC = dx + parseInt(line.attr(x));
					return me.computeCoord(newC, 'x');
				}).attr(y, function() { 
					var newC = dy + parseInt(line.attr(y));
					return me.computeCoord(newC, 'y');
				});
			}
			
			var path = me.createArrow(line);
			if (line.style('stroke') === '#ff0000'){
				path.style('stroke', '#ff0000');
			}
		});
	};
	
	me.dragstart = function(){
		me.startClick = d3.mouse(this);
		if (me.mode === 'select_hold'){
			d3.select('.canvas svg').append('rect')
				.attr('class', 'selection')
				.style('opacity', 0.25);
		}
	};
	
	me.drag = function(){
		var ev = d3.mouse(this);
		if (me.mode === 'select_hold'){
			d3.select('.selection').attr('width', Math.abs( ev[0] - me.startClick[0] ))
				.attr('height', Math.abs( ev[1] - me.startClick[1] ))
				.attr('x', Math.min( ev[0], me.startClick[0] ))
				.attr('y', Math.min( ev[1], me.startClick[1] ));
			
			var rect = d3.select('.selection');
			var left = parseInt(rect.attr('x'),10);
			var top = parseInt(rect.attr('y'),10);
			var right = left + parseInt(rect.attr('width'),10);
			var bottom = top + parseInt(rect.attr('height'),10);
				
			d3.selectAll('.canvas circle').each(function(){
				var c = d3.select(this);
				
				if (c.attr('cx') < right && c.attr('cx') > left){
					if (c.attr('cy') < bottom && c.attr('cy') > top){
						c.style('fill', 'red');
					} else {
						var i = me.circles.indexOfObj(c);
						c.style('fill', me.circles[i].color);
					}
				} else {
					var i = me.circles.indexOfObj(c);
					c.style('fill', me.circles[i].color);
				}
			});
			
			d3.selectAll('.canvas line').each(function(){
				var l = d3.select(this);
				var path = d3.select(this.parentNode).select('path');
				
				var midX = (parseInt(l.attr('x1'), 10) + parseInt(l.attr('x2'), 10)) / 2;
				var midY = (parseInt(l.attr('y1'), 10) + parseInt(l.attr('y2'), 10)) / 2;
				
				if (midX < right && midX > left){
					if (midY < bottom && midY > top){
						l.style('stroke', 'red');
						path.style('stroke', 'red');
					} else {
						l.style('stroke', '#004785');
						path.style('stroke', '#004785');
					}
				} else {
					l.style('stroke', '#004785');
					path.style('stroke', '#004785');
				}
			});
		}
	};
	
	me.dragend = function(){
		if (me.mode === 'select_hold'){
			d3.select('.selection').remove();
		}
	}
	
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
			me.deleteLink(this);
		}
	};
	
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
				$('.rel-form').animate({
					top: ( $('.canvas').height() / 2 ) - ( $('.rel-form').height() / 2 )
				}, 750);
				$('.rel-only').focus();		//apparently errors in IE if focus before visible
				
				var that = this;
				
				//creates on click event for relationship form submit button 
				d3.select('.rel-submit').on('click', function(){	
					var c1 = d3.select(me.lastNodeClicked);
					var c2 = d3.select(that);
					
					var ind1 = me.circles.indexOfObj(c1);
					var ind2 = me.circles.indexOfObj(c2);
					
					var node1 = me.circles[ind1];
					if (node1.color === white){
						node1.color = entity1Color;
					} else if ( node1.color !== entity1Color ){
						node1.color = bothColor;
					}
					c1.transition(2500)
						.style('fill', me.circles[ind1].color);
						
					var node2 = me.circles[ind2];
					if (node2.color === white){
						node2.color = entity2Color;
					} else if ( node2.color !== entity2Color ){
						node2.color = bothColor;
					}
					c2.transition(2500)
						.style('fill', me.circles[ind2].color);
					
					var circ = me.circles[ind2];
					var toAttach = me.extractCircles(circ.group);
					
					for (var j = 0; j < toAttach.length; j++){
						var delta = me.circles[toAttach[j]];
						delta.group = me.circles[ind1].group;
					}
					
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
					var lineGroup = d3.select('.node-link-container')
						.insert('g', ':first-child');
					
					var line = lineGroup.append('line', ':first-child')
						.attr('class', me.lineCount)
						.attr('d', $('.rel-only').val())
						.attr('x1', me.computeCoord(p1.x, 'x'))
						.attr('y1', me.computeCoord(p1.y, 'y'))
						.attr('x2', me.computeCoord(p2.x, 'x'))
						.attr('y2', me.computeCoord(p2.y, 'y'))
						.call(d3.behavior.drag().on('drag', me.move))
						.on('click', me.lineclick)
						.on('mouseover', me.mouseover)
						.on('mouseout', me.mouseout); 
					
					me.lineCount++;
					
					var path = me.createArrow(line);
					
					var l = {
						class: line.attr('class'),
						html: line[0][0],
						d: line.attr('d'),
						source: c1[0][0],
						target: c2[0][0]
					};
					
					if(me.lines.indexOfObj(line) === -1){
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
			me.deleteNode(this);
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
			$('.rel-ent2-form').animate({
				top: ( $('.canvas').height() / 2 ) - ( $('.rel-ent2-form').height() / 2 )
			}, 750);
			$('.relate').focus();		//apparently errors in IE if focus before visible
			
			var that = this;
	
			//creates on click event for rel - entity 2 form submit button 
			d3.select('.rel-ent-submit').on('click', function(){
				var circle = d3.select(that);
				var r = circle.attr('r');
				
				var ind1 = me.circles.indexOfObj(circle)
				var node1 = me.circles[ind1];
				if (node1.color === white){
					node1.color = entity1Color;
				} else if ( node1.color !== entity1Color ){
					node1.color = bothColor;
				}
				circle.transition(2500)
					.style('fill', me.circles[ind1].color);
				
				//grab a random direction for new entity
				var deg = 360 * Math.random();
				var dx = r * r * Math.cos(deg);
				var dy = r * r * Math.sin(deg);
								
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
				var lineGroup = d3.select('.node-link-container')
						.insert('g', ':first-child');
					
				var line = lineGroup.append('line', ':first-child')
					.attr('class', me.lineCount)
					.attr('d', $('.relate').val())
					.attr('x1', me.computeCoord(p1.x, 'x'))
					.attr('y1', me.computeCoord(p1.y, 'y'))
					.attr('x2', me.computeCoord(p2.x, 'x'))
					.attr('y2', me.computeCoord(p2.y, 'y'))
					.call(d3.behavior.drag().on('drag', me.move))
					.on('click', me.lineclick)
					.on('mouseover', me.mouseover)
					.on('mouseout', me.mouseout); 

				me.lineCount++;
				
				var path = me.createArrow(line);
				var cGroup = me.circles[me.circles.indexOfObj(circle)].group;
	
				//create the entity 2
				var circle2 = me.createCircle(me.computeCoord(p2.x, 'x'),
							me.computeCoord(p2.y, 'y'), $('.ent2').val());
				circle2.style('fill', entity2Color);
				
				me.circleCount++;
				if(me.circles.indexOfObj(circle2) === -1){
					var c = me.simplify(circle2);
					c.color = entity2Color;
					c.group = cGroup;
					me.circles.push(c);
				}
				
				if(me.lines.indexOfObj(line) === -1){
					var l = {
						class: line.attr('class'),
						html: line[0][0],
						d: line.attr('d'),
						source: circle[0][0],
						target: circle2[0][0]
					};
					me.lines.push(l);
				}
				
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
	
	me.deleteNode = function(t){
		var index = me.circles.indexOfObj(d3.select(t));
		var group = me.circles[index].group;
		d3.selectAll('.canvas line').each(function(){
			var line_index = me.lines.indexOfObj(d3.select(this));
			var l = me.lines[line_index];
			
			if (l.source === me.circles[index].html || 
					l.target === me.circles[index].html){
				me.lines.splice(line_index,1);
				d3.select(this.parentNode).remove();
			}
		});
		
		me.circles.splice(index, 1);
		d3.select(t).remove();

		var cIndicies = me.extractCircles(group);
		me.separateGroups(cIndicies);
		
		d3.selectAll('.canvas line').each(function(){
			var line_index = me.lines.indexOfObj(d3.select(this));
			var l = me.lines[line_index];
			
			var cSvg1 = d3.select(l.source);
			var cSvg2 = d3.select(l.target);
			
			var cObj1 = me.circles[me.circles.indexOfObj(cSvg1)];
			var cObj2 = me.circles[me.circles.indexOfObj(cSvg2)];
			
			if (cObj1.color === white){
				cObj1.color = entity1Color;
			} else if ( cObj1.color !== entity1Color ){
				cObj1.color = bothColor;
			}
			cSvg1.transition(2500)
				.style('fill', cObj1.color);
			
			if (cObj2.color === white){
				cObj2.color = entity2Color;
			} else if ( cObj2.color !== entity2Color ){
				cObj2.color = bothColor;
			}
			
			cSvg2.transition(2500)
				.style('fill', cObj2.color);
		});
	};
	
	me.deleteLink = function(t){
		var group;
		var index = me.lines.indexOfObj(d3.select(t));
		var cHtml = me.lines[index].source;
		for (var i = 0; i < me.circles.length; i++){
			if (me.circles[i].html === cHtml){
				group = me.circles[i].group;
			}
		}
		
		me.lines.splice(index,1);
		d3.select(t.parentNode).remove();
		
		var cIndicies = me.extractCircles(group);
		me.separateGroups(cIndicies);
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
		
		d3.selectAll('.canvas line').each(function(){
			var line = d3.select(this);
			x = ((parseInt(line.attr('x1'), 10) + parseInt(line.attr('x2'), 10)) / 2) + 15;
			y = ((parseInt(line.attr('y1'), 10) + parseInt(line.attr('y2'), 10)) / 2) - 15;
			d3.select('.canvas svg').append('text')
				.attr('x', x).attr('y', y)
				.text(line.attr('d'));
		});
		
	};
	
	me.createArrow = function(line){
		var path = d3.select(line[0][0].parentNode).append('path')
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
	
	me.separateGroups = function(circleGroup){
		if(circleGroup.length !== 0){
			me.circles[circleGroup[0]].color = white;
			d3.select(me.circles[circleGroup[0]].html).style('fill', white);
			for (var i = 1; i < circleGroup.length; i++){
				var c = me.circles[circleGroup[i]];
				c.color = white;
				c.group = me.count;
				d3.select(c.html).style('fill', white);
				me.count++;
			}
			
			//want to iterate through and divide them up
			for (i = 0; i < circleGroup.length; i++){
				var cObj = me.circles[circleGroup[i]];
				var newGroup = me.count;
				var thisGroup = [];
				
				//compare to those who have already been allocated a new group
				for (var j = 0; j < i; j++){
					var cObj2 = me.circles[circleGroup[j]];
					d3.selectAll('.canvas line').each(function(){
						var l = me.lines[me.lines.indexOfObj(d3.select(this))];
						if (l.source === cObj.html && l.target === cObj2.html){
							thisGroup.push(me.circles[circleGroup[j]]);	
						} else if (l.source === cObj2.html && l.target === cObj.html){
							thisGroup.push(me.circles[circleGroup[j]]);
						}
					});
					
					if (thisGroup.length === 0){
						cObj.group = newGroup;
						me.count++;
					} else {
						//this group contains at least one circle
						var small = {group:999999};
						
						for(var k = 0; k < thisGroup.length; k++){
							if (thisGroup[k].group < small.group){
								small = thisGroup[k];
							}
						}
						
						for(k = 0; k < thisGroup.length; k++){
							var t = me.extractCircles(thisGroup[k].group);
							for (var m = 0; m < t.length; t++){
								me.circles[t[m]].group = small.group;
							}
						}
						
						cObj.group = small.group;
					}
				}
			}
		}
	};
	
	me.resetColors = function(){
		d3.selectAll('.canvas circle').each(function(){
			var c = d3.select(this);
			var i = me.circles.indexOfObj(c);
			c.style('fill', me.circles[i].color);
		});
		
		d3.selectAll('.canvas line').style('stroke', '#004785');
		d3.selectAll('.canvas path').style('stroke', '#004785');
	};
	
	me.saveTargetAssertions = function(){
		for (var i = 0; i < me.lines.length; i++){
			var line = me.lines[i];
			var c1, c2;
			for (var j = 0; j < me.circles.length; j++){
				if(me.circles[j].html === line.source){
					c1 = me.circles[j];
				}
				
				if(me.circles[j].html === line.target){
					c2 = me.circles[j];
				}
			}
			
			var entity1 = {
				name: "entity1",
				value: c1.d,
				x: parseInt(c1.x, 10),
				y: parseInt(c1.y, 10),
				color: c1.color
			};
			var relationship = {
				name: "relationship",
				value: line.d,
				color: 0
			};
			var entity2 = {
				name: "entity2",
				value: c2.d,
				x: parseInt(c2.x, 10),
				y: parseInt(c2.y, 10),
				color: c2.color
			};
						
			var postData = {
				name: c1.d + ' ' + line.d + ' ' + c2.d,
				description:"",
				entity1: [entity1],
				relationship: [relationship],
				entity2: [entity2]
			};
			
			console.log(JSON.stringify(postData));
			$.ajax({
				type: "POST",
				url: url,
				data: postData
			});
		}
		
		for (i = 0; i < me.circles.length; i++){
			var c = me.circles[i];
			if(me.isAlone(c)){
				var entity1 = {
					name: "entity1",
					value: c.d,
					x: parseInt(c.x, 10),
					y: parseInt(c.y, 10),
					color: c.color				
				};
				
				var postData = {
					name: c.d,
					description:"",
					entity1: [entity1]
				};
				
				console.log(JSON.stringify(postData));
				$.ajax({
					type: "POST",
					url: url,
					data: postData
				});
			}
		}
		console.log(me.circles);
	};
};