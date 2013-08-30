var svg = d3.select('body').append('svg');
var entity1Color = entity1Color;
var entity2Color = entity2Color;
var bothColor = bothColor;
describe('test convert.js function', function(){
	describe('addNewAssertion', function(){
		var nodes = [];
		var links = [];
		it('simple 1', function(){			
			var arrays = addNewAssertion(nodes, links, 
				{ entity1: "A", relationship: "B", entity2: "C" });
			nodes = arrays[0];
			links = arrays[1];
			
			expect(nodes.length).toEqual(2);
			expect(links.length).toEqual(1);
			
			expect(nodes[0].color).toEqual(entity1Color);
			expect(nodes[1].color).toEqual(entity2Color);
			
			expect(links[0].source).toEqual(0);
			expect(links[0].target).toEqual(1);
		});
		
		it('entity1, entity2', function(){
			var b = { 
				entity1: "M",
				relationship: "N",
				entity2: "A"
			};
			
			var arrays = addNewAssertion(nodes, links, b);
			nodes = arrays[0];
			links = arrays[1];
			
			expect(nodes.length).toEqual(3);
			expect(links.length).toEqual(2);
			
			expect(nodes[0].color).toEqual(bothColor);
			expect(nodes[1].color).toEqual(entity2Color);
			expect(nodes[2].color).toEqual(entity1Color);
			
			expect(links[1].source).toEqual(2);
			expect(links[1].target).toEqual(0);
		});
		
		it('add the an existing msg', function(){
			var a = {
				entity1: "A",
				relationship: "B",
				entity2: "C"
			};
			
			var b = { 
				entity1: "M",
				relationship: "N",
				entity2: "A"
			};
			
			var arrays = addNewAssertion(nodes, links, a);
			nodes = arrays[0];
			links = arrays[1];
			
			arrays = addNewAssertion(nodes, links, b);
			
			expect(nodes.length).toEqual(3);
			expect(links.length).toEqual(2);
			
			expect(nodes[0].color).toEqual(bothColor);
			expect(nodes[1].color).toEqual(entity2Color);
		});
		
		it('add matching but other case', function(){
			var a = {
				entity1: "a",
				relationship: "b",
				entity2: "c"
			};
						
			var arrays = addNewAssertion(nodes, links, a);
			nodes = arrays[0];
			links = arrays[1];
						
			expect(nodes.length).toEqual(3);
			expect(links.length).toEqual(2);
			
			expect(nodes[0].color).toEqual(bothColor);
			expect(nodes[1].color).toEqual(entity2Color);
		});
		
		it('entity1, entity1, entity2', function(){
			nodes = [];
			links = [];
			
			var arrays = addNewAssertion(nodes, links, 
				{ entity1: "ashley", relationship: "read", entity2: "a book" });	
			nodes = arrays[0];
			links = arrays[1];
						
			expect(nodes.length).toEqual(2);
			expect(links.length).toEqual(1);
			expect(nodes[0].color).toEqual(entity1Color);
			expect(nodes[1].color).toEqual(entity2Color);
			
			expect(links[0].source).toEqual(0);
			expect(links[0].target).toEqual(1);
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "ashley", relationship: "went", entity2: "home" });	
			nodes = arrays[0];
			links = arrays[1];
			
			expect(nodes.length).toEqual(3);
			expect(links.length).toEqual(2);
			expect(nodes[0].color).toEqual(entity1Color);
			expect(nodes[1].color).toEqual(entity2Color);
			expect(nodes[2].color).toEqual(entity2Color);
			
			expect(links[1].source).toEqual(0);
			expect(links[1].target).toEqual(2);
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "lisa", relationship: "saw", entity2: "ashley" });	
			nodes = arrays[0];
			links = arrays[1];
			
			expect(nodes.length).toEqual(4);
			expect(links.length).toEqual(3);
			expect(nodes[0].color).toEqual(bothColor);
			expect(nodes[1].color).toEqual(entity2Color);
			expect(nodes[2].color).toEqual(entity2Color);
			expect(nodes[3].color).toEqual(entity1Color);
			
			expect(links[2].source).toEqual(3);
			expect(links[2].target).toEqual(0);
		});
		
		it('entity1, entity2, entity1 (order)', function(){
			nodes = [];
			links = [];
			
			var arrays = addNewAssertion(nodes, links, 
				{ entity1: "ashley", relationship: "read", entity2: "a book" });	
			nodes = arrays[0];
			links = arrays[1];
						
			expect(nodes.length).toEqual(2);
			expect(links.length).toEqual(1);
			expect(nodes[0].color).toEqual(entity1Color);
			expect(nodes[1].color).toEqual(entity2Color);
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "lisa", relationship: "saw", entity2: "ashley" });	
			nodes = arrays[0];
			links = arrays[1];
			
			expect(nodes.length).toEqual(3);
			expect(links.length).toEqual(2);
			expect(nodes[0].color).toEqual(bothColor);
			expect(nodes[1].color).toEqual(entity2Color);
			expect(nodes[2].color).toEqual(entity1Color);
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "ashley", relationship: "went", entity2: "home" });	
			nodes = arrays[0];
			links = arrays[1];
			
			expect(nodes.length).toEqual(4);
			expect(links.length).toEqual(3);
			expect(nodes[0].color).toEqual(bothColor);
			expect(nodes[1].color).toEqual(entity2Color);
			expect(nodes[2].color).toEqual(entity1Color);
			expect(nodes[3].color).toEqual(entity2Color);
		});
		
		it('entity2, entity1', function(){
			var arrays = addNewAssertion(nodes, links, 
				{ entity1: "a book", relationship: "was", entity2: "read" });	
			nodes = arrays[0];
			links = arrays[1];
			
			expect(nodes.length).toEqual(5);
			expect(links.length).toEqual(4);
			expect(nodes[0].color).toEqual(bothColor);
			expect(nodes[1].color).toEqual(bothColor);
			expect(nodes[2].color).toEqual(entity1Color);
			expect(nodes[3].color).toEqual(entity2Color);
			expect(nodes[4].color).toEqual(entity2Color);
		});
		
		it('cycle abc', function(){
			nodes = [];
			links = [];
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "a", relationship: "z", entity2: "b" });	
			nodes = arrays[0];
			links = arrays[1];
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "b", relationship: "y", entity2: "c" });	
			nodes = arrays[0];
			links = arrays[1];
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "c", relationship: "x", entity2: "a" });	
			nodes = arrays[0];
			links = arrays[1];
			
			expect(nodes.length).toEqual(3);
			expect(links.length).toEqual(3);
			expect(nodes[0].color).toEqual(bothColor);
			expect(nodes[1].color).toEqual(bothColor);
			expect(nodes[2].color).toEqual(bothColor);
			
			expect(links[0].source).toEqual(0);
			expect(links[0].target).toEqual(1);
			expect(links[1].source).toEqual(1);
			expect(links[1].target).toEqual(2);
			expect(links[2].source).toEqual(2);
			expect(links[2].target).toEqual(0);
		});
		
		it('cycle acb', function(){
			nodes = [];
			links = [];
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "a", relationship: "z", entity2: "b" });	
			nodes = arrays[0];
			links = arrays[1];
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "c", relationship: "x", entity2: "a" });	
			nodes = arrays[0];
			links = arrays[1];
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "b", relationship: "y", entity2: "c" });	
			nodes = arrays[0];
			links = arrays[1];
			
			expect(nodes.length).toEqual(3);
			expect(links.length).toEqual(3);
			expect(nodes[0].color).toEqual(bothColor);
			expect(nodes[1].color).toEqual(bothColor);
			expect(nodes[2].color).toEqual(bothColor);
		});
		
		it('cycle ac ab cb', function(){
			nodes = [];
			links = [];
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "a", relationship: "z", entity2: "b" });	
			nodes = arrays[0];
			links = arrays[1];
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "a", relationship: "x", entity2: "c" });	
			nodes = arrays[0];
			links = arrays[1];
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "c", relationship: "y", entity2: "b" });	
			nodes = arrays[0];
			links = arrays[1];
			
			expect(nodes.length).toEqual(3);
			expect(links.length).toEqual(3);
			expect(nodes[0].color).toEqual(entity1Color);
			expect(nodes[1].color).toEqual(entity2Color);
			expect(nodes[2].color).toEqual(bothColor);
		});
		
		it('cycle ac ab bc', function(){
			nodes = [];
			links = [];
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "a", relationship: "z", entity2: "b" });	
			nodes = arrays[0];
			links = arrays[1];
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "a", relationship: "x", entity2: "c" });	
			nodes = arrays[0];
			links = arrays[1];
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "b", relationship: "y", entity2: "c" });	
			nodes = arrays[0];
			links = arrays[1];
			
			expect(nodes.length).toEqual(3);
			expect(links.length).toEqual(3);
			expect(nodes[0].color).toEqual(entity1Color);
			expect(nodes[1].color).toEqual(bothColor);
			expect(nodes[2].color).toEqual(entity2Color);
		});
		
		it('msg a -> a', function(){
			nodes = [];
			links = [];
			
			arrays = addNewAssertion(nodes, links, 
				{ entity1: "a", relationship: "z", entity2: "a" });	
			nodes = arrays[0];
			links = arrays[1];
			
			expect(nodes.length).toEqual(1);
			expect(links.length).toEqual(1);
			expect(nodes[0].color).toEqual(bothColor);
		});
	});
});

describe('test network.js function', function(){
	describe('get proper values back from addNewAssertion', function(){
		it('test regular draw', function(){
			var net = new network(svg, []);
			expect(net.nodes).toEqual([]);
			expect(net.links).toEqual([]);
			
			net.draw({}, { entity1: "A", relationship: "B", entity2: "C" });
			expect(net.nodes.length).toEqual(2);
			expect(net.links.length).toEqual(1);
			
			expect(net.nodes[0].color).toEqual(entity1Color);
			expect(net.nodes[1].color).toEqual(entity2Color);
		});
		
		it('entity1, entity2', function(){
			var net1 = new network(svg, []);		
			net1.draw({}, { entity1: "A", relationship: "B", entity2: "C" });
			net1.draw({}, { entity1: "M", relationship: "N", entity2: "A" });
			
			expect(net1.nodes.length).toEqual(3);
			expect(net1.links.length).toEqual(2);
			
			expect(net1.nodes[0].color).toEqual(bothColor);
			expect(net1.nodes[1].color).toEqual(entity2Color);
			expect(net1.nodes[2].color).toEqual(entity1Color);
		});
		
		it('entity2, entity1', function(){
			var net3 = new network(svg, []);		
			net3.draw({}, { entity1: "ashley", relationship: "read", entity2: "a book" });
			net3.draw({}, { entity1: "lisa", relationship: "saw", entity2: "ashley" });
			net3.draw({}, { entity1: "ashley", relationship: "went", entity2: "home" });
			net3.draw({}, { entity1: "a book", relationship: "was", entity2: "read" });
			
			expect(net3.nodes.length).toEqual(5);
			expect(net3.links.length).toEqual(4);
			expect(net3.nodes[0].color).toEqual(bothColor);
			expect(net3.nodes[1].color).toEqual(bothColor);
			expect(net3.nodes[2].color).toEqual(entity1Color);
			expect(net3.nodes[3].color).toEqual(entity2Color);
			expect(net3.nodes[4].color).toEqual(entity2Color);
		});
		
		it('cycle abc', function(){
			var net4 = new network(svg, []);		
			net4.draw({}, { entity1: "a", relationship: "z", entity2: "b" });
			net4.draw({}, { entity1: "b", relationship: "y", entity2: "c" });
			net4.draw({}, { entity1: "c", relationship: "x", entity2: "a" });
			expect(net4.nodes.length).toEqual(3);
			expect(net4.links.length).toEqual(3);
			expect(net4.nodes[0].color).toEqual(bothColor);
			expect(net4.nodes[1].color).toEqual(bothColor);
			expect(net4.nodes[2].color).toEqual(bothColor);
		});
		
	});
	
	describe('getting proper colors out', function(){
		it('', function(){
			var svg1 = d3.select('body').append('svg').attr('class', 'test');
			var net = new network(svg1, []);		
			net.draw({}, { entity1: "ashley", relationship: "read", entity2: "a book" });
			net.draw({}, { entity1: "lisa", relationship: "saw", entity2: "ashley" });
			net.draw({}, { entity1: "ashley", relationship: "went", entity2: "home" });
			net.draw({}, { entity1: "a book", relationship: "was", entity2: "read" });
						
			for (var i = 0; i < net.nodes.length; i++){
				var n = net.nodes[i];
				d3.selectAll('.test circle').each(function(){
					if (n.value === d3.select(this).attr('class')){
						var color = d3.select(this).style('fill');
						var color = n.color;
						if (color === entity1Color){
							expect(color).toEqual(entity1Color);
						} else if (color === entity2Color){
							expect(color).toEqual(entity2Color);
						} else if (color === bothColor){
							expect(color).toEqual(bothColor);
						} else {
							expect(color).toEqual('#000000');
						}
					}				
				});
			}
		});
	});
});