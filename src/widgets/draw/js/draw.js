//with help from threedubmedia.com/code/event/drop/demo/selection

/**
@params		div_class: a string pointing to the class of the hidden
			div element containing a background color, most likely to
			be in the form of rgb(0,0,0)
@return		a hex color string representing the background-color of the
			specified div element. If no div element exists, return me.aloneColor
@function	d3.selects the div param and grabs its background color.
			if already in the form of a hex string, the color is returned
			if in rgb(0,0,0) form, converts it to a hex string
			if no div element with class div_class exists, return me.aloneColor
*/
var getHexString = function(div_class){
	if ( d3.select(div_class)[0][0] ) {
		var colorString = d3.select(div_class).style('background-color');
		if (colorString.substr(0, 1) === '#'){
			return colorString;
		}
		
		var array = colorString.split('(')[1].split(')')[0].split(',');	
		var str = '#';
		var temp;
		array.forEach(function(d){
			var parsed = parseInt(d, 10);
			if (parsed > 9){
				temp = parsed.toString(16);
				str += temp;
			} else if ( parsed > -1 ){
				temp = parsed.toString(16);
				str += '0' + temp;
			}
		});
		return str;
	} else {
		return '#ffffff';
	}	
};

var indexOfObj = function(array, value, attribute){
	for (var i = 0; i < array.length; i++){
		if (value.toLowerCase() === array[i][attribute].toLowerCase()){
			return i;
		}
	}
	
	return -1;
};

var getObject = function (array, value, attribute) {
	for (var i = 0; i < array.length; i++){
		if (value.toLowerCase() === array[i][attribute].toLowerCase()){
			return array[i];
		}
	}
	return null;
};

var getAllIndicies = function(array, value, attribute){
	var indicies = [];
	array.forEach(function(d, i){
		if (value.toLowerCase() === d[attribute].toLowerCase()){
			indicies.push(i);
		}
	});
	
	return indicies;
};

var draw = function(){
	var me =  this;
	var assert_url = 'http://everest-build:8081/target_assertion/';
	var event_url = 'http://everest-build:8081/target-event/';
	
	me.target_event = { name: 'target event' };
	
	me.aloneColor = getHexString('.aloneColor');
	me.entity1Color = getHexString('.entity1Color');
	me.entity2Color = getHexString('.entity2Color');
	me.bothColor = getHexString('.bothColor');
	me.lineColor = getHexString('.lineColor');
	me.selectColor = '#ff0000';
	
	me.radius = 8;
	me.count = 0;
	me.maxX = -1;
	me.maxY = -1;
	
	me.canvasW = 0;
	me.canvasH = 0;
	me.padding = 15;
	me.labelsShown = false;
		
	me.circles = [];
	me.lines = [];

	me.lastNodeClicked = null;
	me.startClick = null;
	me.pastStates = [];
	
	me.assertions = {};
	me.event = {};
		
	var images = {
		node: 'img/node.png',
		link: 'img/link.png',
		move: 'img/mover.png',
		deleteM: 'img/deleteM.png',
		select: 'img/select.png',
		reset: 'img/reset.png',
		submit: 'img/submit.png',
		undo: 'img/undo.png',
		deleteB: 'img/deleteB.gif',
		label: 'img/text.png'
	};		

	me.setUpToolbars = function(){
		me.t_mode = new toolbar('#toolbar_modes');
		me.t_mode.createSelection('node_hold', images.node);
		me.t_mode.createSelection('rel_hold', images.link);
		me.t_mode.createSelection('mover_hold', images.move);
		me.t_mode.createSelection('delete_hold', images.deleteM);	
		me.t_mode.createSelection('select_hold', images.select);
	
		me.t_button = new toolbar('#toolbar_buttons');
		me.t_button.createSelection('resetB', images.reset, me.resetCanvas);		
		me.t_button.createSelection('submitB', images.submit,
			me.saveTargetAssertions);
		me.t_button.createSelection('undoB', images.undo, me.undo);
		me.t_button.createSelection('deleteB', images.deleteB, 
			me.deleteSelection);
		me.t_button.createSelection('labelB', images.label, me.toggleLabels);
	};
	
	/**
	@param		item: a d3.select()'ed circle
	@return		an object containing the desired attributes of item
	@function	simplifies the circle for storage in me.circles
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
	@param		circle: simplified circle object from me.circles
	@return		boolean stating whether circle is connected by a line
				to another circle
	@function	search through each line in me.lines to see if this
				circle's class is used as a source or target for any
				of the lines. if it is, something is connected to it
	*/
	me.isAlone = function(circle){
		var alone = true;
		me.lines.forEach(function(d){
			if (d.source === circle.html || d.target === circle.html ){
				alone = false;
			}
		});
		return alone;
	};
	
	/**
	@param		g: group number corresponding to an existing circle 
	@return		an array of indicies pointing back to circles in
				me.circles, which all have the same group number
	@function	searches through me.circles for any circles that
				have the same group as specified by g
	*/
	me.extractCircles = function(g){
		var array = [];
		me.circles.forEach(function(d, i){
			if ( d.group === g ) {
				array.push(i);
			}
		});
		return array;
	};
	
	/**
	@param		newC: coordinate within canvas to attempt to add new item at
				axis: 'x' or 'y' to indicate what bound to compare against
	@return		an integer within the bounds of the svg element
	@function	takes newC, checks to see if it is w/in the bounds of the
				canvas, returning if it is or returning a proper min or max
	*/
	me.computeCoord = function(newC, axis){
		var max = axis === 'x' ? me.canvasW : me.canvasH;
		
		if (newC < me.padding){	
			return me.padding;
		} else if (newC > max - me.padding){
			return max - me.padding;
		} else {
			return Math.floor(newC);
		}
	};
	
	/**
	@function	selects all of the cancel buttons in each of the hidden forms 
				and adds a hide function to them for when they are clicked
	*/
	me.createClickers = function(){
		d3.select('#ent-cancel').on('click', function(){
			$('.ent1').val('');
			$('.ent1-form').animate({
				height: '0',
				opacity: '0'
			}, 750);
		});
		
		d3.select('#rel-cancel').on('click', function(){
			me.lastNodeClicked = null;
			$('.rel-only').val('');
			$('.rel-form').animate({
				height: '0',
				opacity: '0'
			}, 750);
		});
		
		d3.select('#rel-ent-cancel').on('click', function(){
			$('.relate').val('');
			$('.ent2').val('');
			$('.rel-ent2-form').animate({
				height: '0',
				opacity: '0'
			}, 750);
		});
		
		d3.select('#save_target').on('click', me.saveTargetEventToTitan);
	};

	/**
	@function	adds an svg element to the canvas div which will be where any
				circle or line elements are added to. An on click event is added
				to the svg element which executes createCircle if the mode is 
				currently node_hold and	resets the colors of each of the 
				elements if the mode is select_hold
	*/
	me.createCanvas = function(){
		var canvas = d3.select('#canvas');
		me.canvasW = canvas.style('width').split('p')[0];
		me.canvasH = canvas.style('height').split('p')[0];
		
		var svg = canvas.append('svg').attr('class', 'csvg')
			.attr('width', me.canvasW).attr('height', me.canvasH)
			.on('click', function(){
				if ( me.t_mode.getMode() === 'node_hold' ) {
					me.createCircle(d3.mouse(this));
				} else if ( me.t_mode.getMode() === 'select_hold' ) {
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
		
		//creates the marker for the midpoint arrow on each line	
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
	
	/**
	@param		e is a d3.mouse(this) result containing an array
				of 2 elements representing the x and y coordinate of the 
				mouse when the user clicked the svg canvas
	@function	user enters a description through a form element.
				adds an on click event to the submit button that creates
				a circle based on the description the user entered.
	*/
	me.createCircle = function(e){
		if ( !e[0] ){ e[0] = 0; }
		if ( !e[1] ){ e[1] = 0; }
		
		$('.ent1-form').animate({
			height: '30%',
			opacity: '1'
		}, 750);
		$('.ent1').focus();
		
		d3.select('#ent-submit').on('click', function(){
			
			if (getObject(me.circles, $('.ent1').val(), 'd') === null){
				me.addCircle(e[0], e[1], $('.ent1').val());
			}

			$('.ent1-form').animate({
				height: '0',
				opacity: '0'
			}, 750);
			$('.ent1').val('');
		});
	};
	
	/**
	@param		x x-axis coordinate in the svg to place the new circle
				y y-axis coordinate in the svg to place the new circle
				d value assigned to the circle
				c (optional) making a copy of a circle from data read in
	@return		the svg representation of the newly created circle
	@function	appends a circle to the svg group node-link-container with
				the corresponding properties given in the parameters.
				if the c parameter is given, assign fill, cclass and group
				based off of c, if it is not, fill is me.aloneColor, and assign
				the element count to group and class. also adds the simplified
				version of the circle to the circles array
	*/
	me.addCircle = function(x, y, d, c){
		var fill, cclass, group;
		if ( c !== undefined ) {
			fill = c.color;
			cclass = c.class;
			group = c.group;
		} else {
			fill = me.aloneColor;
			cclass = me.count;
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
		
		return circle;
	};
	
	/**
	@param		c1 svg representation of source circle for new line
				c2 svg representation of target circle for new line
				d value assigned to the line
				l (optional) making a copy of a line from data read in
	@return		the svg representation of the newly created line
	@function	inserts a new group to the beginning of the node-link-
				container that will hold a new line and path. if the l 
				parameter is given, assign class, if not, assign the element
				count to class. also adds the simplified version of the line to
				the lines array
	*/	
	me.addLine = function(c1, c2, d, l){
		var lClass = l !== undefined ? l.class : me.count;
			
		var p1 = {x:parseInt(c1.attr('cx'), 10), y:parseInt(c1.attr('cy'), 10)};
		var p2 = {x:parseInt(c2.attr('cx'), 10), y:parseInt(c2.attr('cy'), 10)};
		var lGroup = d3.select('.node-link-container')
			.insert('g', ':first-child');
		
		var lSvg = lGroup.append('line')
			.attr('class', lClass).attr('d', d)
			.attr('x1', me.computeCoord(p1.x, 'x'))
			.attr('y1', me.computeCoord(p1.y, 'y'))
			.attr('x2', me.computeCoord(p2.x, 'x'))
			.attr('y2', me.computeCoord(p2.y, 'y'))
			.call(d3.behavior.drag().on('drag', me.move))
			.on('click', me.lineclick)
			.on('mouseover', me.mouseover)
			.on('mouseout', me.mouseout); 

		me.addArrow(lSvg);
		me.count++;
		
		var lObj = {
			class: lSvg.attr('class'),
			html: lSvg[0][0],
			d: lSvg.attr('d'),
			source: c1[0][0],
			target: c2[0][0]
		};
		me.lines.push(lObj);
		
		return lSvg;
	};
	
	/**
	@param		line svg representation of the line to add a path to
	@return		svg representation of the path corresponding to param line
	@function	creates a svg path on top of the line so that a midpoint
				marker representing and arrow is created, pointing from
				source of line to target of line
	*/
	me.addArrow = function(line){
		var path = d3.select(line[0][0].parentNode)
			.insert('path', ':first-child')
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
	
	/** 
	@function	if this is a line, point item at the source of the line
				if this is a circle, point item at this
				if the mode is mover_hold or this is a line, call drag group on 
				each of the circles attached to item, in turn moving the entire
				group the same amount. if the mode is select_hold and item is 
				a circle, move only the elements that are colored with the 
				select color. if the mode is '' and is a circle just drag item
	*/
	me.move = function(){
		var item = null;
		if ( this.localName === 'line' ) {
			var lSvg = d3.select(this);
			var lObj = getObject(me.lines, lSvg.attr('class'), 'class');
			item = lObj.source;
		} else if ( this.localName === 'circle' ) {
			item = this;
		}
	
		if ( item !== null ){
			if ( me.t_mode.getMode() === 'mover_hold' ||
					this.localName === 'line') {
				var cObj = getObject(me.circles, d3.select(item).attr('class'), 'class');
				var cIndicies = me.extractCircles(cObj.group);
				
				cIndicies.forEach(function(d){
					me.dragGroup(me.circles[d].html);
				});
			} else if ( me.t_mode.getMode() === 'select_hold' ) {
				if ( d3.select(item).style('fill') === me.selectColor ) {
					d3.selectAll('#canvas circle').each(function(){
						var c = d3.select(this);
						if (c.style('fill') === me.selectColor){
							me.dragGroup(this);
						}
					});
				}
			} else if (me.t_mode.getMode() === ''){
				me.dragGroup(item);
			}
		}
	};
	
	/**
	@param		cHtml html representation of the circle that is to be dragged
	@function	grabs the svg representation of cHtml and moves it and
				the endpoint of any line that points to cHtml
				redraws all paths instead of moving just those that would
				be effected
	*/
	me.dragGroup = function(cHtml){
		var cSvg = d3.select(cHtml);
		var cObj = getObject(me.circles, cSvg.attr('class'), 'class');
		var dx = d3.event.dx, dy = d3.event.dy;
			
		//move the circle based on the d3 event that occured
		cSvg.attr('cx', function() { 
			var newC = dx + parseInt(cSvg.attr('cx'), 10);
			cObj.x = me.computeCoord(newC, 'x'); 
			return cObj.x;
		}).attr('cy', function() { 
			var newC = dy + parseInt(cSvg.attr('cy'), 10);
			cObj.y = me.computeCoord(newC, 'y'); 
			return cObj.y;
		});

		d3.selectAll('.arrow').remove();
		d3.selectAll('#canvas line').each(function(){
			var x, y;
			var lSvg = d3.select(this);
			var lObj = getObject(me.lines, lSvg.attr('class'), 'class');
					
			if ( lObj.source === cObj.html ) {
				x = 'x1';
				y = 'y1';
			} else if ( lObj.target === cObj.html ) {
				x = 'x2';
				y = 'y2';
			} else {
				x = null;
				y = null;
			}
			
			//if the entity is attached to a relationship and other entity 
			if ( x && y ) {
				lSvg.attr(x, function() { 
					var newC = dx + parseInt(lSvg.attr(x), 10);
					return me.computeCoord(newC, 'x');
				}).attr(y, function() { 
					var newC = dy + parseInt(lSvg.attr(y), 10);
					return me.computeCoord(newC, 'y');
				});
			}
			
			var path = me.addArrow(lSvg);
			if ( lSvg.style('stroke') === me.selectColor ) {
				path.style('stroke', me.selectColor);
			}
		});
	};
	
	/**
	@function	when in select_hold mode, gets the initial location of the mouse
				when the user begins a dragstart event and creates a selection 
				rectangle of size 0 beginning at that initial click
	*/
	me.dragstart = function(){
		me.startClick = d3.mouse(this);
		if ( me.t_mode.getMode() === 'select_hold' ) {
			d3.select('.csvg').append('rect')
				.attr('class', 'selection')
				.style('opacity', 0.15);
		}
	};
	
	/**
	@function	when in select_hold mode, gets the current location of the mouse
				as the user continues to drag, the mouse location updates and 
				the selection rectangle created in dragstart changes shape
				the diagonally opposite corner of the selection rectangle 
				corresponds to the location of the mouse when this function is
				called. any circles or lines that reside in the current location
				of the selection rectangle are colored with the selectColor
	*/
	me.drag = function(){
		var ev = d3.mouse(this);
		if (me.t_mode.getMode() === 'select_hold'){
			d3.select('.selection').attr('width', Math.abs( ev[0] - me.startClick[0] ))
				.attr('height', Math.abs( ev[1] - me.startClick[1] ))
				.attr('x', Math.min( ev[0], me.startClick[0] ))
				.attr('y', Math.min( ev[1], me.startClick[1] ));
			 
			var rect = d3.select('.selection');
			var left = parseInt(rect.attr('x'), 10);
			var top = parseInt(rect.attr('y'), 10);
			var right = left + parseInt(rect.attr('width'), 10);
			var bottom = top + parseInt(rect.attr('height'), 10);
				
			d3.selectAll('#canvas circle').each(function(){
				var cObj;
				var cSvg = d3.select(this);
				
				if (cSvg.attr('cx') < right && cSvg.attr('cx') > left){
					if (cSvg.attr('cy') < bottom && cSvg.attr('cy') > top){
						cSvg.style('fill', me.selectColor);
					} else {
						cObj = getObject(me.circles, cSvg.attr('class'), 'class');
						cSvg.style('fill', cObj.color);
					}
				} else {
					cObj = getObject(me.circles, cSvg.attr('class'), 'class');
					cSvg.style('fill', cObj.color);
				}
			});
			
			d3.selectAll('#canvas line').each(function(){
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
						lSvg.style('stroke', me.lineColor);
						path.style('stroke', me.lineColor);
					}
				} else {
					lSvg.style('stroke', me.lineColor);
					path.style('stroke', me.lineColor);
				}
			});
		}
	};
	
	/**
	@function	when in select_hold mode, if the user stops dragging the
				selection rectangle is removed, but any circles or lines that
				were in that rectangle before it was remove remain selectColor
	*/
	me.dragend = function(){
		if (me.t_mode.getMode() === 'select_hold'){
			d3.select('.selection').remove();
		}
	};
	
	/**
	@function	when in delete_hold mode, deleteItem is called on this line and
				the svg:g element holding this and its corresponding path is
				removed from the svg:g node-link-container
	*/
	me.lineclick = function(){	
		if(me.t_mode.getMode() === 'delete_hold'){
			me.deleteItem(this);
		}
	};
	
	/**
	@function	when in rel_hold mode, attaches two distinct nodes if one is
				clicked and then another. uses lastNodeClicked to keep track of
				the first node, and when the second is clicked, if there does
				not already exist a line with the specified value between the 
				two, a new line is added with the source as the first node and
				the target as the second node. when in delete_hold mode, the
				circle is removed from the svg node-link-container the colors of
				each of the nodes that were clicked must change corresponding to
				what kind of entity they are
	*/
	me.nodeclick = function(){
		if(me.t_mode.getMode() === 'rel_hold'){
			//if no entities have been clicked before this one
			if (me.lastNodeClicked === null){
				me.lastNodeClicked = this;
			//if this entity was the last node clicked, do nothing
			} else if(this === me.lastNodeClicked){
				return;
			} else {  //if this is the second unique entity chosen, draw a line
				$('.rel-form').animate({
					opacity: '1',
					height: '30%'
				}, 750);
				$('.rel-only').focus();		//apparently errors in IE if focus before visible
				
				var c2Html = this;
				
				//creates on click event for relationship form submit button 
				d3.select('#rel-submit').on('click', function(){
					if ( $('.rel-only').val() === '') {
						alert('Please enter values for all form locations');
						return;
					}	
					
					var cSvg1 = d3.select(me.lastNodeClicked);
					var cSvg2 = d3.select(c2Html);
					
					var cObj1 = getObject(me.circles, cSvg1.attr('class'),  'class');
					me.alterNodeColor('entity1', cObj1);
					cSvg1.style('fill', cObj1.color);
					
					var cObj2 = getObject(me.circles, cSvg2.attr('class'),  'class');
					me.alterNodeColor('entity2', cObj2);
					cSvg2.style('fill', cObj2.color);
					
					var toAttach = me.extractCircles(cObj2.group);
					toAttach.forEach(function(d){
						me.circles[d].group = cObj1.group;
					});
					
					var lInds = getAllIndicies(me.lines, $('.rel-only').val(), 'd');
					if ( lInds.length !== 0 ) {
						var found = false;
						lInds.forEach(function(d){
							if ( me.lines[d].source === cObj1.html && 
									me.lines[d].target === cObj2.html ) {
								found = true;
							}
						});
						
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
						opacity: '0',
						height: '0'
					}, 750);
				});	
			}
		}
		else if (me.t_mode.getMode() === 'delete_hold'){
			me.deleteItem(this);
		}
	};
	
	/**
	@function	when in '' mode, if a circle is doubleclicked and valid input is
				placed in the corresponding form, a new line and circle is
				attached to the circle that was double clicked, creating a new
				relationship. the colors of the double clicked circle and new 
				circle must change corresponding to what kind of entity they are
	*/
	me.doubleClickNode = function(){
		if (me.t_mode.getMode() === ''){
			$('.rel-ent2-form').animate({
				opacity: 1,
				height: '30%'
			}, 750);
			$('.relate').focus();		//apparently errors in IE if focus before visible
			
			var c1Html = this;
			//creates on click event for rel - entity 2 form submit button 
			d3.select('#rel-ent-submit').on('click', function(){
				if ( $('.ent2').val() === ''  ||  $('.relate').val() === '' ) {
					alert('Please enter values for all form locations');
					return;
				}
			
				var cSvg1 = d3.select(c1Html);
				var r = cSvg1.attr('r');
				var cObj1 = getObject(me.circles, cSvg1.attr('class'), 'class');
							
				me.alterNodeColor('entity1', cObj1);
				cSvg1.style('fill', cObj1.color);
								
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
				
				var cObj2 = getObject(me.circles, $('.ent2').val(), 'd');
				var lInds = getAllIndicies(me.lines, $('.relate').val(), 'd');

				var cSvg2, toAttach;
				if (cObj2 === null){
					//create the entity 2
					cSvg2 = me.addCircle(me.computeCoord(p2.x, 'x'),
								me.computeCoord(p2.y, 'y'), $('.ent2').val());
					cSvg2.style('fill', me.entity2Color);
					me.circles[me.circles.length - 1].color = me.entity2Color;
					me.circles[me.circles.length - 1].group = cObj1.group;
					
					me.addLine(cSvg1, cSvg2, $('.relate').val());
				} else if (lInds.length !== 0) {
					var found = false;
					toAttach = me.extractCircles(cObj2.group);
					toAttach.forEach(function(d){
						me.circles[d].group = cObj1.group;
					});
					
					lInds.forEach(function(d){
						if (me.lines[d].source === cObj1.html && 
								me.lines[d].target === cObj2.html){
							found = true;
						}
					});
					
					if (!found) {
						cSvg2 = d3.select(cObj2.html);
						me.addLine(cSvg1, cSvg2, $('.relate').val());
						me.alterNodeColor('entity2', cObj2);
						cSvg2.style('fill', cObj2.color);
					}
				} else {
					toAttach = me.extractCircles(cObj2.group);
					toAttach.forEach(function(d){
						me.circles[d].group = cObj1.group;
					});
					
					cSvg2 = d3.select(cObj2.html);
					me.addLine(cSvg1, cSvg2, $('.relate').val());
					me.alterNodeColor('entity2', cObj2);
					cSvg2.style('fill', cObj2.color);
				}			
				
				$('.relate').val('');
				$('.ent2').val('');
				$('.rel-ent2-form').animate({
					opacity: '0',
					height: '0'
				}, 750);
			});	
		}
	};
	
	/**
	@function	if labelsShown is false, meaning the show all text button has
				not been pressed, a new svg text element is added to the canvas
				representing the value of the item currently being hovered over
	*/
	me.mouseover = function(){
		if ( !me.labelsShown ) {
			var x = 0, y = 0;
			var item = d3.select(this);	
			//if the element being hovered over is an entity
			if ( this.localName === 'circle' ) {
				x = parseInt(item.attr('cx'), 10) + me.padding;
				y = parseInt(item.attr('cy'), 10) - me.padding;
				item.transition().duration(750)
					.attr('r', 2 * me.radius);
			} else if ( this.localName === 'line' ) {
				x = ((parseInt(item.attr('x1'), 10) + 
					parseInt(item.attr('x2'), 10)) / 2) + me.padding;
				y = ((parseInt(item.attr('y1'), 10) + 
					parseInt(item.attr('y2'), 10)) / 2) - me.padding;
			} 
			
			d3.select('.csvg').append('text')
				.attr('x', x).attr('y', y)
				.text(item.attr('d'));
		}
	};
	
	/**
	@function	if labelsShown is false, meaning the show all text button has
				not been pressed, all svg text elements are removed from the
				canvas when the mouse previously hovering over this element 
				has moved off of this element.
	*/
	me.mouseout = function(){
		if ( !me.labelsShown ) {
			d3.selectAll('#canvas text').remove();
			if ( this.localName === 'circle' ) {
				d3.select(this).transition()
					.duration(750)
					.attr('r', me.radius);
			}
		}
	};
	
	/**
	@param		itemHtml the html representation of an item that has been 
				clicked and is to be removed
	@function	removes the selected item (line or circle) from the svg
				node-link-container and also removes it from lines or circles
				then calls separate groups to regroup remaining circles 
				and then recolor them based on what type of entity they are
				
	*/
	me.deleteItem = function(itemHtml){
		var group = -1;
		if ( itemHtml.localName === 'circle' ){
			var index = indexOfObj(me.circles,
				d3.select(itemHtml).attr('class'), 'class');
			group = me.circles[index].group;
			d3.selectAll('#canvas line').each(function(){
				var line_ind = indexOfObj(me.lines, 
					d3.select(this).attr('class'), 'class');
				var lObj = me.lines[line_ind];
				if (lObj.source === me.circles[index].html || 
						lObj.target === me.circles[index].html){
					me.lines.splice(line_ind,1);
					d3.select(this.parentNode).remove();
				}
			});
			
			me.circles.splice(index, 1);
			d3.select(itemHtml).remove();
		} else if ( itemHtml.localName === 'line' ){
			var index = indexOfObj(me.lines,
				d3.select(itemHtml).attr('class'), 'class');
			me.circles.forEach(function(d){
				if (d.html === me.lines[index].source){
					group = d.group;
				}
			});
			
			me.lines.splice(index,1);
			d3.select(itemHtml.parentNode).remove();
		}
		
		if (group !== -1){
			var cIndicies = me.extractCircles(group);
			me.separateGroups(cIndicies);
			
			d3.selectAll('#canvas line').each(function(){
				var lObj = getObject(me.lines, d3.select(this).attr('class'), 'class');
				var cSvg1 = d3.select(lObj.source);
				var cSvg2 = d3.select(lObj.target);
				
				var cObj1 = getObject(me.circles, cSvg1.attr('class'), 'class');
				var cObj2 = getObject(me.circles, cSvg2.attr('class'), 'class');
				
				me.alterNodeColor('entity1', cObj1);
				cSvg1.style('fill', cObj1.color);
				
				me.alterNodeColor('entity2', cObj2);
				cSvg2.style('fill', cObj2.color);
			});
		}
	};
	
	/**
	@param		circleGroup array of integers representing circles that all
				have the same group number
	@function	first recolors all circles pointed to by the indicies in 
				circleGroup and assigns new distinct group numbers to each
				double for loop iterates through each of the circles and then
				previously seen circles to see if there exist any lines between
				them, if there is a line, the new circle gets reassigned to
				the past circles group. in the end, all circles that are 
				connected are lumped into a group
	*/
	me.separateGroups = function(circleGroup){
		if ( circleGroup.length !== 0 ) {
			me.circles[circleGroup[0]].color = me.aloneColor;
			d3.select(me.circles[circleGroup[0]].html).style('fill', me.aloneColor);
			for ( var i = 1; i < circleGroup.length; i++ ) {
				var c = me.circles[circleGroup[i]];
				c.color = me.aloneColor;
				c.group = me.count++;
				d3.select(c.html).style('fill', me.aloneColor);
			}
			
			//want to iterate through and divide them up
			circleGroup.forEach(function(d, i){
				var cObj = me.circles[d];
				var thisGroup = [];
				
				//compare to those who have already been allocated a new group
				for ( var j = 0; j < i; j++ ) {
					var cObj2 = me.circles[circleGroup[j]];
					d3.selectAll('#canvas line').each(function(){
						var l = getObject(me.lines, d3.select(this).attr('class'), 'class');
						if (l.source === cObj.html && l.target === cObj2.html){
							thisGroup.push(me.circles[circleGroup[j]]);	
						} else if (l.source === cObj2.html && l.target === cObj.html){
							thisGroup.push(me.circles[circleGroup[j]]);
						}
					});
					
					if ( thisGroup.length === 0 ) {
						cObj.group = me.count++;
					} else {		//this group contains at least one circle
						var small = { group: Number.MAX_VALUE };
						for ( var k = 0; k < thisGroup.length; k++ ) {
							if ( thisGroup[k].group < small.group ){
								small = thisGroup[k];
							}
						}
						
						for ( var k = 0; k < thisGroup.length; k++ ) {
							var t = me.extractCircles(thisGroup[k].group);
							for (var m = 0; m < t.length; t++){
								me.circles[t[m]].group = small.group;
							}
						}
						
						cObj.group = small.group;
					}
				}
			});
		}
	};
	
	/**
	@function	used mainly to remove selectColor from previously selected nodes
				resets all the circles to be filled with their correct color
				and resets line/path colors
	*/
	me.resetColors = function(){
		d3.selectAll('#canvas circle').each(function(){
			var cSvg = d3.select(this);
			var cObj = getObject(me.circles, cSvg.attr('class'), 'class');
			cSvg.style('fill', cObj.color);
		});
		
		d3.selectAll('#canvas line').style('stroke', me.lineColor);
		d3.selectAll('#canvas path').style('stroke', me.lineColor);
	};
	
	/**
	@function	saves the state of the current canvas as a target event
				and posts it to /target_event/
				if this target event already has an _id, the target event
				is updated instead of created
	*/
	me.saveTargetEvent = function() {
		var tempUrl = event_url;
		if ( me.event.id !== undefined ) {
			tempUrl += me.event.id;
		}
		var date = new Date();
		me.event = {
			name: date.getTime(),
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
			data: me.event,
			success: function(r){
				console.log(r);
			}
		});
	};
	
	/**
	@param		json json object formatted with asserions and singletons which
				will be used to redraw a previously saved canvas
	@function	takes the json object and draws circles and lines for each
				assertion and singleton that exists in the arrays
	*/
	me.redraw = function(json){
		var assertions = json.assertions;
		var singletons = json.singletons;
	
		for ( var i = 0; i < assertions.length; i++ ) {
			var c1 = assertions[i].entity1[0];
			var c2 = assertions[i].entity2[0];
			var l = assertions[i].relationship[0];
			
			var cObj1 = getObject(me.circles, c1.class, 'class');
			var cObj2 = getObject(me.circles, c2.class, 'class');
			
			var cSvg1, cSvg2;
			if (cObj1 === null){
				cSvg1 = me.addCircle(c1.x, c1.y, c1.value, c1);
			} else {
				cSvg1 = d3.select(cObj1.html);
			}
			
			if (cObj2 === null){
				cSvg2 = me.addCircle(c2.x, c2.y, c2.value, c2);
			} else {
				cSvg2 = d3.select(cObj2.html);
			}
			
			if ( indexOfObj(me.lines, l.class, 'class') === -1){
				me.addLine(cSvg1, cSvg2, l.value, l);
			}
		}
		
		for (var i = 0; i < singletons.length; i++){
			var c = singletons[i].entity1[0];
			if ( getObject(me.circles, c.class,'class') === null ){
				me.addCircle(c.x, c.y, c.value, c);
			}
		}
	};
	
	/**
	@param		state 
	@function	adds state to the undo stack of me.pastStates
				if the stack grows above 10, removes the item at the front
	*/
	me.saveState = function(state){
		me.pastStates.push(state);
		
		if ( me.pastStates.length > 10 ) {
			me.pastStates.shift();
		}
	};
	
	/**
	@param		type either 'entity1', 'entity2' or 'both'
				obj the object version of the circle to alter
	@function	changes the node color to correspond to what kind of entity 
				it now is. if type is entity1 but obj is entity2 or type is 
				entity2 but obj is entity1, obj is now both, otherwise 
				it goes from me.aloneColor to entity1 or entity2 color
	*/
	me.alterNodeColor = function(type, obj){
		if (type === 'entity1'){
			if ( obj.color === me.aloneColor ) {
				obj.color = me.entity1Color;
			} else if ( obj.color !== me.entity1Color ) {
				obj.color = me.bothColor;
			}
		} else if ( type === 'entity2' ) {
			if ( obj.color === me.aloneColor ) {
				obj.color = me.entity2Color;
			} else if ( obj.color !== me.entity2Color ) {
				obj.color = me.bothColor;
			}
		}
	};
	
	//t_button callbacks
	/**
	@function	creates a new empty node-link-container, empties circles and 
				lines arrays, resets the element count and assigns null to 
				lastNodeClicked 
	*/
	me.resetCanvas = function(){
		d3.select('.node-link-container').remove();
		d3.select('.csvg').append('g').attr('class', 'node-link-container');
		me.target_event = { name: 'target event' };
		me.circles = [];
		me.lines = [];
		me.count = 0;		
		me.lastNodeClicked = null;
	};
	
	/**
	@function	takes the current state of the canvas and saves each assertion
				or singleton to /target_assertions/. if an assertion already 
				has an _id, it is simply updated in the database instead of
				being recreated
	*/
	me.saveTargetAssertions = function(){
		me.assertions = { assertions : [], singletons: [] };
		for (var i = 0; i < me.lines.length; i++){
			var tempUrl = assert_url;
			var line = me.lines[i];
			var cObj1 = null;
			var cObj2 = null;
			for ( var j = 0; j < me.circles.length; j++ ) {
				if ( me.circles[j].html === line.source ) {
					cObj1 = me.circles[j];
				}
				
				if(me.circles[j].html === line.target){
					cObj2 = me.circles[j];
				}
			}
			
			if ( cObj1 !== null && cObj2 !== null ){
				var entity1 = {
					name: "entity1",
					value: cObj1.d,
					x: parseInt(cObj1.x, 10),
					y: parseInt(cObj1.y, 10),
					color: cObj1.color,
					class: cObj1.class,
					group: cObj1.group
				};
				
				var relationship = {
					name: "relationship",
					value: line.d,
					color: 0,
					class: line.class
				};
				
				var entity2 = {
					name: "entity2",
					value: cObj2.d,
					x: parseInt(cObj2.x, 10),
					y: parseInt(cObj2.y, 10),
					color: cObj2.color,
					class: cObj2.class,
					group: cObj2.group
				};
							
				var postData = {
					name: cObj1.d + ' ' + line.d + ' ' + cObj2.d,
					description:"",
					entity1: [entity1],
					relationship: [relationship],
					entity2: [entity2]
				};
				
				//update if already exists in database
				if ( line.id !== undefined ){
					tempUrl += line.id;
				}
				
				me.assertions.assertions.push(postData);
				
				/*$.ajax({
					type: "POST",
					url: "../../../lib/post_relay.php",
					data: JSON.stringify({url: assert_url, data: postData}),
					success: function(){console.log('success');},
					error: function(){console.log('error');}
				});
				
				$.ajax({
					type: "POST",
					url: assert_url,
					dataType: 'application/json',
					data: postData,
					success: function(r){
						console.log(r);
					}
				});*/
			}
		}
				
		for ( var i = 0; i < me.circles.length; i++ ) {
			var cObj = me.circles[i];
			var tempUrl = assert_url;
			if ( me.isAlone(cObj) ) {
				var entity1 = {
					name: 'entity1',
					value: cObj.d,
					x: parseInt(cObj.x, 10),
					y: parseInt(cObj.y, 10),
					color: cObj.color,
					class: cObj.class,
					group: cObj.group		
				};
				
				var postData = {
					name: cObj.d,
					description:"",
					entity1: [entity1]
				};
				
				//update if already exists in database
				if ( cObj.id !== undefined ){
					tempUrl += cObj.id;
				}
				
				me.assertions.singletons.push(postData);
				/*$.ajax({
					type: "POST",
					url: "../../../lib/post_relay.php",
					data: JSON.stringify({url: assert_url, data: postData}),
					success: function(){console.log('success');},
					error: function(){console.log('error');}
				});
				
				$.ajax({
					type: "POST",
					url: assert_url,
					dataType: 'application/json',
					data: postData,
					success: function(r){
						console.log(r);
					}
				});*/
			}
		}
		me.saveState(JSON.stringify(me.assertions));
		//me.saveTargetEvent();
	};
	
	/**
	@function	if there exists a past saved state, reset the canvas and redraw
				based on that saved state, removing it from the stack
	*/
	me.undo = function(){
		if ( me.pastStates.length > 0 ) {
			me.resetCanvas();
			me.redraw(JSON.parse(me.pastStates.pop()));
		}
	};
	
	/**
	@function	removes all circles and lines that are colored selectColor
				then regroups and recolors the remainder
	*/
	me.deleteSelection = function(){
		var nodesToRemove = [];
		var linksToRemove = [];
		
		d3.selectAll('#canvas circle').each(function(){
			var c = d3.select(this);
			if(c.style('fill') === me.selectColor){
				nodesToRemove.push(this);
			}
		});
		
		for (var i = 0; i < nodesToRemove.length; i++){
			me.deleteItem(nodesToRemove[i]);
		}
		
		d3.selectAll('#canvas line').each(function(){
			var l = d3.select(this);
			if ( l.style('stroke') === me.selectColor ) {
				linksToRemove.push(this);
			}
		});
		
		for ( var i = 0; i < linksToRemove.length; i++ ) {
			me.deleteItem(linksToRemove[i]);
		}
	};
	
	/**
	@function	if labelsShown is false shows all labels for any element 
				in the canvas when the show all text button is clicked
				if labelsShown is true, it removes all labels from the canvas
	*/
	me.toggleLabels = function(){
		if ( !me.labelsShown ) {
			me.labelsShown = true;
			var x = 0, y = 0;
			d3.selectAll('#canvas circle').each(function(){
				var circle = d3.select(this);
				x = parseInt(circle.attr('cx'), 10) + 15;
				y = parseInt(circle.attr('cy'), 10) - 15;
				d3.select('#canvas svg').append('text')
					.attr('x', x).attr('y', y)
					.text(circle.attr('d'));
			});
			
			d3.selectAll('#canvas line').each(function(){
				var line = d3.select(this);
				x = ((parseInt(line.attr('x1'), 10) + parseInt(line.attr('x2'), 10)) / 2) + 15;
				y = ((parseInt(line.attr('y1'), 10) + parseInt(line.attr('y2'), 10)) / 2) - 15;
				d3.select('.csvg').append('text')
					.attr('x', x).attr('y', y)
					.text(line.attr('d'));
			});
		} else {
			d3.selectAll('#canvas text').remove();
			me.labelsShown = false;
		}
	};
	
	me.saveTargetEventToTitan = function(){
		$.ajax({
			type: 'POST', 
			url: buildNode(me.target_event),
			dataType: 'application/json',
			success: function(r){
				console.log(r);
			},
			error: function(e){
				var resp = JSON.parse(e.responseText);
				if (resp.message === undefined){
					me.target_event._titan_id = resp.results._id;
					
					me.saveCirclesToTitan(me.target_event._titan_id);
					setTimeout(function(){
						me.saveLinesToTitan();
					},2000);
					
				}
			}
		});
	};
	
	me.saveCirclesToTitan = function(m_id){
		me.circles.forEach(function(circle){
			$.ajax({
				type: 'POST', 
				url: buildNode(circle),
				dataType: 'application/json',
				success: function(r){
					console.log(r);
				},
				error: function(e){
					var resp = JSON.parse(e.responseText);
					if (resp.message === undefined){
						var cObj = me.circles[indexOfObj(me.circles, 
							resp.results.name,	'd')];
						cObj._titan_id = resp.results._id;
						
						var edge = {
							_label: 'metadata of',
							target_id: m_id,
							source_id: cObj._titan_id
						};
						$.ajax({
							type: 'POST',
							url: buildEdge(edge),
							dataType: 'application/json',
							success: function(r){ console.log(r); },
							error: function(e){ 
								console.log(JSON.parse(e.responseText)); 
							}
						});
					}
				}
			});			
		});
	};

	me.saveLinesToTitan = function(){
		me.lines.forEach(function(line){
			if ( line._titan_id === undefined ) {
				var cSvg1 = d3.select(line.source);
				var cSvg2 = d3.select(line.target);
				
				var cInd1 = indexOfObj(me.circles, cSvg1.attr('class'), 'class');
				var cInd2 = indexOfObj(me.circles, cSvg2.attr('class'), 'class');
				
				line.source_id = me.circles[cInd1]._titan_id;
				line.target_id = me.circles[cInd2]._titan_id;
				
				$.ajax({
					type: 'POST',
					url : buildEdge(line),
					dataType: 'application/json',
					success: function(r){
						console.log(r);
					},
					error: function(e){
						var resp = JSON.parse(e.responseText);
						console.log(resp);
						if (resp.message === undefined){
							var lObj = me.lines[indexOfObj(me.lines, 
								resp.results.class,	'class')];
							lObj._titan_id = JSON.parse(e.responseText).results._id;
							console.log(JSON.parse(e.responseText).results._id);
							
							d3.select('.draw-info')
								.style('opacity', 1)
								.text("Target event saved to Titan")
								.transition()
								.duration(5000)
								.style('opacity', 0);
							
							OWF.Eventing.publish('com.nextcentury.everest.target-event', 'target-event');
						}	
					}
				});
			}
		});
	};
	
	me.saveAssertionsToTitan = function(){
		me.saveCirclesToTitan(me.target_event._titan_id);
		setTimeout(me.saveLinesToTitan, 5000);
	};
};