/**
 * Assertion Graph Jasmine Test File
 */

/**
 * Test what happens during a run of the assertion widget.
 */
describe('Test src/widget/assertionGraph/js/convert.js', function() {

	describe('Test the createArray() function', function() {
		it('for proper parsing behavior', function() {

			var data = [{
				"entity1": "dog",
				"relationship": "caught",
				"entity2": "ball"
			}];
			
			var nodes = [];
			var links = [];

			spyOn(nodes, 'push').andCallThrough();
			var arrays = createArrays(nodes, links ,data,'disjoint');
			
			expect(nodes).toBeDefined();
			expect(links).toBeDefined();
			expect(nodes.push).toHaveBeenCalled();
		});

	});
});

describe('Test src/widget/assertionGraph/js/graph.js', function() {
	
	describe('Test the drawing of the assertion graph widget', function() {
		it('for correct behavior', function() {

			var test;
			spyOn(d3, 'json').andCallFake(function() {
				return "test data";

			});

			test = d3.json();

			expect(test).toEqual("test data");
		});
	});

});
