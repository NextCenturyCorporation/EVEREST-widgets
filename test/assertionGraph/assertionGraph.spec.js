/**
 * Assertion Graph Jasmine Test File
 */

/**
 * Test what happens during a run of the assertion widget.
 */
 
var d = {
	"entity1": "dog",
	"relationship": "caught",
	"entity2": "ball"
};

var e = {
	"entity1": "cow",
	"relationship": "fell",
	"entity2": "over"
};
	
var f = [{
	"entity1": "dog",
	"relationship": "caught",
	"entity2": "ball"
},
{
	"entity1": "a",
	"relationship": "b",
	"entity2": "c"
},
{
	"entity1": "e",
	"relationship": "f",
	"entity2": "g"
}];

describe('Test src/widget/assertionGraph/js/network.js', function() {
	it('Test the midpoint function', function(){
		var p1 = { x:10, y:100 };
		var p2 = { x:20, y:300 };
		
		var mid = midpoint(p1, p2);
		
		expect(mid.x).toEqual(15);
		expect(mid.y).toEqual(200);
	});
	
	describe('Create network function', function(){
		it('for initial method call logic', function(){
			spyOn(window, 'addNewAssertion').andCallThrough();
			spyOn(svg, 'selectAll').andCallThrough();
			spyOn(d3.scale, 'category10').andCallThrough();
			spyOn(d3.layout, 'force').andCallThrough();
			
			new network(svg, [{
				"entity1": "stars",
				"relationship": "fell",
				"entity2": "down"
			}] , 'disjoint');
			
			expect(addNewAssertion).toHaveBeenCalled();//With([], 'disjoint');
			expect(svg.selectAll).toHaveBeenCalledWith('.link');
			expect(svg.selectAll).toHaveBeenCalledWith('.node');
			expect(d3.scale.category10).toHaveBeenCalled();
			expect(d3.layout.force).toHaveBeenCalled();
		});
		
		it('test the me.draw function', function(){
			var net = new network(svg, [], 'disjoint');
			
			spyOn(window, 'addNewAssertion').andCallThrough();
			spyOn(svg, 'selectAll').andCallThrough();
			
			var a = {entity1:"A", relationship:"B", entity2:"C"};
			net.draw({}, a);
			
			expect(addNewAssertion).toHaveBeenCalled();
			expect(net.nodes.length).toEqual(2);
			expect(net.links.length).toEqual(1);
			
			expect(svg.selectAll).toHaveBeenCalledWith('g.linklabelholder');
		});
		
		xit('test the me.tick function', function(){
			spyOn(window, 'midpoint').andCallThrough();
			
			var net = new network(svg, [], 'disjoint');
			net.draw();
			net.tick();
			
			expect(midpoint).toHaveBeenCalled();
		});
	});
});

describe('Test src/widget/assertionGraph/js/convert.js', function() {
	describe('Test the indexOf function', function(){
		it('indexOfCircle', function(){
			var circles = [];
			var item = {value: "z", group: 1};
			expect(indexOfCircle(item, circles)).toEqual(-1);
			
			circles.push(item);
			expect(indexOfCircle(item, circles)).toEqual(0);	
			
			var fakeItem1 = {value: "a", group: -1};
			var fakeItem2 = {value: "b", group: 1};	
			
			expect(indexOfCircle(fakeItem1, circles)).toEqual(-1);
			expect(indexOfCircle(fakeItem2, circles)).toEqual(-1);
		});
		
		it('indexOfLink', function(){
			var links = [];
			var item = {value: "a", source: {index : 1}, target: {index: 2}};
			expect(indexOfLink(item, links)).toEqual(-1);
			
			links.push(item);
			var tempItem = {value: "a", source: 1, target: 2};
			expect(indexOfLink(tempItem, links)).toEqual(0);
			
			
			var fakeItem1 = {value: "b", source: 1, target: 2};
			var fakeItem2 = {value: "a", source: -1, target: 2};	
			var fakeItem3 = {value: "b", source: 1, target: -2};
			
			expect(indexOfLink(fakeItem1, links)).toEqual(-1);
			expect(indexOfLink(fakeItem2, links)).toEqual(-1);
			expect(indexOfLink(fakeItem3, links)).toEqual(-1);
		});
		
		it('indexOfMessage', function(){
			var links = [];
			var circles = [];
			var item = {entity1: "a", relationship: "b", entity2: "c"};
			expect(indexOfMessage(item, links, circles)).toEqual(-1);
			
			links.push({
				value: "b",
				source: {value:"a"},
				target: {value:"c"}
			});
			expect(indexOfMessage(item, links, circles)).toEqual(0);
			
			var fakeItem1 = {entity1: "e", relationship: "b", entity2: "c"};
			var fakeItem2 = {entity1: "a", relationship: "e", entity2: "c"};
			var fakeItem3 = {entity1: "a", relationship: "b", entity2: "e"};	
			
			expect(indexOfMessage(fakeItem1, links, circles)).toEqual(-1);
			expect(indexOfMessage(fakeItem2, links, circles)).toEqual(-1);
			expect(indexOfMessage(fakeItem3, links, circles)).toEqual(-1);
		});
	});
	
	describe('Test the addNewAssertion() function', function(){
		it('for proper parsing behavior', function() {

			var nodes = [];
			var links = [];
			
			spyOn(nodes, 'push').andCallThrough();
			var arrays = addNewAssertion(nodes, links, e, 'disjoint');
			expect(nodes).toBeDefined();
			expect(links).toBeDefined();
			expect(nodes.push).toHaveBeenCalled();
			
			expect(arrays[0].length).toEqual(2);
			expect(arrays[1].length).toEqual(1);
		});
		
		it('for proper method call logic', function(){
			spyOn(window, 'indexOfCircle').andCallThrough();
			spyOn(window, 'indexOfLink').andCallThrough();
			
			var arrays = addNewAssertion([],[], d, 'disjoint');
			
			expect(indexOfCircle).toHaveBeenCalled();
			expect(indexOfLink).toHaveBeenCalled();
			
			expect(arrays[0].length).toEqual(2);
			expect(arrays[1].length).toEqual(1);
			
			var dat = {
				"entity1": "cat",
				"relationship": "saw",
				"entity2": "mouse"
			};
			
			arrays = addNewAssertion(arrays[0], arrays[1], dat, 'disjoint');
			expect(indexOfCircle).toHaveBeenCalled();
			expect(indexOfLink).toHaveBeenCalled();
			
			expect(arrays[0].length).toEqual(4);
			expect(arrays[1].length).toEqual(2);
		});
	});
});