describe('To test the target event definition widget', function(){
	var test_draw = new draw();
	d3.select('body').append('div').attr('class', 'canvas');
	d3.select('body').append('div').attr('class', 'toolbar');
	d3.select('body').append('div').attr('class', 'rel');
	
	describe('to see if test_draw attributes actually exist', function(){	
		expect(test_draw.canvasW).toEqual(500);
		expect(test_draw.circles).toEqual([]);
		expect(test_draw.num_tools).toEqual(0);
	});
	
	describe('to test the utility functions', function(){
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
	
	describe('the toolbar set up functions', function(){
		it('the createSelection function', function(){					
			expect(test_draw.num_tools).toEqual(0);
			d3.selectAll('svg').remove();
			var svg = d3.select('.toolbar').append('svg').attr('class', 'svg');
			
			var sel = test_draw.createSelection(svg, 'test_hold');
			var rect = sel.select('rect');
			expect(test_draw.num_tools).toEqual(1);
			expect(sel.attr('class')).toEqual('test_hold');
			expect(parseInt(rect.attr('x'))).toEqual(test_draw.toolC.x - test_draw.radius - 3);
			expect(parseInt(rect.attr('y'))).toEqual(25 - test_draw.radius - 3);
			expect(parseInt(rect.attr('width'))).toEqual(2*(test_draw.radius + 3));
			expect(parseInt(rect.attr('height'))).toEqual(2*(test_draw.radius + 3));
			
			test_draw.createSelection(svg, 'test_hold1');
			test_draw.createSelection(svg, 'test_hold2');
			
			var gs = d3.selectAll('g')[0];
			expect(gs.length).toEqual(3);
		});
		
		xit('the toggleSelection function', function(){
			spyOn(d3, 'select').andCallThrough();
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(test_draw, 'toggleSelection').andCallThrough();
			spyOn(test_draw, 'addAllLabels').andCallThrough();
			spyOn(test_draw, 'resetColors').andCallThrough();
			
			d3.selectAll('svg').remove();
			var svg = d3.select('.toolbar').append('svg').attr('class', 'svg');
			test_draw.createToolbar();
			
			test_draw.mode = 'label_hold';
			$('.label_hold').trigger('click');
			
			expect(test_draw.addAllLabels).toHaveBeenCalled();
		});
		
		it('the createCancelClickers function', function(){
			spyOn(d3, 'select').andCallThrough();
			test_draw.createCancelClickers();
			expect(d3.select.callCount).toEqual(3);
		});
		
		it('the createToolbar function ', function(){
			d3.selectAll('svg').remove();
			var svg = d3.select('.toolbar').append('svg').attr('class', 'svg');
			spyOn(d3, 'select').andCallThrough();
			spyOn(test_draw, 'createSelection').andCallThrough();
						
			test_draw.createToolbar();
			
			expect(d3.select).toHaveBeenCalledWith('.toolbar');
			expect(d3.select).toHaveBeenCalledWith('body');
			expect(test_draw.createSelection).toHaveBeenCalled();
			expect(test_draw.createSelection.callCount).toEqual(7);
			
			var gs = d3.selectAll('g')[0];
			expect(gs.length).toEqual(7);
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
		it('the deleteNode function', function(){
			test_draw.circles = [];
			test_draw.lines = [];
			
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(d3, 'select').andCallThrough();
			spyOn(test_draw, 'extractCircles').andCallThrough();
			spyOn(test_draw, 'separateGroups').andCallThrough();
			//spyOn(window, 'indexOfObj').andCallThrough();
			
			var c1 = test_draw.createCircle(50, 100, 'hi');
			c1 = test_draw.simplify(c1);
			c1.group = 0;
			c1.color = '#ffffff';
			test_draw.circles.push(c1);
			
			var c2 = test_draw.createCircle(450, 100, 'bye');
			c2 = test_draw.simplify(c2);
			c2.group = 0;
			c2.color = '#ffffff';
			test_draw.circles.push(c2);
			
			var line = d3.select('.canvas svg').append('line')
				.attr('x1', 50).attr('y1', 100)
				.attr('x2', 450).attr('y2', 100)
				.attr('class', 0)
				.attr('d', 'between');
			
			test_draw.lines = [{ 
				source: c1.html, 
				target: c2.html,
				html: line[0][0],
				d: "between",
				class: '0'
			}];
				
			test_draw.deleteNode(c1.html);
			
			expect(d3.selectAll).toHaveBeenCalledWith('.canvas line');
			expect(d3.select).toHaveBeenCalled();
			expect(test_draw.extractCircles).toHaveBeenCalledWith(0);
			expect(test_draw.separateGroups).toHaveBeenCalled();
			//expect(indexOfObj).toHaveBeenCalledWith(d3.select(c1.html));
			expect(d3.selectAll.callCount).toEqual(2);
			
			expect(test_draw.lines.length).toEqual(0);
			expect(test_draw.circles.length).toEqual(1);
			
		});
		
		it('the deleteLink function', function(){
			spyOn(d3, 'select').andCallThrough();
			spyOn(test_draw, 'separateGroups').andCallThrough();
		
			test_draw.circles = [];
			test_draw.lines = [];
			var c1 = test_draw.createCircle(50, 100, 'hi');
			c1 = test_draw.simplify(c1);
			c1.group = 0;
			c1.color = '#ffffff';
			test_draw.circles.push(c1);
			
			var c2 = test_draw.createCircle(450, 100, 'bye');
			c2 = test_draw.simplify(c2);
			c2.group = 0;
			c2.color = '#ffffff';
			test_draw.circles.push(c2);
			
			var line = d3.select('.canvas svg').append('line')
				.attr('x1', 50).attr('y1', 100)
				.attr('x2', 450).attr('y2', 100)
				.attr('class', 0)
				.attr('d', 'between');
			
			test_draw.lines = [{ 
				source: c1.html, 
				target: c2.html,
				html: line[0][0],
				d: "between",
				class: '0'
			}];
			
			test_draw.deleteLink(line[0][0]);
			
			expect(test_draw.lines.length).toEqual(0);
			expect(test_draw.circles[0].group).toEqual(0);
			expect(test_draw.circles[1].group).not.toEqual(0);
			
			expect(d3.select).toHaveBeenCalled();
			expect(test_draw.separateGroups).toHaveBeenCalled();
		});
	});
	
	describe('', function(){
	
	});
});