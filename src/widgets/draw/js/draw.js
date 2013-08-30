//with help from threedubmedia.com/code/event/drop/demo/selection

var getHexString = function(color){
	if (d3.select(color)){
		var colorString = d3.select(color).style('background-color');
		if (colorString.substr(0, 1) === '#'){
			return colorString;
		}
		
		var array = colorString.split('(')[1].split(')')[0].split(',');
			
		var str = '#';
		for (var i = 0; i < array.length; i++){
			
			if (parseInt(array[i], 10) > 9){
				var temp = parseInt(array[i], 10).toString(16);
				str += temp;
			} else if ( parseInt(array[i], 10) > -1 ){
				var temp = parseInt(array[i], 10).toString(16);
				str += '0' + temp;
			}
		}
		return str;
	} else {
		return '#ffffff';
	}	
};

Array.prototype.indexOfObj = function(value, attribute){
	for (var i = 0; i < this.length; i++){
		if (value.toLowerCase() === this[i][attribute].toLowerCase()){
			return i;
		}
	}
	
	return -1;
};

Array.prototype.getAllIndicies = function(value, attribute){
	var indicies = [];
	for (var i = 0; i < this.length; i++){
		if (value.toLowerCase() === this[i][attribute].toLowerCase()){
			indicies.push(i);
		}
	}
	
	return indicies;
}

var draw = function(){
	var me =  this;
	var assert_url = 'http://localhost:8081/target_assertion/';
	var event_url = 'http://localhost:8081/target_event/';
	me.tool_mode, me.tool_button; 
	var white = '#ffffff';
	
	me.entity1Color = getHexString('.entity1Color');
	me.entity2Color = getHexString('.entity2Color');
	me.bothColor = getHexString('.bothColor');
	me.selectColor = '#ff0000';
	
	me.radius = 8;
	
	me.maxX = -1;
	me.maxY = -1;
	
	me.canvasW = 0;
	me.canvasH = 0;
	me.canvasC = { };
	me.pastStates = [];
	me.labelsShown = false;
	
	me.startClick;
	
	me.circles = [];
	me.lines = [];
	
	me.circleCount = 0;
	me.lineCount = 0;
	
	me.lastNodeClicked = null;
	me.count = 0;
	me.currentState = {};
	me.event = {};
		
	me.setUpToolbars = function(){
		me.tool_mode = new toolbar('.toolbar_modes');
		me.tool_mode.center.x = me.tool_mode.svg.style('width').split('p')[0] / 2;
		me.tool_mode.center.y = me.tool_mode.svg.style('height').split('p')[0] / 2;
		
		me.tool_mode.createSelection('node_hold', 'img/node.png');
		me.tool_mode.createSelection('rel_hold', 'img/link.png');
		me.tool_mode.createSelection('mover_hold', 'img/mover.png');
		me.tool_mode.createSelection('delete_hold', 'img/delete.png');	
		me.tool_mode.createSelection('select_hold', 'img/select.png');
	
		me.tool_button = new toolbar('.toolbar_buttons');
		me.tool_button.center.x = me.tool_button.svg.style('width').split('p')[0] / 2;
		me.tool_button.center.y = me.tool_button.svg.style('height').split('p')[0] / 2;
		
		me.tool_button.createSelection('resetB', 'img/reset.png')
			.on('click', function(){
				d3.select('.node-link-container').remove();
				d3.select('.canvas svg').append('g')
					.attr('class', 'node-link-container');
				
				me.circles = [];
				me.lines = [];
			});
		
		me.tool_button.createSelection('submitB', 'img/submit.png') 
			.on('click', me.saveTargetAssertions);	
		
		me.tool_button.createSelection('undoB', 'img/undo.png')
			.on('click', me.undo);
		
		me.tool_button.createSelection('deleteB', 'img/delete.gif')
			.on('click', me.deleteSelection);
	
		me.tool_button.createSelection('labelB', 'img/text.png')
			.on('click', me.toggleLabels);
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
		@param			circle: simplified circle object from me.circles
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
			.attr('class', 'csvg')
			.on('click', function(){
				if (me.tool_mode.getMode() === 'node_hold'){
					var ev = d3.mouse(this);
					me.appendCircle(ev);
				} else if (me.tool_mode.getMode() === 'select_hold'){
					me.resetColors();
				}
			});
		
		me.canvasW = svg.style('width').split('p')[0];
		me.canvasH = svg.style('height').split('p')[0];
		me.canvasC.x = me.canvasW / 2;
		me.canvasC.y = me.canvasH / 2;	
		
		//css
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
				me.deleteSelection();
			} else if (e.keyCode === 90 && e.ctrlKey){
				me.undo();
			}
			
		});
		
		$('.csvg').mousedown(me.saveTargetAssertions);
	};
	
	
	me.createCircle = function(x, y, d, c){
		var fill, cclass, group;
		if(typeof(c) !== 'undefined'){
			fill = c.color;
			cclass = c.class;
			group = c.group;
		} else {
			fill = white;
			cclass = me.circleCount;
			group = me.count;
		}
		
		var circle = d3.select('.node-link-container').append('circle')
			.attr('d', d).attr('class', cclass)
			.attr('cx', x).attr('cy', y)
			.attr('r', me.radius)
			.style('fill', fill)
			.call(d3.behavior.drag().on('drag', me.move))
			.on('dblclick', me.doubleClickNode)
			.on('mouseover', me.mouseover)
			.on('mouseout', me.mouseout)
			.on('click', me.nodeclick);
		
		var cObj = me.simplify(circle);
		cObj.group = group;
		cObj.color = fill;
		me.circles.push(cObj);

		me.count++;
		me.circleCount++;
		
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
	me.appendCircle = function(e){
		$('.ent1-form').animate({
			top:( $('.canvas').height() / 2 ) - ( $('.ent1-form').height() / 2 )
		}, 750);
		$('.ent1').focus();
		
		//click event gets defined every time a new node is created...?
		d3.select('.ent-submit').on('click', function(){
			if (me.circles.indexOfObj($('.ent1').val(), 'd') === -1){
				var circle = me.createCircle(e[0], e[1], $('.ent1').val());
			}
			
			$('.ent1').val('');
			$('.ent1-form').animate({
				top: '-'+ 2*$('.ent1-form').height()
			}, 750);
		});
	};
	
	me.addLine = function(c1, c2, d, l){
		var lineClass;
		if (typeof(l) !== 'undefined'){
			lineClass = l.class;
		} else {
			lineClass = me.lineCount;
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
	
		//create the line for the new entity 1 entity 2 relationship
		var lineGroup = d3.select('.node-link-container')
				.insert('g', ':first-child');
		
		var line = lineGroup.append('line', ':first-child')
			.attr('class', lineClass)
			.attr('d', d)
			.attr('x1', me.computeCoord(p1.x, 'x'))
			.attr('y1', me.computeCoord(p1.y, 'y'))
			.attr('x2', me.computeCoord(p2.x, 'x'))
			.attr('y2', me.computeCoord(p2.y, 'y'))
			//.call(d3.behavior.drag().on('drag', me.move))
			.on('click', me.lineclick)
			.on('mouseover', me.mouseover)
			.on('mouseout', me.mouseout); 

		var path = me.createArrow(line);
		me.lineCount++;
		
		if(me.lines.indexOfObj(line.attr('class'), 'class') === -1){
			var lObj = {
				class: line.attr('class'),
				html: line[0][0],
				d: line.attr('d'),
				source: c1[0][0],
				target: c2[0][0]
			};
			
			me.lines.push(lObj);
		}
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
		if(me.tool_mode.getMode() === 'mover_hold'){
			var circles = [];
			
			var group = me.circles.indexOfObj(d3.select(this).attr('class'),
					 'class');
			var x = me.extractCircles(me.circles[group].group);
			
			for (var i = 0; i < x.length; i++){
				var circle = me.circles[x[i]].html;
				me.dragGroup(circle);
			}
		} else if (me.tool_mode.getMode() === 'select_hold'){
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
		} else if (me.tool_mode.getMode() === ''){
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
		var cSvg = d3.select(that);
		var dx = d3.event.dx, dy = d3.event.dy;
		
		var	cx = cSvg.attr('cx');
		var	cy = cSvg.attr('cy');
		var cObj = me.circles[me.circles.indexOfObj(cSvg.attr('class'),
					'class')];
					
		//move the circle based on the d3 event that occured
		cSvg.attr('cx', function() { 
			var newC = dx + parseInt(cx,10);
			var newX = me.computeCoord(newC, 'x'); 
			cObj.x = newX;
			return newX;
		}).attr('cy', function() { 
			var newC = dy + parseInt(cy,10);
			var newY = me.computeCoord(newC, 'y'); 
			cObj.y = newY;
			return newY;
		});

		d3.selectAll('.arrow').remove();
		d3.selectAll('.canvas line').each(function(){
			var line = d3.select(this);
			var lineObj = me.lines[me.lines.indexOfObj(line.attr('class'),
					'class')];
					
			if (lineObj.source === cObj.html) {
				x = 'x1';
				y = 'y1';
			} else if (lineObj.target === cObj.html) {
				x = 'x2';
				y = 'y2';
			} else {
				x = null;
				y = null;
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
		if (me.tool_mode.getMode() === 'select_hold'){
			d3.select('.canvas svg').append('rect')
				.attr('class', 'selection')
				.style('opacity', 0.25);
		}
	};
	
	me.drag = function(){
		var ev = d3.mouse(this);
		if (me.tool_mode.getMode() === 'select_hold'){
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
				var cSvg = d3.select(this);
				
				if (cSvg.attr('cx') < right && cSvg.attr('cx') > left){
					if (cSvg.attr('cy') < bottom && cSvg.attr('cy') > top){
						cSvg.style('fill', me.selectColor);
					} else {
						var i = me.circles.indexOfObj(cSvg.attr('class'), 
							'class');
						cSvg.style('fill', me.circles[i].color);
					}
				} else {
					var i = me.circles.indexOfObj(cSvg.attr('class'), 
							'class');
					cSvg.style('fill', me.circles[i].color);
				}
			});
			
			d3.selectAll('.canvas line').each(function(){
				var lSvg = d3.select(this);
				var path = d3.select(this.parentNode).select('path');
				
				var midX = (parseInt(lSvg.attr('x1'), 10) + 
								parseInt(lSvg.attr('x2'), 10)) / 2;
				var midY = (parseInt(lSvg.attr('y1'), 10) + 
								parseInt(lSvg.attr('y2'), 10)) / 2;
				
				if (midX < right && midX > left){
					if (midY < bottom && midY > top){
						lSvg.style('stroke', me.selectColor);
						path.style('stroke', me.selectColor);
					} else {
						lSvg.style('stroke', '#004785');
						path.style('stroke', '#004785');
					}
				} else {
					lSvg.style('stroke', '#004785');
					path.style('stroke', '#004785');
				}
			});
		}
	};
	
	me.dragend = function(){
		if (me.tool_mode.getMode() === 'select_hold'){
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
		if(me.tool_mode.getMode() === 'delete_hold'){
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
		if(me.tool_mode.getMode() === 'rel_hold'){
			//if no entities have been clicked before this one
			if (me.lastNodeClicked === null){
				me.lastNodeClicked = this;
			//if this entity was the last node clicked, do nothing
			} else if(this === me.lastNodeClicked){
				return;
			} else {  //if this is the second unique entity chosen, draw a line
				$('.rel-form').animate({
					top: ( $('.canvas').height() / 2 ) - ( $('.rel-form').height() / 2 )
				}, 750);
				$('.rel-only').focus();		//apparently errors in IE if focus before visible
				
				var that = this;
				
				//creates on click event for relationship form submit button 
				d3.select('.rel-submit').on('click', function(){
					if ( $('.rel-only').val() === '') {
						alert('Please enter values for all form locations');
						return;
					}	
					
					var cSvg1 = d3.select(me.lastNodeClicked);
					var cSvg2 = d3.select(that);
					
					var ind1 = me.circles.indexOfObj(cSvg1.attr('class'), 
							'class');
					var ind2 = me.circles.indexOfObj(cSvg2.attr('class'), 
							'class');
					
					var cObj1 = me.circles[ind1];
					me.alterNodeColor('entity1', cObj1);
					cSvg1.transition(2500).style('fill', cObj1.color);
					
					var cObj2 = me.circles[ind2];
					me.alterNodeColor('entity2', cObj2);
					cSvg2.transition(2500).style('fill', cObj2.color);
					
					var toAttach = me.extractCircles(cObj2.group);
					for ( var j = 0; j < toAttach.length; j++ ) {
						var delta = me.circles[toAttach[j]];
						delta.group = cObj1.group;
					}
					
					var lInds = me.lines.getAllIndicies($('.rel-only').val(), 'd');
					if ( lInds.length !== 0 ) {
						var found = false;
						for ( var i = 0; i < lInds.length; i++ ) {
							var lObj = me.lines[lInds[i]];
							if ( lObj.source === cObj1.html && 
									lObj.target === cObj2.html ) {
								found = true;
							}
						}
						
						if (!found) {
							me.addLine(cSvg1, cSvg2, $('.rel-only').val());
						}
					} else {
						me.addLine(cSvg1, cSvg2, $('.rel-only').val());
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
		else if (me.tool_mode.getMode() === 'delete_hold'){
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
		if (me.tool_mode.getMode() === ''){
			$('.rel-ent2-form').animate({
				top: ( $('.canvas').height() / 2 ) - ( $('.rel-ent2-form').height() / 2 )
			}, 750);
			$('.relate').focus();		//apparently errors in IE if focus before visible
			
			var that = this;
	
			//creates on click event for rel - entity 2 form submit button 
			d3.select('.rel-ent-submit').on('click', function(){
				if ( $('.ent2').val() === ''  ||  $('.relate').val() === '' ) {
					alert('Please enter values for all form locations');
					return;
				}
			
				var cSvg1 = d3.select(that);
				var r = cSvg1.attr('r');
				var cObj1 = me.circles[me.circles.indexOfObj(cSvg1.attr('class'), 
							'class')];
							
				me.alterNodeColor('entity1', cObj1);
				cSvg1.transition(2500).style('fill', cObj1.color);
								
				//grab a random direction for new entity
				var deg = 360 * Math.random();
				var dx = r * r * Math.cos(deg);
				var dy = r * r * Math.sin(deg);
								
				//center of double-clicked entity, point 1 for new line
				var p1 = {
					x:parseInt(cSvg1.attr('cx'), 10),
					y:parseInt(cSvg1.attr('cy'), 10)
				};
				
				//center of new entity to be, point 2 for new line
				var p2 = {
					x:p1.x + dx,
					y:p1.y + dy
				};
								
				var c2ind = me.circles.indexOfObj($('.ent2').val(), 'd');
				var lInds = me.lines.getAllIndicies($('.relate').val(), 'd');
				var cSvg2;
				if (c2ind === -1){
					//create the entity 2
					cSvg2 = me.createCircle(me.computeCoord(p2.x, 'x'),
								me.computeCoord(p2.y, 'y'), $('.ent2').val());
					cSvg2.style('fill', me.entity2Color);
					
					me.circleCount++;
					
					var cObj2 = me.simplify(cSvg2);
					cObj2.color = me.entity2Color;
					cObj2.group = cObj1.group;
					me.circles.push(cObj2);
					
					me.addLine(cSvg1, cSvg2, $('.relate').val());
				} else if (lInds.length !== 0) {
					var found = false;
					var cObj2 = me.circles[c2ind];
					var toAttach = me.extractCircles(cObj2.group);
					
					for (var j = 0; j < toAttach.length; j++){
						var delta = me.circles[toAttach[j]];
						delta.group = cObj1.group;
					}
					
					for ( var i = 0; i < lInds.length; i++){
						var lObj = me.lines[lInds[i]];
						if (lObj.source === cObj1.html && lObj.target === cObj2.html){
							found = true;
						}
					}
					
					if (!found) {
						cSvg2 = d3.select(cObj2.html);
						me.addLine(cSvg1, cSvg2, $('.relate').val());
						me.alterNodeColor('entity2', cObj2);
						cSvg2.transition(2500).style('fill', cObj2.color);
					}
				} else {
					var cObj2 = me.circles[c2ind];
					var toAttach = me.extractCircles(cObj2.group);
					
					for (var j = 0; j < toAttach.length; j++){
						var delta = me.circles[toAttach[j]];
						delta.group = cObj1.group;
					}
					
					cSvg2 = d3.select(cObj2.html);
					me.addLine(cSvg1, cSvg2, $('.relate').val());
					me.alterNodeColor('entity2', cObj2);
					cSvg2.transition(2500).style('fill', cObj2.color);
				}	
				console.log(me.lines);
				console.log(me.circles);		
				
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
		if(!me.labelsShown){
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
		if(!me.labelsShown){
			d3.selectAll('.canvas text').remove();
		}
	};
	
	me.deleteNode = function(t){
		var index = me.circles.indexOfObj(d3.select(t).attr('class'),
				'class');
		var group = me.circles[index].group;
		d3.selectAll('.canvas line').each(function(){
			var line_index = me.lines.indexOfObj(d3.select(this).attr('class'),
					'class');
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
			var line_index = me.lines.indexOfObj(d3.select(this).attr('class'),
					'class');
			var l = me.lines[line_index];
			
			var cSvg1 = d3.select(l.source);
			var cSvg2 = d3.select(l.target);
			
			var cObj1 = me.circles[me.circles.indexOfObj(cSvg1.attr('class'),
					'class')];
			var cObj2 = me.circles[me.circles.indexOfObj(cSvg2.attr('class'),
					'class')];
			
			me.alterNodeColor('entity1', cObj1);
			cSvg1.style('fill', cObj1.color);
			
			me.alterNodeColor('entity2', cObj2);
			cSvg2.style('fill', cObj2.color);
		});
	};
	
	me.deleteLink = function(t){
		var group;
		var index = me.lines.indexOfObj(d3.select(t).attr('class'),
					'class');
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
		
		d3.selectAll('.canvas line').each(function(){
			var line_index = me.lines.indexOfObj(d3.select(this).attr('class'),
					'class');
			var l = me.lines[line_index];
			
			var cSvg1 = d3.select(l.source);
			var cSvg2 = d3.select(l.target);
			
			var cObj1 = me.circles[me.circles.indexOfObj(cSvg1.attr('class'),
					'class')];
			var cObj2 = me.circles[me.circles.indexOfObj(cSvg2.attr('class'),
					'class')];
			
			me.alterNodeColor('entity1', cObj1);
			cSvg1.style('fill', cObj1.color);
			
			me.alterNodeColor('entity2', cObj2);
			cSvg2.style('fill', cObj2.color);
		});
	};
		
	/**
		called from me.toggleSelection when mode is label_hold
		@param - none
		@return - none
		@functionality - shows all labels for any element in the canvas
		@internal functions - none
	*/
	me.toggleLabels = function(){
		if (!me.labelsShown){
			me.labelsShown = true;
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
		} else {
			d3.selectAll('.canvas text').remove();
			me.labelsShown = false;
		}
	};
		
	me.createArrow = function(line){
		var path = d3.select(line[0][0].parentNode).append('path')
			.attr('class', 'arrow')
			.attr('marker-mid', 'url(#Triangle)')
			.attr('d', function(){
				var midX = (parseInt(line.attr('x1'), 10) + parseInt(line.attr('x2'), 10)) / 2;
				var midY = (parseInt(line.attr('y1'), 10) + parseInt(line.attr('y2'), 10)) / 2;
				return 'M '+ line.attr('x1')+' ' + line.attr('y1') +
					  ' L '+ midX + ' ' + midY +
					  ' L '+ line.attr('x2')+' ' + line.attr('y2');
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
						var l = me.lines[me.lines.indexOfObj(d3.select(this).attr('class'),
								'class')];
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
			var i = me.circles.indexOfObj(c.attr('class'),
					'class');
			c.style('fill', me.circles[i].color);
		});
		
		d3.selectAll('.canvas line').style('stroke', '#004785');
		d3.selectAll('.canvas path').style('stroke', '#004785');
	};
	
	me.saveTargetAssertions = function(){
		me.currentState = { assertions : [], singletons: [] };
		for (var i = 0; i < me.lines.length; i++){
			var tempUrl = assert_url;
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
				color: c1.color,
				class: c1.class,
				group: c1.group
			};
			var relationship = {
				name: "relationship",
				value: line.d,
				color: 0,
				class: line.class
			};
			var entity2 = {
				name: "entity2",
				value: c2.d,
				x: parseInt(c2.x, 10),
				y: parseInt(c2.y, 10),
				color: c2.color,
				class: c2.class,
				group: c2.group
			};
						
			var postData = {
				name: c1.d + ' ' + line.d + ' ' + c2.d,
				description:"",
				entity1: [entity1],
				relationship: [relationship],
				entity2: [entity2]
			};
			
			//update if already exists in database
				if ( line.id !== undefined ){
					tempUrl += line.id;
				}
			
			me.currentState.assertions.push(postData);
			
			/*$.ajax({
				type: "POST",
				url: tempUrl,
				data: postData,
				success: function(r){
					console.log(r);
				}
			});*/
		}
				
		for (i = 0; i < me.circles.length; i++){
			var c = me.circles[i];
			var tempUrl = assert_url;
			if(me.isAlone(c)){
				var entity1 = {
					name: 'entity1',
					value: c.d,
					x: parseInt(c.x, 10),
					y: parseInt(c.y, 10),
					color: c.color,
					class: c.class,
					group: c.group		
				};
				
				var postData = {
					name: c.d,
					description:"",
					entity1: [entity1]
				};
				
				//update if already exists in database
				if ( c.id !== undefined ){
					tempUrl += c.id;
				}
				
				me.currentState.singletons.push(postData);
				/*$.ajax({
					type: "POST",
					url: "../../../lib/post_relay.php",
					data: JSON.stringify({url: url, data: postData}),
					success: function(){console.log('success');},
					error: function(){console.log('error');}
				});
				
				$.ajax({
					type: "POST",
					url: tempUrl,
					data: postData,
					success: function(r){
						console.log(r);
					}
				});*/
			}
		}
		me.saveState(JSON.stringify(me.currentState));
		//me.saveTargetEvent();
		console.log(me.currentState);
	};
	
	me.saveTargetEvent = function() {
		var tempUrl = event_url;
		if ( me.event.id !== undefined ) {
			tempURL += me.event.id;
		}
		
		me.event = {
			name: "one",
			description: "fish two fish",
			event_horizon: [],
			location: [],
			assertions: []
		};
		
		for ( var i = 0; i < me.circles; i++ ) {
			var cObj = me.circles[i];
			if ( me.isAlone(cObj) ) {
				me.event.assertions.push(cObj.id.toString());
			}
		}
		
		for ( var i = 0; i < me.lines; i++ ) {
			me.event.assertions.push(me.lines[i].id.toString());
		}
		
		console.log(JSON.stringify(me.event));
		$.ajax({
			type: "POST",
			url: tempUrl,
			dataType: 'application/json',
			data: JSON.stringify(me.event),
			success: function(r){
				console.log(r);
			}
		});
	};
	
	me.redraw = function(json){
		var assertions = json.assertions;
		var singletons = json.singletons;
				
		for (var i = 0; i < assertions.length; i++){
			var c1 = assertions[i].entity1[0];
			var c2 = assertions[i].entity2[0];
			var l = assertions[i].relationship[0];
			
			var cInd1 = me.circles.indexOfObj(c1.class, 'class');
			var cInd2 = me.circles.indexOfObj(c2.class, 'class');
			
			if (cInd1 === -1){
				me.createCircle(c1.x, c1.y, c1.value, c1);
				cInd1 = me.circles.length - 1;
			}
			
			if (cInd2 === -1){
				me.createCircle(c2.x, c2.y, c2.value, c2);
				cInd2 = me.circles.length - 1;
			}
			
			if(me.lines.indexOfObj(l.class, 'class') === -1){
				var cSvg1 = d3.select(me.circles[cInd1].html);
				var cSvg2 = d3.select(me.circles[cInd2].html);
				me.addLine(cSvg1, cSvg2, l.value, l);
			}
		}
		
		for (var i = 0; i < singletons.length; i++){
			var c = singletons[i].entity1[0];
			if (me.circles.indexOfObj(c.class,'class') === -1){
				me.createCircle(c.x, c.y, c.value, c);
			}
		}
	};
	
	me.saveState = function(state){
		if (me.pastStates.indexOf(state,
					'class') === -1){
			me.pastStates.push(state);
		}
		
		if(me.pastStates.length > 10){
			me.pastStates.shift();
		}
		console.log(JSON.parse(state));
		console.log(me.pastStates);
	};
	
	me.undo = function(){
		if (me.pastStates.length > 0){
			d3.select('.node-link-container').remove();
			d3.select('.canvas svg').append('g')
				.attr('class', 'node-link-container');
	
			me.circles = [];
			me.lines = [];
			me.count = 0;
			me.circleCount = 0;
			me.lineCount = 0;

			me.redraw(JSON.parse(me.pastStates.pop()));
		}
	};
	
	me.deleteSelection = function(){
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
	};
	
	me.alterNodeColor = function(type, obj){
		if (type === 'entity1'){
			if ( obj.color === white ) {
				obj.color = me.entity1Color;
			} else if ( obj.color !== me.entity1Color ) {
				obj.color = me.bothColor;
			}
		} else if ( type === 'entity2' ) {
			if ( obj.color === white ) {
				obj.color = me.entity2Color;
			} else if ( obj.color !== me.entity2Color ) {
				obj.color = me.bothColor;
			}
		}
	};
};