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
	
	var mouseOverEvt = document.createEvent('Event');
	mouseOverEvt.initEvent('mouseover', true, false);
	
	var mouseOutEvt = document.createEvent('Event');
	mouseOutEvt.initEvent('mouseout', true, false);
		
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
		
		it('specifically the indexOfObj function', function(){				
			var array = [{class:'zero'}];
			expect(indexOfObj(array, 'zero', 'class')).toEqual(0);
			expect(indexOfObj(array, 'one', 'class')).toEqual(-1);
		});
		
		it('the getAllIndicies function', function(){				
			var array = [{class: 'zero'}, {class: 'one'}, {class: 'ZERO'}];
			expect(getAllIndicies(array, 'zero', 'class').length).toEqual(2);
			expect(getAllIndicies(array, 'one', 'class').length).toEqual(1);
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
			expect(test_draw.computeCoord(21.929843975, 'x')).toEqual(21);
			expect(test_draw.computeCoord(103.123984775, 'y')).toEqual(103);
			expect(test_draw.computeCoord(3000, 'x')).toEqual(test_draw.canvasW - 15);
			expect(test_draw.computeCoord(3000, 'y')).toEqual(test_draw.canvasH - 15);
			expect(test_draw.computeCoord(-30, 'x')).toEqual(15);
			expect(test_draw.computeCoord(-9834, 'y')).toEqual(15);
			
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
			var s1 = spyOn(window, 'indexOfObj').andCallThrough();
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
	
	describe('the clicking functions', function(){
		describe('the nodeClick function', function(){
			beforeEach(function(){
				test_draw.t_mode.setMode('rel_hold');
				test_draw.circles = [];
				test_draw.lines = [];
				d3.selectAll('line').remove();
				d3.selectAll('circle').remove();
				test_draw.lastNodeClicked = null;
				
				spyOn(window, '$').andCallThrough();
				spyOn(window, 'alert').andCallThrough();
				
				spyOn(d3, 'select').andCallThrough();
				
				spyOn(test_draw, 'alterNodeColor').andCallThrough();
				spyOn(test_draw, 'extractCircles').andCallThrough();
				spyOn(test_draw, 'addLine').andCallThrough();
				spyOn(test_draw, 'deleteItem').andCallThrough();
				spyOn(window, 'indexOfObj').andCallThrough();
				spyOn(window, 'getAllIndicies').andCallThrough();
			});
			
			describe('in rel_hold mode', function(){				
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
					expect(getAllIndicies).toHaveBeenCalled();
					
					expect(test_draw.addLine).toHaveBeenCalledWith(aSvg, bSvg, 'bacon');
					expect(test_draw.lastNodeClicked).toEqual(null);
				});
				
				it('for proper resulting values, clicking same twice', function(){
					var aSvg = test_draw.addCircle(50, 50, 'r');
					
					var aObj = test_draw.circles[0];
					document.getElementsByClassName(aObj.class)[0].dispatchEvent(clickEvt);	
					expect(test_draw.lastNodeClicked).toEqual(aObj.html);
					
					document.getElementsByClassName(aObj.class)[0].dispatchEvent(clickEvt);	
					expect($).not.toHaveBeenCalled();
				});
				
				it('trying to make the same line twice', function(){
					var aSvg = test_draw.addCircle(50, 50, 'rs');
					var bSvg = test_draw.addCircle(100, 100, 'other');
					
					var aObj = test_draw.circles[0];
					var bObj = test_draw.circles[1];
					var origGroup = bObj.group;
					
					document.getElementsByClassName(aObj.class)[0].dispatchEvent(clickEvt);
					document.getElementsByClassName(bObj.class)[0].dispatchEvent(clickEvt);
					$('.rel-only').val('bacon');
					document.getElementsByClassName('rel-submit')[0].dispatchEvent(clickEvt);
					expect(test_draw.lines.length).toEqual(1);
					
					document.getElementsByClassName(aObj.class)[0].dispatchEvent(clickEvt);
					document.getElementsByClassName(bObj.class)[0].dispatchEvent(clickEvt);
					$('.rel-only').val('bacon');
					document.getElementsByClassName('rel-submit')[0].dispatchEvent(clickEvt);
					expect(test_draw.lines.length).toEqual(1);
				});
			});
			
			it('in delete_hold mode', function(){
				var aSvg = test_draw.addCircle(9, 10, 'hello');
				var bSvg = test_draw.addCircle(11, 12, 'goodbye');				
				
				document.getElementsByClassName(aSvg.attr('class'))[0]
					.dispatchEvent(clickEvt);
					
				document.getElementsByClassName(bSvg.attr('class'))[0]
					.dispatchEvent(clickEvt);
					
				$('.rel-only').val('bacon');
					
				document.getElementsByClassName('rel-submit')[0]
					.dispatchEvent(clickEvt);
					
				expect(test_draw.circles.length).toEqual(2);
				expect(test_draw.lines.length).toEqual(1);
				expect(aSvg.style('fill')).toEqual(entity1Color);
				expect(bSvg.style('fill')).toEqual(entity2Color);
					
				test_draw.t_mode.setMode('delete_hold');
				
				document.getElementsByClassName(aSvg.attr('class'))[0]
					.dispatchEvent(clickEvt);
									
				expect(test_draw.circles.length).toEqual(1);
				expect(test_draw.lines.length).toEqual(0);
				expect(test_draw.circles[0].color).toEqual('#ffffff');
				
				expect(test_draw.deleteItem).toHaveBeenCalled();
			});
		});
		
		describe('the doubleClick function in empty mode', function(){
			beforeEach(function(){
				test_draw.t_mode.setMode('');
				test_draw.circles = [];
				test_draw.lines = [];
				d3.selectAll('line').remove();
				d3.selectAll('circle').remove();
				
				spyOn(window, '$').andCallThrough();
				spyOn(window, 'parseInt').andCallThrough();
				spyOn(window, 'alert').andCallThrough();
				
				spyOn(d3, 'select').andCallThrough();
				
				spyOn(test_draw, 'alterNodeColor').andCallThrough();
				
				//spyOn(window, 'indexOfObj').andCallThrough();
				spyOn(window, 'getAllIndicies').andCallThrough();
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
				//expect(indexOfObj).toHaveBeenCalled();
				expect(getAllIndicies).toHaveBeenCalled();
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
		beforeEach(function(){
			test_draw.labelsShown = false;
			d3.selectAll('.canvas text').remove();
			spyOn(d3, 'select').andCallThrough();
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(window, 'parseInt').andCallThrough();
		});
		
		it('the mouseover function when over a node', function(){			
			var aSvg = test_draw.addCircle(0, 0, 'mouseover');
			document.getElementsByClassName(aSvg.attr('class'))[0]
				.dispatchEvent(mouseOverEvt);
			
			expect(d3.select).toHaveBeenCalledWith(aSvg[0][0]);
			expect(parseInt).toHaveBeenCalled();
			expect(parseInt.callCount).toEqual(2);
			expect(d3.selectAll('.canvas text')[0].length).toEqual(1);
		});
		
		it('the mouseover function when over a link', function(){
			var aSvg = test_draw.addCircle(0, 0, 'mouseover1');
			var bSvg = test_draw.addCircle(1, 1, 'mouseover2');
			test_draw.addLine(aSvg, bSvg, 'mouseoverl');
			document.getElementsByClassName(test_draw.lines[0].class)[0]
				.dispatchEvent(mouseOverEvt);
			
			expect(parseInt).toHaveBeenCalled();
			expect(d3.selectAll('.canvas text')[0].length).toEqual(1);
		});
		
		it('the mouseover function when test_draw.labelsShown === true', function(){
			test_draw.labelsShown = true;
			
			var aSvg = test_draw.addCircle(0, 0, 'mouseover up');
			document.getElementsByClassName(aSvg.attr('class'))[0]
				.dispatchEvent(mouseOverEvt);
			
			expect(d3.select).not.toHaveBeenCalledWith(aSvg[0][0]);
			expect(parseInt).not.toHaveBeenCalled();
			expect(d3.selectAll('.canvas text')[0].length).toEqual(0);
		});
		
		it('the mouseout function in anything other than label_hold mode', function(){			
			var aSvg = test_draw.addCircle(4, 40, 'mouseout');
			document.getElementsByClassName(aSvg.attr('class'))[0]
				.dispatchEvent(mouseOverEvt);
			
			expect(d3.selectAll('.canvas text')[0].length).toEqual(1);
			
			document.getElementsByClassName(aSvg.attr('class'))[0]
				.dispatchEvent(mouseOutEvt);
				
			expect(d3.select).toHaveBeenCalled();
			expect(d3.selectAll('.canvas text')[0].length).toEqual(0);
		});
	});
	
	describe('the deletion functions', function(){
		it('the deleteItem function, method calls', function(){
			test_draw.circles = [];
			test_draw.lines = [];
			test_draw.circleCount = 0;
			test_draw.lineCount = 0;
			test_draw.count = 0;
			d3.selectAll('circle').remove();
			d3.selectAll('line').remove();
			
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(d3, 'select').andCallThrough();
			spyOn(test_draw, 'extractCircles').andCallThrough();
			spyOn(test_draw, 'separateGroups').andCallThrough();
			
			var c11 = test_draw.addCircle(50, 100, 'hi');
			var c21 = test_draw.addCircle(450, 100, 'bye');
			var line = test_draw.addLine(c11, c21, 'hi then bye');
			test_draw.deleteItem(c11[0][0]);
			
			expect(d3.selectAll).toHaveBeenCalledWith('.canvas line');
			expect(d3.select).toHaveBeenCalled();
			expect(test_draw.extractCircles).toHaveBeenCalledWith(0);
			expect(test_draw.separateGroups).toHaveBeenCalled();
			expect(d3.selectAll.callCount).toEqual(2);
		});
		
		it('the deleteItem function', function(){
			test_draw.circles = [];
			test_draw.lines = [];
			d3.selectAll('circle').remove();
			d3.selectAll('line').remove();
			
			for (var i = 0; i < 4; i++){
				var temp = test_draw.addCircle(i, i, 'a'+i);
				test_draw.circles[i].group = 0;
			}
			
			test_draw.circles[0].color = test_draw.entity1Color;
			d3.select(test_draw.circles[0].html).style('fill', test_draw.entity1Color);
			test_draw.circles[1].color = test_draw.bothColor;
			d3.select(test_draw.circles[1].html).style('fill', test_draw.bothColor);
			test_draw.circles[2].color = test_draw.bothColor;
			d3.select(test_draw.circles[2].html).style('fill', test_draw.bothColor);
			test_draw.circles[3].color = test_draw.entity2Color;
			d3.select(test_draw.circles[3].html).style('fill', test_draw.entity2Color);
			
			expect(test_draw.isAlone(test_draw.circles[0])).toBe(true);
			expect(test_draw.isAlone(test_draw.circles[1])).toBe(true);
			expect(test_draw.isAlone(test_draw.circles[2])).toBe(true);
			expect(test_draw.isAlone(test_draw.circles[3])).toBe(true);
			
			for (var i = 0; i < 3; i++){
				var c1 = test_draw.circles[i].html;
				var c2 = test_draw.circles[i+1].html;
				test_draw.addLine(d3.select(c1), d3.select(c2), i);
			}
			
			expect(test_draw.isAlone(test_draw.circles[0])).toBe(false);
			expect(test_draw.isAlone(test_draw.circles[1])).toBe(false);
			expect(test_draw.isAlone(test_draw.circles[2])).toBe(false);
			expect(test_draw.isAlone(test_draw.circles[3])).toBe(false);
						
			test_draw.deleteItem(test_draw.circles[1].html);
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
			
			test_draw.deleteItem(test_draw.circles[2].html);
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
			var l = d3.select('.node-link-container').append('g')
				.append('line')
					.attr('x1', 0).attr('y1', 1)
					.attr('x2', 2).attr('y2', 3)
					.attr('class', 0)
					.attr('d', 'lala');
							
			spyOn(d3, 'select').andCallThrough();
			spyOn(window, 'parseInt').andCallThrough();
			
			test_draw.addArrow(l);
			
			expect(d3.select).toHaveBeenCalled();
			expect(parseInt).toHaveBeenCalled();
		});
		
		it('for proper resulting values', function(){
			var l = d3.select('.node-link-container').append('g')
				.append('line')
					.attr('x1', 10).attr('y1', 11)
					.attr('x2', 12).attr('y2', 13)
					.attr('class', 1)
					.attr('d', 'lala123');
		
			var p = test_draw.addArrow(l);
			
			expect(p.attr('class')).toEqual('arrow');
			expect(p[0][0].parentNode.localName).toEqual('g');
			expect(p.attr('marker-mid')).toEqual('url(#Triangle)');
			expect(p.attr('d')).toEqual('M 10 11 L 11 12 L 12 13');
		});
	});
	
	describe('the separateGroups function', function(){
		it('for proper method call logic', function(){			
			spyOn(d3, 'select').andCallThrough();
			spyOn(d3, 'selectAll').andCallThrough();
			
			test_draw.circles = [];
			test_draw.lines = [];
			d3.selectAll('circle').remove();
			d3.selectAll('line').remove();
			
			test_draw.addCircle(324, 21, 'center');
			var center = d3.select(test_draw.circles[0].html);
			
			test_draw.addCircle(151, 35, 'app');
			test_draw.addCircle(414, 1, 'pool');
			test_draw.t_mode.setMode('');
			
			document.getElementsByClassName(center.attr('class'))[0].dispatchEvent(dblClickEvt);
			$('.relate').val('b703');
			$('.ent2').val('c702');
			document.getElementsByClassName('rel-ent-submit')[0].dispatchEvent(clickEvt);
				
			document.getElementsByClassName(center.attr('class'))[0].dispatchEvent(dblClickEvt);
			$('.relate').val('b708');
			$('.ent2').val('c709');
			document.getElementsByClassName('rel-ent-submit')[0].dispatchEvent(clickEvt);	
			
			test_draw.addCircle(5, 195, 'cup');
			
			document.getElementsByClassName(center.attr('class'))[0].dispatchEvent(dblClickEvt);
			$('.relate').val('b716');
			$('.ent2').val('c717');
			document.getElementsByClassName('rel-ent-submit')[0].dispatchEvent(clickEvt);
			
			document.getElementsByClassName(center.attr('class'))[0].dispatchEvent(dblClickEvt);	
			$('.relate').val('b724');
			$('.ent2').val('c725');
			document.getElementsByClassName('rel-ent-submit')[0].dispatchEvent(clickEvt);
				
			var other = test_draw.addCircle(51, 51, 'other');
			document.getElementsByClassName(other.attr('class'))[0].dispatchEvent(dblClickEvt);
			$('.relate').val('other 1');
			$('.ent2').val('other 2');
			document.getElementsByClassName('rel-ent-submit')[0].dispatchEvent(clickEvt);
				
			var before = test_draw.circles[0];
				
			var cIndicies = test_draw.extractCircles(before.group);
			expect(test_draw.circles[cIndicies[0]].color).toEqual(entity1Color);
			for (var i = 1 ; i < cIndicies.length ; i++){
				expect(test_draw.circles[cIndicies[i]].group).toEqual(before.group);
				expect(test_draw.circles[cIndicies[i]].color).toEqual(entity2Color);
			}
			
			center.remove();
			var c = test_draw.circles.shift();
			var cIndicies = test_draw.extractCircles(c.group);
			
			test_draw.separateGroups(cIndicies);
			
			expect(d3.select).toHaveBeenCalled();
			expect(d3.selectAll).toHaveBeenCalledWith('.canvas line');
			
			expect(test_draw.circles[cIndicies[0]].group).toEqual(c.group);
			expect(test_draw.circles[cIndicies[0]].color).toEqual('#ffffff');
			for (var i = 1 ; i < cIndicies.length ; i++){
				expect(test_draw.circles[cIndicies[i]].group).not.toEqual(c.group);
				expect(test_draw.circles[cIndicies[i]].color).toEqual('#ffffff');
			}
		});
	});
	
	describe('mimic interactions', function(){
		beforeEach(function(){
			test_draw.t_mode.setMode('');
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
			test_draw.t_mode.setMode('node_hold');
						
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
			
			test_draw.t_mode.setMode('');

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