var titanAddress = 'http://everest-build:8182/graphs/graph';
var buildEdge = function(lObj){
	var outV = lObj.source;
	var inV = lObj.target;
	var query = titanAddress + 'edges';
	if ( lObj._titan_id !== undefined ) {
		query += '/' + lObj._titan_id;
	}
	
	query += '?_outV=' + outV + '&_inV=' + inV + '&';
	var keys = Object.keys(lObj);
	keys.forEach(function(key, i){
		if (key !== 'html' && key !== '_titan_id' && key !== 'source' && key !== 'target'){
			if (key === 'd'){
				query += '_label=' + lObj[key];
			} else {
				query += key + '=' + lObj[key];
			}
			
			query += '&';
		}
	});
	//console.log(query.replace('#', ''));
	query = query.replace('#', '');
	query = query.replace('+', 'plus');
	return query;
};

var buildNode = function(cObj){
	var query = titanAddress + 'vertices';
	
	if (cObj._titan_id !== undefined ) {
		query += '/' + cObj._titan_id;
	}
	query += '?';
	var keys = Object.keys(cObj);
	keys.forEach(function(key, i){
		if (key !== 'html' && key !== '_titan_id' && key !== 'x' && key !== 'y'){
			if (key === 'd'){
				query += 'name=' + cObj[key];
			} else {
				query += key + '=' + cObj[key];
			}
			
			query += '&';
		}
	});
	//console.log(query.replace('#', ''));
	query = query.replace('#', '');
	query = query.replace('+', 'plus');
	return query;
};

var getAllEdges = function(){
	return titanAddress + 'tp/gremlin?script=g.E';
};

var getAllVertices = function(){
	return titanAddress + 'tp/gremlin?script=g.V';
};

var buildKeyValueQuery = function(key, value, start, end){
	start = start === undefined ? 0 : start;
	end = end === undefined ? start + 10 : end;
	return titanAddress+'/tp/gremlin?script=g.V.has("' + key + '","' + value + '")[' + start + '..' + end + ']';
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

var getVertexById = function(id){
	return titanAddress+'/tp/gremlin?script=g.v(' + id + ')';
};

var getAssertionsById = function(id){
	return titanAddress+'/tp/gremlin?script=g.v(' + id + ').inE.outV.inE.outV.path';
};

var getMatchingVertices = function(id, array){
	var query = titanAddress+'/tp/gremlin?script=g.v(' + id + ').inE.outV.or(';
	array.forEach(function(d){
		query += '_().has("name","' + d + '"),';
		
	});
	query = query.substring(0, query.length - 1) + ')';
	return query;
};

var getMatchingEdges = function(id, array){
	var query = titanAddress+'/tp/gremlin?script=g.v(' + id + ').inE.outV.inE.or(';
	array.forEach(function(d){
		query += '_().has("label","' + d + '"),';
	});
	query = query.substring(0, query.length - 1) + ')';
	return query;
};

var getMatchingOrientation = function(id, array){
	var query = titanAddress+'/tp/gremlin?script=g.v(' + id + ').inE.outV.or(';
	array.forEach(function(d){
		query += '_().has("name","' + d[0].name + 
			'").inE.has("label","' + d[1]._label + 
			'").outV.has("name","' + d[2].name + '"),'
	});
	return query.substr(0, query.length - 1) + ')';
};