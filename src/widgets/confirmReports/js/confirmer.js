Array.prototype.indexOfObj = function(value, attribute){
	for (var i = 0; i < this.length; i++){
		if (value.toLowerCase() === 
				this[i][attribute].toLowerCase()){
			return i;
		}
	}
	return -1;
};

var confirmer = function(){
	var me = this;
	var url = 'http://localhost:8081/';
	me.alpha_reports = [];
	me.assertions = [];
	me.target_events = [];
	me.target_assertions = [];
	me.circles = [];
	me.lines = [];
	
	me.maxX = -1;
	me.maxY = -1;
	
	me.width = 500;
	me.height = 500;
	
	me.svg_target = d3.select('.target-pattern')
		.append('svg')
		.attr('width', me.width)
		.attr('height', me.height);
	
	me.svg_asserts = d3.select('.asserts')
		.append('svg')
		.attr('width', me.width)
		.attr('height', me.height);

	me.createListeners = function(){
		d3.select('.confirm').on('click', function(){
		
		});
		
		d3.select('.patterns').on('change', function(){
			var elem = $(this)[0];
			var elem_id = elem.options[elem.selectedIndex].text;
			console.log(elem_id);
			me.getTargetAssertions(elem_id);
		});
		
		d3.select('.alphas').on('change', function(){
			var elem = $(this)[0];
			var elem_id = elem.options[elem.selectedIndex].text;
			for (var i = 0; i < me.alpha_reports.length; i++){
				if (me.alpha_reports[i]._id === elem_id){
					d3.selectAll('.alpha-info text').remove();
					d3.selectAll('.alpha-info br').remove();
					var info = d3.select('.alpha-info');
					var a = me.alpha_reports[i];
				
					info.append('text')
						.text('Source name: ' + a.source_name);
					info.append('br');
					info.append('text').text('Source id: ' + a.source_id);
					info.append('br');
					info.append('text').text('Created date: ' + a.message_date);
					info.append('br');
					info.append('text').text('Message: ' + a.message_body);
				}
			}
			me.getAssertions(elem_id);
		});
	};
	
	me.getAlphaReports = function(){
		$.ajax({
			url: url + 'alpha_report/?callback=?',
			async: false,
			success: function(result){
				me.alpha_reports = result;
			},
			dataType: 'json'
		});
		return data;
	};
	
	me.getAssertions = function(ar_id){
		$.getJSON(url +'assertion/?callback=?', function(asserts){
			me.assertions = asserts;
			var assertions = [];
			for (var i = 0; i < asserts.length; i++){
				if (asserts[i].alpha_report_id === ar_id){
					assertions.push(asserts[i]);
				}
			}
			
			me.svg_asserts.remove();
			me.svg_asserts = d3.select('.asserts')
				.append('svg')
				.attr('width', me.width)
				.attr('height', me.height);
			
			me.svg_asserts.append('g')
				.attr('class', 'node-link-container');
				
			me.svg_asserts.append('defs').append('marker')
				.attr('id', 'Triangle')
				.attr('refX', 0).attr('refY', 3)
				.attr('markerUnits', 'strokeWidth')
				.attr('markerWidth', 100)
				.attr('markerHeight', 100)
				.attr('orient', 'auto')
				.append('svg:path')
					.attr('d', 'M 0 0 L 6 3 L 0 6 z');
					
			if (assertions.length !== 0){			
				//display assertions
				var net = new network(me.svg_asserts, assertions, false);
				
				net.draw();
				net.draw({}, { entity1: "A", relationship: "E", entity2: "B" });
				net.draw({}, { entity1: "b", relationship: "e", entity2: "c" });
				net.draw({}, { entity1: "b", relationship: "e", entity2: "f" });
				net.draw({}, { entity1: "B", relationship: "E", entity2: "C" });
			} 
		});
	};
	
	me.redraw = function(json){		
		me.circles = [];
		me.lines = [];
		
		d3.select('.node-link-container').remove();
		me.svg_target.append('g')
			.attr('class', 'node-link-container');
				
		for (var i = 0; i < json.length; i++){
			if ( json[i].entity2[0] === undefined ) {
				var c = json[i].entity1[0];
				if ( me.circles.indexOfObj(c.value, 'd') === -1 ) {
					me.addCircle(c);
				}
			} else {
				var c1 = json[i].entity1[0];
				var c2 = json[i].entity2[0];
				var l = json[i].relationship[0];				
				
				var cInd1 = me.circles.indexOfObj(c1.value, 'd');
				var cInd2 = me.circles.indexOfObj(c2.value, 'd');
				
				if (cInd1 === -1){
					me.addCircle(c1);
					cInd1 = me.circles.length - 1;
				}
				
				if (cInd2 === -1){
					me.addCircle(c2);
					cInd2 = me.circles.length - 1;
				}
				
				if(me.lines.indexOfObj(l._id, '_id') === -1){
					var cSvg1 = d3.select(me.circles[cInd1].html);
					var cSvg2 = d3.select(me.circles[cInd2].html);
					me.addLine(cSvg1, cSvg2, l);
				}
			}
		}
	};
	
	me.getTargetEvents = function(){
		$.getJSON(url + 'target_event/?callback=?', function(events){
			if (events[0] !== undefined){
				me.target_events = events;
				for ( var i = 0; i < events.length; i++ ) {
					d3.select('.patterns')
						.append('option')
						.text(events[i]._id);
				}
				console.log(events);	
				me.getTargetAssertions(events[0]._id);
			}
		});
	};
	
	me.getTargetAssertions = function(event_id){
		var event;
		for ( var i = 0; i < me.target_events.length; i++){
			if ( me.target_events[i]._id === event_id ) {
				event = me.target_events[i];
			}
		}
		
		me.target_assertions = [];
		me.maxX = -1;
		me.maxY = -1;
		
		$.getJSON(url + 'target_assertion/?callback=?', function(asserts){
			for ( var i = 0; i < asserts.length; i++ ) {
				var a = asserts[i];
				
				if ( event.assertions.indexOf(a._id.toString()) !== -1 ) {
					me.target_assertions.push(a);
					
					me.maxX = Math.max(me.maxX, a.entity1[0].x);
					me.maxY = Math.max(me.maxY, a.entity1[0].y);
					
					if (a.entity2[0] !== undefined){
						me.maxX = Math.max(me.maxX, a.entity2[0].x);
						me.maxY = Math.max(me.maxY, a.entity2[0].y);
					}
				}
			}
			
			console.log(JSON.stringify(me.target_assertions));
			d3.selectAll('.target-info text').remove();
			d3.selectAll('.target-info br').remove();
			var info = d3.select('.target-info')
				.append('text').text("Name: " + event.name);
			info.append('br');
			info.append('text').text("Description: " + event.description);
			
			me.redraw(me.target_assertions);
		});
	};
	
	me.display = function(){
		$.getJSON(url + 'alpha_report/?callback=?', function(data){
			for (var i = 0; i < data.length; i++){
				d3.select('.alphas')
					.append('option')
					.text(data[i]._id);
			}
			
			me.alpha_reports = data;
		});
		
		setTimeout(function(){
			//grab an alpha report
			var ar = me.alpha_reports[0];
			
			//display alpha report
			d3.selectAll('.alpha-info text').remove();
			d3.selectAll('.alpha-info br').remove();
			var info = d3.select('.alpha-info');
		
			info.append('text')
				.text('Source name: ' + ar.source_name);
			info.append('br');
			info.append('text').text('Source id: ' + ar.source_id);
			info.append('br');
			info.append('text').text('Created date: ' + ar.message_date);
			info.append('br');
			info.append('text').text('Message: ' + ar.message_body);
			
			me.getAssertions(ar._id);
			me.getTargetEvents();
		}, 1000);
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
		var max = axis === 'x' ? me.width : me.height;
		
		if (newC < 0){	
			return 0;
		} else if (newC > max){
			return max;
		} else {
			return Math.floor(newC);
		}
	};
	
	me.addCircle = function(c){
		var circle = me.svg_target.append('circle')
			.attr('d', c.value).attr('class', c.class)
			.attr('cx', c.x * me.width / (me.maxX + 50))
			.attr('cy', c.y * me.height / (me.maxY + 50))
			.attr('r', 8)
			.style('fill', c.color)
			.on('mouseover', me.mouseover)
			.on('mouseout', me.mouseout);
		
		var cObj = me.simplify(circle);
		cObj.group = c.group;
		cObj.color = c.color;
		cObj._id = c._id;
		me.circles.push(cObj);
		
		return circle;
	};
	
	me.addLine = function(c1, c2, l){	
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
		var lineGroup = me.svg_target.insert('g', ':first-child');
		
		var line = lineGroup.append('line', ':first-child')
			.attr('class', l.class)
			.attr('d', l.value)
			.attr('x1', me.computeCoord(p1.x, 'x'))
			.attr('y1', me.computeCoord(p1.y, 'y'))
			.attr('x2', me.computeCoord(p2.x, 'x'))
			.attr('y2', me.computeCoord(p2.y, 'y'))
			.on('mouseover', me.mouseover)
			.on('mouseout', me.mouseout);

		var path = me.createArrow(line);
		
		if(me.lines.indexOfObj(l._id, '_id') === -1){
			var lObj = {
				_id: l._id,
				class: line.attr('class'),
				html: line[0][0],
				d: line.attr('d'),
				source: c1[0][0],
				target: c2[0][0]
			};
			
			me.lines.push(lObj);
		}
	};
	
	me.mouseover = function(){
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
		me.svg_target.select('.node-link-container')
			.append('text')
			.attr('x', x).attr('y', y)
			.text(item.attr('d'));
	};
	
	me.mouseout = function(){
		me.svg_target.selectAll('text').remove();
	};
	
	me.createArrow = function(line){
		var path = d3.select(line[0][0].parentNode).insert('path', ':first-child')
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
};