describe('To test the target event definition widget', function(){
	
	d3.select('body').append('div').attr('class', 'canvas');
	d3.select('body').append('div').attr('class', 'toolbar')
		.append('svg').attr('width', 500).attr('height', 500);
	d3.select('body').append('div').attr('class', 'rel');
	d3.select('body').append('div').attr('class', 'entity1Color')
		.style('background-color', '#333399');
	d3.select('body').append('div').attr('class', 'entity2Color')
		.style('background-color', '#339966');
	d3.select('body').append('div').attr('class', 'bothColor')
		.style('background-color', '#9900cc');
	
	var test_draw = new draw();
	describe('to see if test_draw attributes actually exist', function(){	
		expect(test_draw.canvasW).toEqual(500);
		expect(test_draw.circles).toEqual([]);
	});
	
	describe('to test the utility functions', function(){
				
		it('the createCancelClickers function', function(){
			spyOn(d3, 'select').andCallThrough();
			test_draw.createCancelClickers();
			expect(d3.select.callCount).toEqual(3);
		});
	
		it('specifically the Array.prototype.indexOfObj function', function(){
			d3.selectAll('svg').remove();
			var svg = d3.select('.canvas').append('svg').attr('class', 'svg');
			svg.append('circle')
				.attr('class', 'zero');
			
			svg.append('circle')
				.attr('class', 'one');
			
			var a = d3.select('.zero');
			var b = d3.select('.one');
				
			var array = [{class:'zero'}];
			
			expect(array.indexOfObj(a)).toEqual(0);
			expect(array.indexOfObj(b)).toEqual(-1);
		});
		
		it('the isAlone function', function(){
			test_draw.lines = [{source: 'a', target: 'b'}, {source: 'c', target: 'd'}];
			
			expect(test_draw.isAlone({html: 'a'})).toEqual(false);
			expect(test_draw.isAlone({html: 'b'})).toEqual(false);
			expect(test_draw.isAlone({html: 'c'})).toEqual(false);
			expect(test_draw.isAlone({html: 'd'})).toEqual(false);
			expect(test_draw.isAlone({html: 'e'})).toEqual(true);
		});
		
		it('the simplify function', function(){
			
		});
		
		it('the extractCircles function', function(){
			test_draw.circles = [{html:'a', group: 1}, {html:'b', group:1},
				{html:'d', group:3}, {html:'e', group:5}, {html:'c', group:3}];
			
			var arr = test_draw.extractCircles(0);
			expect(arr.length).toEqual(0);
			
			arr = test_draw.extractCircles(1);
			expect(arr.length).toEqual(2);
		});
		
		it('the computeCoord function', function(){
			spyOn(Math, 'floor').andCallThrough();
			
			expect(test_draw.computeCoord(30, 'x')).toEqual(30);
			expect(test_draw.computeCoord(40, 'y')).toEqual(40);
			expect(test_draw.computeCoord(1.929843975, 'x')).toEqual(1);
			expect(test_draw.computeCoord(103.123984775, 'y')).toEqual(103);
			expect(test_draw.computeCoord(3000, 'x')).toEqual(test_draw.canvasW);
			expect(test_draw.computeCoord(3000, 'y')).toEqual(test_draw.canvasH);
			expect(test_draw.computeCoord(-30, 'x')).toEqual(0);
			expect(test_draw.computeCoord(-9834, 'y')).toEqual(0);
			
			expect(Math.floor).toHaveBeenCalled();
		});
	});
	
	describe('specifically the createCanvas function', function(){
		it('for proper method call logic ', function(){
			d3.selectAll('svg').remove();
			spyOn(d3, 'select').andCallThrough();
			
			test_draw.createCanvas();
			expect(d3.select).toHaveBeenCalledWith('.canvas');
		});
		
		it('for proper setting of style attributes', function(){
			d3.selectAll('svg').remove();
			test_draw.createCanvas();
			
			var w = d3.select('.canvas svg').attr('width');
			expect(parseInt(w)).toEqual(500); 
			
			var r = d3.select('.canvas svg rect');
			expect(r.attr('class')).toEqual('background');
			expect(parseInt(r.attr('x'))).toEqual(0);
			expect(parseInt(r.attr('y'))).toEqual(0);
			expect(parseInt(r.attr('width'))).toEqual(500);
			expect(parseInt(r.attr('height'))).toEqual(500);
			expect(parseInt(r.style('opacity'))).toEqual(0);
			
			var g = d3.select('.canvas svg g');
			expect(g.attr('class')).toEqual('node-link-container');
			
			var m = d3.select('marker');
			expect(m.attr('id')).toEqual('Triangle');
			expect(parseInt(m.attr('refX'))).toEqual(0);
			expect(parseInt(m.attr('refY'))).toEqual(3);
		});
	});

	describe('the circle functions' , function(){
		it('the createCircle function', function(){
			spyOn(d3, 'select').andCallThrough();
			d3.selectAll('circle').remove();
			var c1 = test_draw.createCircle(50, 100, 'hi');
			
			expect(d3.select).toHaveBeenCalledWith('.node-link-container');
			expect(c1.attr('d')).toEqual('hi');
			expect(parseInt(c1.attr('cx'))).toEqual(50);
			expect(parseInt(c1.attr('cy'))).toEqual(100);
			expect(parseInt(c1.attr('r'))).toEqual(test_draw.radius);
			expect(c1.style('fill')).toEqual('#ffffff');
			
			test_draw.createCircle(112, 135, 'hiya');
			var cs = d3.selectAll('circle')[0];
			expect(cs.length).toEqual(2);
		});
		
		it('the appendCircle function', function(){
			var mouse_event = [49, 20];
			spyOn(d3, 'select').andCallThrough();
			test_draw.appendCircle(mouse_event);
			
			expect(d3.select).toHaveBeenCalledWith('.ent-submit');
		});
	});
	
	//these are all used as callback in draw.js... (with this keyword)
	describe('the movement functions', function(){
		it('the move function in mover_hold mode', function(){
			test_draw.mode = 'mover_hold';
			
			spyOn(test_draw.circles, 'indexOfObj').andCallThrough();
			spyOn(test_draw, 'extractCircles').andCallThrough();
			spyOn(test_draw, 'dragGroup').andCallThrough();
		});
		
		it('the move function in select_hold mode', function(){
			test_draw.mode = 'mover_hold';
			
			spyOn(test_draw.circles, 'indexOfObj').andCallThrough();
			spyOn(test_draw, 'extractCircles').andCallThrough();
			spyOn(test_draw, 'dragGroup').andCallThrough();
		});
		
		it('the dragGroup function', function(){
		
		});
		
		it('the dragstart function', function(){
		
		});
		
		it('the drag function', function(){
		
		});
		
		it('the dragend function', function(){
		
		});
	});	
	
	describe('the clicking functions', function(){
		it('the nodeClick function in rel_hold mode', function(){
		
		});
		
		it('the nodeClick function in delete_hold mode', function(){
		
		});
		
		it('the doubleClick function in null mode', function(){
		
		});
	});	
	
	describe('the other event functions', function(){
		it('the mouseover function in anything other than label_hold mode', function(){
		
		});
		
		it('the mouseout function in anything other than label_hold mode', function(){
		
		});
	});
	
	describe('the deletion functions', function(){
		//only letting me call one set of this atm, dk why
		xit('the deleteNode function, method calls', function(){
			test_draw.circles = [];
			test_draw.lines = [];
			
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(d3, 'select').andCallThrough();
			spyOn(test_draw, 'extractCircles').andCallThrough();
			spyOn(test_draw, 'separateGroups').andCallThrough();
			//spyOn(window, 'indexOfObj').andCallThrough();
			
			var c11 = test_draw.createCircle(50, 100, 'hi');
			c11 = test_draw.simplify(c11);
			c11.group = 0;
			c11.color = '#ffffff';
			test_draw.circles.push(c11);
			
			var c21 = test_draw.createCircle(450, 100, 'bye');
			c21 = test_draw.simplify(c21);
			c21.group = 0;
			c21.color = '#ffffff';
			test_draw.circles.push(c21);
			
			var line = d3.select('.canvas svg').append('line')
				.attr('x1', 50).attr('y1', 100)
				.attr('x2', 450).attr('y2', 100)
				.attr('class', 0)
				.attr('d', 'between');
			
			test_draw.lines = [{ 
				source: c11.html, 
				target: c21.html,
				html: line[0][0],
				d: "between",
				class: '0'
			}];
				
			test_draw.deleteNode(c11.html);
			
			expect(d3.selectAll).toHaveBeenCalledWith('.canvas line');
			expect(d3.select).toHaveBeenCalled();
			expect(test_draw.extractCircles).toHaveBeenCalledWith(0);
			expect(test_draw.separateGroups).toHaveBeenCalled();
			//expect(indexOfObj).toHaveBeenCalledWith(d3.select(c1.html));
			expect(d3.selectAll.callCount).toEqual(2);
		});
		
		it('the deleteNode function', function(){
			test_draw.circles = [];
			test_draw.lines = [];
			
			var c = [];
			var l = [];
			for (var i = 0; i < 4; i++){
				var temp = test_draw.createCircle(i, i, 'a');
				test_draw.count++;
				test_draw.circleCount++;
				temp = test_draw.simplify(temp);
				temp.group = 0;
				test_draw.circles.push(temp);
				c.push(temp);
			}
			
			c[0].color = entity1Color;
			d3.select(c[0].html).style('fill', entity1Color);
			c[1].color = bothColor;
			d3.select(c[1].html).style('fill', bothColor);
			c[2].color = bothColor;
			d3.select(c[2].html).style('fill', bothColor);
			c[3].color = entity2Color;
			d3.select(c[3].html).style('fill', entity2Color);
			
			for (var i = 0; i < 3; i++){
				var g = d3.select('.canvas svg')
					.append('g');
					
				var temp = g.append('line')
					.attr('x1', i).attr('y1', i)
					.attr('x2', i+1).attr('y2', i+1)
					.attr('class', i)
					.attr('d', i);
					
				l.push(temp);
				
				test_draw.lines.push({
					source: c[i].html,
					target: c[i+1].html,
					html: temp[0][0],
					d: i.toString() ,
					class: i.toString()
				});
			}
			
			test_draw.deleteNode(c[1].html);
			expect(test_draw.circles.length).toEqual(3);
			expect(test_draw.lines.length).toEqual(1);
			
			var cT1 = test_draw.circles[0];
			expect(cT1.color).toEqual('#ffffff');
			expect(d3.select(cT1.html).style('fill')).toEqual('#ffffff');
			
			var cT2 = test_draw.circles[1];
			expect(cT2.color).toEqual(entity1Color);
			expect(d3.select(cT2.html).style('fill')).toEqual(entity1Color);
			
			var cT3 = test_draw.circles[2];
			expect(cT3.color).toEqual(entity2Color);
			expect(d3.select(cT3.html).style('fill')).toEqual(entity2Color);
			
			expect(cT1.group).not.toEqual(cT2.group);
			expect(cT2.group).toEqual(cT3.group);
			
			test_draw.deleteNode(c[2].html);
			expect(test_draw.circles.length).toEqual(2);
			expect(test_draw.lines.length).toEqual(0);
			
			var cT1 = test_draw.circles[0];
			expect(cT1.color).toEqual('#ffffff');
			expect(d3.select(cT1.html).style('fill')).toEqual('#ffffff');
			
			var cT2 = test_draw.circles[1];
			expect(cT2.color).toEqual('#ffffff');
			expect(d3.select(cT2.html).style('fill')).toEqual('#ffffff');
		});
	});
	
	describe('the createArrow function', function(){
		it('for proper method call logic', function(){
		
			var l = d3.select('.canvas svg').append('line')
				.attr('x1', 0).attr('y1', 1)
				.attr('x2', 2).attr('y2', 3);
				
			spyOn(d3, 'select').andCallThrough();
			spyOn(window, 'parseInt').andCallThrough();
			
			test_draw.createArrow(l);
			
			expect(d3.select).toHaveBeenCalled();
			expect(parseInt).toHaveBeenCalled();
		});
		
		it('for proper resulting values', function(){
			var l = d3.select('.canvas svg').append('g')
				.append('line')
				.attr('x1', 0).attr('y1', 1)
				.attr('x2', 2).attr('y2', 3);
		
			var p = test_draw.createArrow(l);
			
			expect(p.attr('class')).toEqual('arrow');
			expect(p[0][0].parentNode.localName).toEqual('g');
			expect(p.attr('marker-mid')).toEqual('url(#Triangle)');
			expect(p.attr('d')).toEqual('M 0 1 L 1 2 L 2 3');
		});
	});
	
	describe('the separateGroups function', function(){
		it('for proper method call logic', function(){
			
		});
	});
});