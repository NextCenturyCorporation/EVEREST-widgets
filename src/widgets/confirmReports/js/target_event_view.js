var target_event_view = function(svg){
	var me = this;
	
	me.svg = svg;
	me.width = 500;
	me.height = 500;
	
	me.circles = [];
	me.lines = [];
	
	me.maxX, me.maxY;
	
	me.draw = function(json, x, y){	
		me.maxX = x;
		me.maxY = y;	
		me.circles = [];
		me.lines = [];
		
		me.svg.remove();
		me.svg = d3.select('.target-pattern')
			.append('svg')
			.attr('width', me.width)
			.attr('height', me.height);
			
		me.svg.append('g').attr('class', 'node-link-container');
				
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
		var circle = me.svg.select('.node-link-container')
			.append('circle')
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
		var p1 = {
			x:parseInt(c1.attr('cx'), 10),
			y:parseInt(c1.attr('cy'), 10)
		};
		
		var p2 = {
			x:parseInt(c2.attr('cx'), 10),
			y:parseInt(c2.attr('cy'), 10)
		};
	
		var lineGroup = me.svg.select('.node-link-container')
			.insert('g', ':first-child');
		
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
		
		if(this.localName === 'circle'){
			x = parseInt(item.attr('cx'), 10) + 15;
			y = parseInt(item.attr('cy'), 10) - 15;
		
			d3.select(this).transition()
				.duration(750).attr("r", 16);
		} else if (this.localName === 'line'){
			x = ((parseInt(item.attr('x1'), 10) + parseInt(item.attr('x2'), 10)) / 2) + 15;
			y = ((parseInt(item.attr('y1'), 10) + parseInt(item.attr('y2'), 10)) / 2) - 15;
		} 
		
		me.svg.select('.node-link-container')
			.append('text')
			.attr('x', x).attr('y', y)
			.text(item.attr('d'));
			
	};
	
	me.mouseout = function(){
		me.svg.selectAll('text').remove();
		if(this.localName === 'circle'){
			d3.select(this).transition()
				.duration(750).attr("r", 8);
		}
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