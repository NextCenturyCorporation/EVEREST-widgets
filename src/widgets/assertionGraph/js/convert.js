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
var count = 0;
function indexOfCircle(item, array){
	for (var i = 0; i < array.length; i++){
		if (item.value === array[i].value && item.group === array[i].group){
			return i;
		}
	}
	return -1;
}

function indexOfLink(item, array){
	for (var i = 0; i < array.length; i++){
		console.log(array[i]);
		if (item.value === array[i].value && item.source === array[i].source.index
				&& item.target === array[i].target.index){
			return i;
		}
	}
	return -1;
}

function createArrays(nodes, links, msg, mode){
	var data = [];

	data.push(msg);

	for(var i = 0; i < data.length; i++){
		var item = data[i];
		var ent1 = {
			value: item.entity1
		};
		
		ent1.group = mode === 'disjoint' ? count : 1;

		var ent2 = {
			value: item.entity2
		};

		ent2.group = mode === 'disjoint' ? -(count+1) : -1;

		if(indexOfCircle(ent1, nodes) === -1) {
			nodes.push(ent1);
			count++;
		} 

		if(indexOfCircle(ent2, nodes) === -1){
			nodes.push(ent2);
			count++;
		}

		var index1 = indexOfCircle(ent1, nodes);
		var index2 = indexOfCircle(ent2, nodes);

		var rel = {
			source: index1,
			target: index2,
			value: item.relationship
		};

		console.log(rel);
		if (indexOfLink(rel, links) === -1){
			links.push(rel);
		}
	}
	
	return [nodes, links];
}
