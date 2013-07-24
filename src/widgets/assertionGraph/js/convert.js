/** Converts a json objedt which contains the following key/value pairs:
 * {
 * 		"entity1": "false claims",
 * 		"relationship": "aggravate",
 * 		"entity2": "identity theft"
 * }
 *
 * into two arrays, nodes and links, the proper format to use the force d3 example:
 * 
 * nodes = [
 * 		{"name": "false claims", "group":0},
 * 		{"name": "identity theft", "group":1},
 * 		{"name": "the core group of defendants", "group":1}
 * ];
 *
 * links = [
 * 		{"source":0, "target":1, "value":"aggravate"},
 *		{"source":2, "target":3, "value":"file"},
 *		{"source":4, "target":5, "value":"expand"},
 *
 *		where the number after source and target point to the index location in
 *		the nodes array of the node to point to for this link
 */

var nodes = [],
	links = [];


function createArrays(data){
	var count = 0;

	for(var i = 0; i < data.length; i++){
		var item = data[i];
		console.log(item);
		var ent1 = {
			name: item.entity1,
			// 0 for entity1 and 1 for entity2 bunches up nodes
			group: 0
			//count separates each ent-rel-ent by itself
			//group: count
		};

		var ent2 = {
			name: item.entity2,
			// 0 for entity1 and 1 for entity2 bunches up nodes
			group: 0
			//count separates each ent-rel-ent by itself
			//group: count
		};

		if(nodes.indexOf(JSON.stringify(ent1)) === -1) {
			nodes.push(JSON.stringify(ent1));
			count++;
		}

		if(nodes.indexOf(JSON.stringify(ent2)) === -1){
			nodes.push(JSON.stringify(ent2));
			count++;
		}

		var index1 = nodes.indexOf(JSON.stringify(ent1));
		var index2 = nodes.indexOf(JSON.stringify(ent2));

		var rel = {
			source: index1,
			target: index2,
			value: item.relationship
		}

		links.push(rel);
	}

	for (i = 0; i < nodes.length; i++) {
		nodes[i] = JSON.parse(nodes[i]);
	}
};

d3.json('json/raw_data.json', function(data){
	createArrays(data);
	console.log(nodes);
	console.log(links);
});
