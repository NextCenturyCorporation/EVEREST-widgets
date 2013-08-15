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

function getCircle(item, array){
	var cs = [];
	for (var i = 0; i < array.length; i++){
		if (item.value.toLowerCase() === array[i].value){
			cs.push(array[i]);
		}
	}
	return cs;
}

function indexOfCircle(item, array, mode){
	for (var i = 0; i < array.length; i++){
		if (mode === 'disjoint'){
			if (item.value === array[i].value 
					&& item.ent === array[i].ent
					&& item.group === array[i].group){
				return i;
			}
		} else {
			if (item.value === array[i].value 
					&& item.ent === array[i].ent){
				return i;
			}
		}
	}
	return -1;
}

function indexOfLink(item, array){
	for (var i = 0; i < array.length; i++){
		if (item.value === array[i].value && item.source === array[i].source.index
				&& item.target === array[i].target.index){
			return i;
		}
	}
	return -1;
}

function indexOfMessage(item, links, circles){	
	for (var i = 0; i < links.length; i++){
		var a = links[i];
		if (typeof(a.source) === 'object'){
			if (a.source.value === item.entity1.toLowerCase() 
					&& a.target.value == item.entity2.toLowerCase()
					&& a.value === item.relationship.toLowerCase()){
				return i;		
			}
		} else {
			if (circles[a.source].value === item.entity1.toLowerCase()
				 && circles[a.target].value === item.entity2.toLowerCase()
				 && a.value === item.relationship.toLowerCase()){
				return i;	
			}
		}
	}
	return -1;
}

function addNewAssertion(nodes, links, msg, mode){
	if(indexOfMessage(msg, links, nodes) === -1){
		var ent1 = { 
			value: msg.entity1.toLowerCase(),
			ent: 'entity1',
			group: count
		};
				
		var ent2 = { 
			value: msg.entity2.toLowerCase(),
			ent: 'entity2',
			group: count+1
		};
		
		var nodes1 = getCircle(ent1, nodes);
		
		if(nodes1.length === 0){
			nodes.push(ent1);
			count++;
		} else if (mode === 'disjoint'){
			nodes.push(ent1);
			count++;
		} else {			
			if (nodes1[0].ent !== ent1.ent){
				nodes1[0].ent = 'both';
				ent1.ent = 'both';
			}
		}
			
		var nodes2 = getCircle(ent2, nodes);
		
		if(nodes2.length === 0){
			nodes.push(ent2);
			count++;
		} else if (mode === 'disjoint'){
			nodes.push(ent2);
			count++;
		} else {			
			if (nodes2[0].ent !== ent2.ent){
				
				nodes2[0].ent = 'both';
				ent2.ent = 'both';
			}
		}
	
		var index1 = indexOfCircle(ent1, nodes, mode);
		var index2 = indexOfCircle(ent2, nodes, mode);
	
		var rel = {
			source: index1,
			target: index2,
			value: msg.relationship.toLowerCase()
		};
	
		if (indexOfLink(rel, links) === -1){
			links.push(rel);
		}
	}
	return [nodes, links];
}