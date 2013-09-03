describe('To test the target event definition widget', function(){
	var body = d3.select('body');
	body.append('div').attr('class', 'toolbar_modes')
		.append('svg').attr('width', 40).attr('height', 500);
	body.append('div').attr('class', 'canvas')
		.append('svg').attr('class', 'csvg');
	body.append('div').attr('class', 'toolbar_buttons')
		.append('svg').attr('width', 40).attr('height', 500);
	var forms = body.append('div').attr('class', 'forms');
	var ent1 = forms.append('div').attr('class', 'ent1-form');
	ent1.append('input').attr('class', 'ent1');
	ent1.append('button').attr('class', 'ent-submit');
	ent1.append('button').attr('class', 'ent-cancel');
	
	var rel = forms.append('div').attr('class', 'rel-form');
	rel.append('input').attr('class', 'rel-only');
	rel.append('button').attr('class', 'rel-submit');
	rel.append('button').attr('class', 'rel-cancel');
	
	var ent2 = forms.append('div').attr('class', 'rel-ent2-form');
	ent2.append('input').attr('class', 'relate');
	ent2.append('input').attr('class', 'ent2');
	ent2.append('button').attr('class', 'rel-ent-submit');
	ent2.append('button').attr('class', 'rel-ent-cancel');
		
	d3.select('body').append('div').attr('class', 'entity1Color')
		.style('background-color', '#333399');
	d3.select('body').append('div').attr('class', 'entity2Color')
		.style('background-color', '#339966');
	d3.select('body').append('div').attr('class', 'bothColor')
		.style('background-color', '#9900cc');
	
	var test_draw = new draw();
	test_draw.setUpToolbars();
	var tool1 = d3.select('.toolbar_modes');
	var tool2 = d3.select('.toolbar_buttons');
	
	var clickEvt = document.createEvent('Event');
	clickEvt.initEvent('click', true, false);
	
	var dblClickEvt = document.createEvent('Event');
	dblClickEvt.initEvent('dblclick', true, false);
	
	describe('to see if test_draw attributes actually exist', function(){	
		it('', function(){
			expect(test_draw.canvasW).toEqual(0);
			expect(test_draw.circles).toEqual([]);
			expect(test_draw.entity1Color).toEqual('#333399');
			expect(test_draw.entity2Color).toEqual('#339966');
			expect(test_draw.bothColor).toEqual('#9900cc');
		});
	});
	
	describe('to test the utility functions outside of draw element', function(){
		it('the getHexString function', function(){
			spyOn(d3, 'select').andCallThrough();
			
			var c = getHexString('.entity1Color');
			
			expect(d3.select).toHaveBeenCalledWith('.entity1Color');
			expect(c).toEqual('#333399');
			
			var d = getHexString('.hi');
			expect(d).toEqual('#ffffff');
		});
		
		it('specifically the Array.prototype.indexOfObj function', function(){				
			var array = [{class:'zero'}];
			expect(array.indexOfObj('zero', 'class')).toEqual(0);
			expect(array.indexOfObj('one', 'class')).toEqual(-1);
		});
		
		it('the Array.prototype.getAllIndicies function', function(){				
			var array = [{class: 'zero'}, {class: 'one'}, {class: 'ZERO'}];
			expect(array.getAllIndicies('zero', 'class').length).toEqual(2);
			expect(array.getAllIndicies('one', 'class').length).toEqual(1);
		});
	});
	
	describe('to test the setUpToolbars function', function(){
		it('', function(){
			test_draw.setUpToolbars();
			expect(d3.select('.toolbar_modes')[0][0]).not.toEqual(null);
			expect(d3.select('.toolbar_buttons')[0][0]).not.toEqual(null);
			expect(d3.select('.node_hold_fake')[0][0]).toEqual(null);
			expect(d3.select('.node_hold')[0][0]).not.toEqual(null);
			expect(d3.select('.rel_hold')[0][0]).not.toEqual(null);
			expect(d3.select('.mover_hold')[0][0]).not.toEqual(null);
			expect(d3.select('.delete_hold')[0][0]).not.toEqual(null);
			expect(d3.select('.select_hold')[0][0]).not.toEqual(null);
			expect(d3.select('.resetB')[0][0]).not.toEqual(null);
			expect(d3.select('.submitB')[0][0]).not.toEqual(null);
			expect(d3.select('.undoB')[0][0]).not.toEqual(null);
			expect(d3.select('.deleteB')[0][0]).not.toEqual(null);
			expect(d3.select('.labelB')[0][0]).not.toEqual(null);
		});
	});
	
	describe('to test the utility functions', function(){
		it('the simplify function', function(){
			var svg = d3.select('.csvg');
			var cSvg = svg.append('circle')
				.attr('class', 'test_one')
				.attr('d', 'simplify')
				.attr('cx', 4).attr('cy', 5)
				.attr('r', 8);
				
			var cObj = test_draw.simplify(cSvg);
			expect(cObj.class).toEqual('test_one');
			expect(cObj.html).toEqual(cSvg[0][0]);
			expect(cObj.d).toEqual('simplify');
			expect(cObj.x).toEqual('4');
			expect(cObj.y).toEqual('5');
			expect(cObj.r).toEqual('8');
		});	
		
		it('the isAlone function', function(){
			test_draw.lines = [{source: 'a', target: 'b'}, {source: 'c', target: 'd'}];
			
			expect(test_draw.isAlone({html: 'a'})).toEqual(false);
			expect(test_draw.isAlone({html: 'b'})).toEqual(false);
			expect(test_draw.isAlone({html: 'c'})).toEqual(false);
			expect(test_draw.isAlone({html: 'd'})).toEqual(false);
			expect(test_draw.isAlone({html: 'e'})).toEqual(true);
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
			
			test_draw.createCanvas();
			
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
		
		it('the createCancelClickers function', function(){
			spyOn(d3, 'select').andCallThrough();
			test_draw.createCancelClickers();
			expect(d3.select.callCount).toEqual(3);
		});
		
		it('the toggleLabels function', function(){
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(d3, 'select').andCallThrough();
			d3.selectAll('circle').remove();
			d3.selectAll('line').remove();
			test_draw.toggleLabels();
			
			expect(d3.selectAll).toHaveBeenCalledWith('.canvas circle');
			expect(d3.selectAll).toHaveBeenCalledWith('.canvas line');
			expect(d3.select).not.toHaveBeenCalledWith('.canvas svg');
			
			d3.select('.canvas svg').append('g')
				.append('line')
					.attr('x1', 0).attr('y1', 1)
					.attr('x2', 0).attr('y2', 3)
					.attr('d', 'hello');
					
			d3.select('.canvas svg').append('circle')
				.attr('cx', 0).attr('cy', 0)
				.attr('d', 'goodbye');
				
			test_draw.toggleLabels();
			expect(d3.select).toHaveBeenCalledWith('.canvas svg');
			
		});
	});
	
	describe('specifically the createCanvas function', function(){
		it('for proper method call logic ', function(){
			d3.select('.csvg').remove();
			spyOn(d3, 'select').andCallThrough();
			
			test_draw.createCanvas();
			expect(d3.select).toHaveBeenCalledWith('.canvas');
		});
		
		it('for proper setting of style attributes', function(){
			d3.selectAll('.csvg').remove();
			test_draw.createCanvas();
			
			var r = d3.select('.csvg rect');
			expect(r.attr('class')).toEqual('background');
			expect(parseInt(r.attr('x'))).toEqual(0);
			expect(parseInt(r.attr('y'))).toEqual(0);
			expect(parseInt(r.style('opacity'))).toEqual(0);
			
			var g = d3.select('.csvg g');
			expect(g.attr('class')).toEqual('node-link-container');
			
			var m = d3.select('marker');
			expect(m.attr('id')).toEqual('Triangle');
			expect(parseInt(m.attr('refX'))).toEqual(0);
			expect(parseInt(m.attr('refY'))).toEqual(3);
		});
	});

	describe('the circle functions' , function(){
		it('the addCircle function', function(){
			spyOn(d3, 'select').andCallThrough();
			d3.selectAll('circle').remove();
			var c1 = test_draw.addCircle(50, 100, 'hi');
			
			expect(d3.select).toHaveBeenCalledWith('.node-link-container');
			expect(c1.attr('d')).toEqual('hi');
			expect(parseInt(c1.attr('cx'))).toEqual(50);
			expect(parseInt(c1.attr('cy'))).toEqual(100);
			expect(parseInt(c1.attr('r'))).toEqual(test_draw.radius);
			expect(c1.style('fill')).toEqual('#ffffff');
			
			test_draw.addCircle(112, 135, 'hiya');
			var cs = d3.selectAll('circle')[0];
			expect(cs.length).toEqual(2);
		});
		
		it('the createCircle function', function(){
			spyOn(d3, 'select').andCallThrough();
			var s1 = spyOn(test_draw.circles, 'indexOfObj').andCallThrough();
			spyOn(test_draw, 'addCircle').andCallThrough();
			spyOn(window, '$').andCallThrough();
			
			test_draw.circles = [];
			test_draw.createCircle([49, 20]);
			
			expect(d3.select).toHaveBeenCalledWith('.ent-submit');
			expect($).toHaveBeenCalledWith('.ent1-form');
			expect($).toHaveBeenCalledWith('.ent1');
			expect($).toHaveBeenCalledWith('.canvas');
			$('.ent1').val('lady');
			
			document.getElementsByClassName('ent-submit')[0].dispatchEvent(clickEvt);
			expect(test_draw.addCircle).toHaveBeenCalledWith(49, 20, 'lady');
			
			$('.ent1').val('lady');
			test_draw.createCircle([100, 200]);
			document.getElementsByClassName('ent-submit')[0].dispatchEvent(clickEvt);
			expect(test_draw.addCircle).not.toHaveBeenCalledWith(100, 200, 'lady');
		});
	});
	
	//these are all used as callback in draw.js... (with this keyword)
	describe('the movement functions', function(){
		it('the move function in mover_hold mode', function(){
			test_draw.tool_mode.setMode('mover_hold');
			
			spyOn(test_draw.circles, 'indexOfObj').andCallThrough();
			spyOn(test_draw, 'extractCircles').andCallThrough();
			spyOn(test_draw, 'dragGroup').andCallThrough();
			
			
		});
		
		it('the move function in select_hold mode', function(){
			test_draw.tool_mode.setMode('select_hold');
			
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
		describe('the nodeClick function', function(){
			beforeEach(function(){
				test_draw.tool_mode.setMode('rel_hold');
				test_draw.circles = [];
				test_draw.lines = [];
				test_draw.lastNodeClicked = null;
				
				spyOn(window, '$').andCallThrough();
				spyOn(window, 'alert').andCallThrough();
				
				spyOn(d3, 'select').andCallThrough();
				
				spyOn(test_draw, 'alterNodeColor').andCallThrough();
				spyOn(test_draw, 'extractCircles').andCallThrough();
				spyOn(test_draw, 'addLine').andCallThrough();
				spyOn(test_draw, 'deleteNode').andCallThrough();
				spyOn(test_draw.circles, 'indexOfObj').andCallThrough();
				spyOn(test_draw.lines, 'getAllIndicies').andCallThrough();
				
			});
			
			describe('in rel_hold mode', function(){
				it ('for proper method calling', function(){
					var aSvg = test_draw.addCircle(50, 50, 'rel_circle');
					var bSvg = test_draw.addCircle(100, 100, 'other');
					
					var aObj = test_draw.circles[0];
					var bObj = test_draw.circles[1];
					document.getElementsByClassName(aObj.class)[0]
						.dispatchEvent(clickEvt);
						
					expect(test_draw.lastNodeClicked).toEqual(aObj.html);
					
					document.getElementsByClassName(bObj.class)[0]
						.dispatchEvent(clickEvt);
				});
				
				it('for proper return values, with proper input', function(){
					var aSvg = test_draw.addCircle(50, 50, 'rs');
					var bSvg = test_draw.addCircle(100, 100, 'other');
					
					var aObj = test_draw.circles[0];
					var bObj = test_draw.circles[1];
					var origGroup = bObj.group;
					document.getElementsByClassName(aObj.class)[0]
						.dispatchEvent(clickEvt);
						
					expect(test_draw.lastNodeClicked).toEqual(aObj.html);
					
					document.getElementsByClassName(bObj.class)[0]
						.dispatchEvent(clickEvt);
						
					expect($).toHaveBeenCalledWith('.rel-form');
					expect($).toHaveBeenCalledWith('.canvas');
					expect($).toHaveBeenCalledWith('.rel-only');
					expect(d3.select).toHaveBeenCalledWith('.rel-submit');
					
					$('.rel-only').val('bacon');
					document.getElementsByClassName('rel-submit')[0]
						.dispatchEvent(clickEvt);
						
					expect(alert).not.toHaveBeenCalled();
					expect(d3.select).toHaveBeenCalledWith(aObj.html);
					expect(d3.select).toHaveBeenCalledWith(bObj.html);
					
					expect(test_draw.alterNodeColor).toHaveBeenCalledWith('entity1', aObj);
					expect(test_draw.alterNodeColor).toHaveBeenCalledWith('entity2', bObj);
					expect(aSvg.style('fill')).toEqual(entity1Color);
					expect(bSvg.style('fill')).toEqual(entity2Color);
					
					expect(test_draw.extractCircles).toHaveBeenCalledWith(origGroup);
					expect(test_draw.lines.getAllIndicies).toHaveBeenCalledWith('bacon', 'd');
					
					expect(test_draw.addLine).toHaveBeenCalledWith(aSvg, bSvg, 'bacon');
					expect(test_draw.lastNodeClicked).toEqual(null);
				});
				
				it('for proper resulting values, clicking same twice', function(){
					var aSvg = test_draw.addCircle(50, 50, 'r');
					
					var aObj = test_draw.circles[0];
					document.getElementsByClassName(aObj.class)[0]
						.dispatchEvent(clickEvt);
						
					expect(test_draw.lastNodeClicked).toEqual(aObj.html);
					
					document.getElementsByClassName(aObj.class)[0]
						.dispatchEvent(clickEvt);
						
					expect($).not.toHaveBeenCalled();
				});
				
				it('trying to make the same line twice', function(){
					var aSvg = test_draw.addCircle(50, 50, 'rs');
					var bSvg = test_draw.addCircle(100, 100, 'other');
					
					var aObj = test_draw.circles[0];
					var bObj = test_draw.circles[1];
					var origGroup = bObj.group;
					document.getElementsByClassName(aObj.class)[0]
						.dispatchEvent(clickEvt);
					
					document.getElementsByClassName(bObj.class)[0]
						.dispatchEvent(clickEvt);
					
					$('.rel-only').val('bacon');
					
					document.getElementsByClassName('rel-submit')[0]
						.dispatchEvent(clickEvt);
						
					expect(test_draw.lines.length).toEqual(1);
					
					document.getElementsByClassName(aObj.class)[0]
						.dispatchEvent(clickEvt);
					
					document.getElementsByClassName(bObj.class)[0]
						.dispatchEvent(clickEvt);
					
					$('.rel-only').val('bacon');
					
					document.getElementsByClassName('rel-submit')[0]
						.dispatchEvent(clickEvt);
						
					expect(test_draw.lines.length).toEqual(1);
					expect(test_draw.addLine.callCount).toEqual(1);
				});
			});
			
			xit('in delete_hold mode', function(){
				var aSvg = d3.select('.csvg').append('circle');
				var cl = aSvg.attr('class');
								
				test_draw.tool_mode.setMode('delete_hold');
				
				document.getElementsByClassName(aSvg.attr('class'))[0]
					.dispatchEvent(clickEvt);
									
				expect(test_draw.circles.length).toEqual(1);
				expect(test_draw.lines.length).toEqual(0);
				expect(test_draw.circles[0].color).toEqual('#ffffff');
			});
		});
		
		describe('the doubleClick function in empty mode', function(){
			beforeEach(function(){
				test_draw.tool_mode.setMode('');
				test_draw.circles = [];
				test_draw.lines = [];
				
				spyOn(window, '$').andCallThrough();
				spyOn(window, 'parseInt').andCallThrough();
				spyOn(window, 'alert').andCallThrough();
				
				spyOn(d3, 'select').andCallThrough();
				
				spyOn(test_draw, 'alterNodeColor').andCallThrough();
				
				spyOn(test_draw.circles, 'indexOfObj').andCallThrough();
				spyOn(test_draw.lines, 'getAllIndicies').andCallThrough();
				spyOn(Math, 'random').andCallThrough();
				spyOn(Math, 'cos').andCallThrough();
				spyOn(Math, 'sin').andCallThrough();
				
			});
			
			it('for proper method call logic before submitting forms', function(){
				var svg1 = test_draw.addCircle(100, 100, 'apple');
				svg1.call(test_draw.doubleClickNode);
				
				expect($).toHaveBeenCalledWith('.rel-ent2-form');
				expect($).toHaveBeenCalledWith('.relate');
				expect(d3.select).toHaveBeenCalledWith('.rel-ent-submit');
				expect($).not.toHaveBeenCalledWith('.ent2');
			});
			
			it('for proper method call logic during empty submission', function(){
				var c = test_draw.addCircle(100, 100, 'banana');
				var cl = c.attr('class');
				document.getElementsByClassName(cl)[0]
					.dispatchEvent(dblClickEvt);
					
				document.getElementsByClassName('rel-ent-submit')[0]
					.dispatchEvent(clickEvt);
					
				expect($).toHaveBeenCalledWith('.ent2');
				expect(alert).toHaveBeenCalled();
			});
			
			it('for proper method call logic during valid submission', function(){
				var c = test_draw.addCircle(100, 100, 'crab');
				var cl = c.attr('class');
				document.getElementsByClassName(cl)[0]
					.dispatchEvent(dblClickEvt);
				$('.ent2').val('cheese');
				$('.relate').val('cow');
				
				var elem = document.getElementsByClassName('rel-ent-submit')[0];
				elem.dispatchEvent(clickEvt);
					
				expect(alert).not.toHaveBeenCalled();
				expect(test_draw.alterNodeColor).toHaveBeenCalled();
				expect(test_draw.circles.indexOfObj).toHaveBeenCalledWith('cheese', 'd');
				expect(test_draw.lines.getAllIndicies).toHaveBeenCalledWith('cow', 'd');
				expect(Math.random).toHaveBeenCalled();
				expect(Math.sin).toHaveBeenCalled();
				expect(Math.cos).toHaveBeenCalled();
			});
			
			it('for proper resulting values', function(){
				var c = test_draw.addCircle(100, 100, 'danish');
				var cl = c.attr('class');
				document.getElementsByClassName(cl)[0]
					.dispatchEvent(dblClickEvt);
				$('.ent2').val('dog');
				$('.relate').val('drive');
				
				var elem = document.getElementsByClassName('rel-ent-submit')[0];
				elem.dispatchEvent(clickEvt);
				
				expect(test_draw.circles.length).toEqual(2);
				expect(test_draw.lines.length).toEqual(1);
			});
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
			
			var c11 = test_draw.addCircle(50, 100, 'hi');
			
			var c21 = test_draw.addCircle(450, 100, 'bye');
			
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
			d3.selectAll('circle').remove();
			d3.selectAll('line').remove();
			
			for (var i = 0; i < 4; i++){
				var temp = test_draw.addCircle(i, i, 'a'+i);
			}
			
			test_draw.circles[0].color = test_draw.entity1Color;
			test_draw.circles[0].group = 0;
			d3.select(test_draw.circles[0].html).style('fill', test_draw.entity1Color);
			test_draw.circles[1].color = test_draw.bothColor;
			test_draw.circles[1].group = 0;
			d3.select(test_draw.circles[1].html).style('fill', test_draw.bothColor);
			test_draw.circles[2].color = test_draw.bothColor;
			test_draw.circles[2].group = 0;
			d3.select(test_draw.circles[2].html).style('fill', test_draw.bothColor);
			test_draw.circles[3].color = test_draw.entity2Color;
			test_draw.circles[3].group = 0;
			d3.select(test_draw.circles[3].html).style('fill', test_draw.entity2Color);
			
			for (var i = 0; i < 3; i++){
				var g = d3.select('.canvas svg')
					.append('g');
					
				var temp = g.append('line')
					.attr('x1', i).attr('y1', i)
					.attr('x2', i+1).attr('y2', i+1)
					.attr('class', i)
					.attr('d', i);
				
				test_draw.lines.push({
					source: test_draw.circles[i].html,
					target: test_draw.circles[i+1].html,
					html: temp[0][0],
					d: i.toString() ,
					class: i.toString()
				});
			}
			expect(test_draw.isAlone(test_draw.circles[0])).toBe(false);
			expect(test_draw.isAlone(test_draw.circles[1])).toBe(false);
			expect(test_draw.isAlone(test_draw.circles[2])).toBe(false);
			expect(test_draw.isAlone(test_draw.circles[3])).toBe(false);
						
			test_draw.deleteNode(test_draw.circles[1].html);
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
			
			test_draw.deleteNode(test_draw.circles[2].html);
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
	
	describe('the addArrow function', function(){
		it('for proper method call logic', function(){
		
			var l = d3.select('.csvg').append('line')
				.attr('x1', 0).attr('y1', 1)
				.attr('x2', 2).attr('y2', 3);
				
			spyOn(d3, 'select').andCallThrough();
			spyOn(window, 'parseInt').andCallThrough();
			
			test_draw.addArrow(l);
			
			expect(d3.select).toHaveBeenCalled();
			expect(parseInt).toHaveBeenCalled();
		});
		
		it('for proper resulting values', function(){
			var l = d3.select('.csvg').append('g')
				.append('line')
				.attr('x1', 0).attr('y1', 1)
				.attr('x2', 2).attr('y2', 3);
		
			var p = test_draw.addArrow(l);
			
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
	
	describe('mimic interactions', function(){
		beforeEach(function(){
			test_draw.tool_mode.setMode('');
			test_draw.circles = [];
			test_draw.lines = [];
			d3.selectAll('circle').remove();
			d3.selectAll('line').remove();
			test_draw.createCanvas();
			
			spyOn(test_draw, 'createCircle').andCallThrough();
			spyOn(test_draw, 'addCircle').andCallThrough();
			spyOn(test_draw, 'doubleClickNode').andCallThrough();
		});
		
		it('click, dblclick, dblclick', function(){
			test_draw.tool_mode.setMode('node_hold');
						
			document.getElementsByClassName('csvg')[0]
				.dispatchEvent(clickEvt);
				
			expect(test_draw.createCircle).toHaveBeenCalled();
			$('.ent1').val('a');
			
			document.getElementsByClassName('ent-submit')[0]
				.dispatchEvent(clickEvt);
				
			expect(test_draw.addCircle).toHaveBeenCalled();
			expect(test_draw.circles.length).toEqual(1);
			expect(test_draw.lines.length).toEqual(0);
			
			var nodeA = test_draw.circles[0];
			expect(nodeA.color).toEqual('#ffffff');
			expect(d3.select(nodeA.html).style('fill')).toEqual('#ffffff');
			
			test_draw.tool_mode.setMode('');

			document.getElementsByClassName(nodeA.class)[0]
				.dispatchEvent(dblClickEvt);
				
			expect(test_draw.doubleClickNode).toHaveBeenCalled();
			
			$('.ent2').val('c');
			$('.relate').val('b');
			
			document.getElementsByClassName('rel-ent-submit')[0]
				.dispatchEvent(clickEvt);
			
			var nodeC = test_draw.circles[1];
			expect(test_draw.circles.length).toEqual(2);
			expect(test_draw.lines.length).toEqual(1);
			expect(nodeA.color).toEqual(entity1Color);
			expect(nodeC.color).toEqual(entity2Color);
			expect(nodeC.group).toEqual(nodeA.group);
			
			document.getElementsByClassName(nodeC.class)[0]
				.dispatchEvent(dblClickEvt);
				
			$('.ent2').val('e');
			$('.relate').val('d');
			
			document.getElementsByClassName('rel-ent-submit')[0]
				.dispatchEvent(clickEvt);
			
			var nodeE = test_draw.circles[2];
			expect(test_draw.circles.length).toEqual(3);
			expect(test_draw.lines.length).toEqual(2);
			expect(nodeA.color).toEqual(entity1Color);
			expect(nodeC.color).toEqual(bothColor);
			expect(nodeE.color).toEqual(entity2Color);
			expect(nodeC.group).toEqual(nodeA.group);
			expect(nodeE.group).toEqual(nodeA.group);
			
			expect(d3.select(nodeA.html).style('fill')).toEqual(entity1Color);
			expect(d3.select(nodeC.html).style('fill')).toEqual(bothColor);
			expect(d3.select(nodeE.html).style('fill')).toEqual(entity2Color);
		});

	});
});