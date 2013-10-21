var titanAddress = 'http://everest-build:8182/graphs/graph';

/**
	GET
*/
var getAllEdges = function(){
	return titanAddress + '/tp/gremlin?script=g.E';
};

var getAllVertices = function(){
	return titanAddress + '/tp/gremlin?script=g.V';
};

var getEdgeById = function(id){
	return titanAddress + '/edges/' + id;
};

var getVertexById = function(id){
	return titanAddress + '/vertices/' + id;
};

var getGroupById = function(id){
	return titanAddress+'/tp/gremlin?script=g.v(' + id + ').inE.outV';
};

var getVertexNamesById = function(id){
	return titanAddress+'/tp/gremlin?script=g.v(' + id + ').inE.outV.name';
};

var getEdgeLabelsById = function(id){
	return titanAddress+'/tp/gremlin?script=g.v(' + id + ').inE.outV.inE.label';
};

var getGroupPathById = function(id){
	return titanAddress+'/tp/gremlin?script=g.v(' + id + ').inE.outV.outE.inV.path';
};

var getGroupVertexCountById = function(id){
	return titanAddress+'/tp/gremlin?script=g.v(' + id + ').inE.outV.count()';
};

var getGroupEdgeCountById = function(id){
	return titanAddress+'/tp/gremlin?script=g.v(' + id + ').inE.outV.inE.count()';
};

var getAssertionsById = function(id){
	return titanAddress+'/tp/gremlin?script=g.v(' + id + ').inE.outV.inE.outV.path';
};

var getMatchingVertices = function(id, array){
	var query = titanAddress+'/tp/gremlin?script=g.v(' + id + ').inE.outV.or(';
	array.forEach(function(d){
		query += '_().has("name","' + d + '"),';
		
	});
	if ( query.charAt(query.length - 1) === ','){
		query = query.substring(0, query.length - 1);
	}
	query += ')';
	query = query.replace(/\#/g, '');
	query = query.replace(/\+/g, '');
	query = query.replace(/\\/g, '');
	console.log(query);
	return query;
};

var getMatchingEdges = function(id, array){
	var query = titanAddress+'/tp/gremlin?script=g.v(' + id + ').inE.outV.inE.or(';
	array.forEach(function(d){
		query += '_().has("label","' + d + '"),';
	});
	
	if ( query.charAt(query.length - 1) === ','){
		query = query.substring(0, query.length - 1);
	}
	query += ')';
	query = query.replace(/\#/g, '');
	query = query.replace(/\+/g, '');
	query = query.replace(/\\/g, '');
	console.log(query);
	return query;
};

var getMatchingOrientation = function(id, array){
	var query = titanAddress+'/tp/gremlin?script=g.v(' + id + ').inE.outV.or(';
	array.forEach(function(d){
		query += '_().has("name","' + d[0].name + 
			'").inE.has("label","' + d[1]._label + 
			'").outV.has("name","' + d[2].name + '"),';
	});
	if ( query.charAt(query.length - 1) === ','){
		query = query.substring(0, query.length - 1);
	}
	query += ')';
	query = query.replace(/\#/g, '');
	query = query.replace(/\+/g, '');
	query = query.replace(/\\/g, '');
	return query;
};

var buildKeyValueCountQuery = function(key, value){
	var query = titanAddress+'/tp/gremlin?script=g.V.has("' + key + '","' + value + '").count()';
	query = query.replace(/\#/g, '');
	query = query.replace(/\+/g, '');
	query = query.replace(/\\/g, '');
	return query;
};

var buildKeyValueQuery = function(key, value, start, end){
	var query = titanAddress+'/tp/gremlin?script=g.V.has("' + key + '","' + value + '")';
	
	if ( value !== 'alpha report' && value !== 'target event'){
		query += '.outE.has("label","metadata of").inV';
	}
	
	if (start !== undefined && end !== undefined){
		query += '[' + start + '..' + end + ']';
	}
	query = query.replace(/\#/g, '');
	query = query.replace(/\+/g, '');
	query = query.replace(/\\/g, '');
	console.log(query);
	return query;
};

var getMetadataVertex = function(id){
	return titanAddress+'/tp/gremlin?script=g.v(' + id + ').outE.has("label","metadata of").inV';
};


/**
	POST / Create
*/
var buildEdge = function(lObj){
	var outV = lObj.source_id;
	var inV = lObj.target_id;
	var query = titanAddress + '/edges';
	if ( lObj._titan_id !== undefined ) {
		query += '/' + lObj._titan_id;
	}
	
	query += '?_outV=' + outV + '&_inV=' + inV + '&';
	var keys = Object.keys(lObj);
	keys.forEach(function(key){
		if (key !== 'html' && key !== '_titan_id' && key !== 'source' && key !== 'target'){
			if (key === 'd'){
				query += '_label=' + lObj[key];
			} else {
				query += key + '=' + lObj[key];
			}
			
			query += '&';
		}
	});
	query = query.replace(/\#/g, '');
	query = query.replace(/\+/g, '');
	query = query.replace(/\\/g, '');
	return query;
};

var buildNode = function(cObj){
	var query = titanAddress + '/vertices';
	
	if (cObj._titan_id !== undefined ) {
		query += '/' + cObj._titan_id;
	}
	query += '?';
	var keys = Object.keys(cObj);
	keys.forEach(function(key){
		if (key !== 'html' && key !== '_titan_id' && key !== 'x' && key !== 'y'){
			if (key === 'd'){
				query += 'name=' + cObj[key];
			} else {
				query += key + '=' + cObj[key];
			}
			
			query += '&';
		}
	});
	query = query.replace(/\#/g, '');
	query = query.replace(/\+/g, '');
	query = query.replace(/\\/g, '');
	return query;
};

/**
	POST / Update
*/
var updateVertexQuery = function(id, obj){
	return titanAddress + '/vertices/' + id + '?comparedTo=' + JSON.stringify(obj);
};