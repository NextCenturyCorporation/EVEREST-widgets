/**
 * Assertion Graph Jasmine Test File
 */

/**
 * Test what happens during a normal run.
 */
describe('Test src/widget/assertionGraph/js/convert.js', function() {

	describe('Test the createArray() function', function() {
		it('for proper parsing behavior', function() {

			var data = [{
				"entity1": "dog",
				"relationship": "caught",
				"entity2": "ball"
			}];

			createArrays(data);

			expect(nodes).toBeDefined();

		});

	});
});

describe('Test src/widget/assertionGraph/js/graph.js', function() {

});

/**
 * Test what happens if one of the json entries is missing an entity or
 * relationship.
 */
describe('Test src/widget/assertionGraph/js/convert.js', function() {

});

describe('Test src/widget/assertionGraph/js/graph.js', function() {

});
