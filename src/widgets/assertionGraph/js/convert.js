/** Converts a json objedt which contains the following key/value pairs:
 * {
 * 		"entity1": "false claims",
 * 		"relationship": "aggravate",
 * 		"entity2": "identity theft"
 * }
 *
 * into two arrays, nodes and links, the proper format to use the force d3
 * example:
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
 * ];
 *
 * where the number after source and target point to the index location in
 * the nodes array of the node to point to for this link
 */

var nodes = [],
    links = [];


function createArrays(msg){
	var count = 0;

	var data = [];

	data.push(msg);

	for(var i = 0; i < data.length; i++){
		var item = data[i];
		console.log(item);
		var ent1 = {
			name: item.entity1,
			group: count
			//group:0
		};

		var ent2 = {
			name: item.entity2,
			group: -(count+1)
			//group: 1
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
		};

		links.push(rel);
	}

	for (i = 0; i < nodes.length; i++) {
		nodes[i] = JSON.parse(nodes[i]);
	}
}
