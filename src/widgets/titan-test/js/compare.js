var indexOfObj = function(ra, value, attribute){
	for (var i = 0; i < ra.length; i++){
		if (value.toLowerCase() === ra[i][attribute].toLowerCase()){
			return i;
		}
	}
	
	return -1;
};

var getUnique = function(array){
	var new_array = [];
	array.forEach(function(d){
		if (new_array.indexOf(d) === -1){
			new_array.push(d);
		}
	});
	return new_array;
};

var getUniqueObjectArray = function(array){
	var new_array = [];
	array.forEach(function(d){
		if (indexOfObj(new_array, d.name, 'name') === -1){
			new_array.push(d);
		}
	});
	return new_array;
};

var compareVertexAmount = function(ar, te){
	$.ajax({
		type: 'GET',
		url: getGroupVertexCountById(ar),
		dataType: 'application/json',
		success: function(r){ 
			//console.log('success');
		},
		error: function(e){
			var ar_length = JSON.parse(e.responseText).results[0];	
			//console.log("Alpha Report vertex length: " + ar_length);				
			$.ajax({
				type: 'GET',
				url: getGroupVertexCountById(te),
				dataType: 'application/json',
				success: function(r){ 
					//console.log('success');
				},
				error: function(e){
					var te_length = JSON.parse(e.responseText).results[0];
					//console.log("Target Event vertex length: " + te_length);
					
					if (te_length === ar_length){
						$('#true').append('<li>There are the same number of vertices</li>');
					} else {
						$('#false').append('<li>There are a different number of vertices</li>');
					}
				}
			});
		}
	});
};

var compareEdgeAmount = function(ar, te){
	$.ajax({
		type: 'GET',
		url: getGroupEdgeCountById(ar),
		dataType: 'application/json',
		success: function(r1){ 
			//console.log('success');
		},
		error: function(e){
			var ar_length = JSON.parse(e.responseText).results[0];	
			//console.log("Alpha Report edge length: " + ar_length);			
			$.ajax({
				type: 'GET',
				url: getGroupEdgeCountById(te),
				dataType: 'application/json',
				success: function(r){ 
					//console.log('success');
				},
				error: function(e){
					var te_length = JSON.parse(e.responseText).results[0];
					//console.log("Target Event edge length: " + te_length);
					if (te_length === ar_length){
						$('#true').append('<li>There are the same number of edges</li>');
					} else {
						$('#false').append('<li>There are a different number of edges</li>');
					}
				}
			});
		}
	});
};

//second ajax query unnecessary if following a match vertex length
var compareVertices = function(ar, te){
	$.ajax({
		type: 'GET',
		url: getVertexNamesById(ar),
		dataType: 'application/json',
		success: function(r1){ 
			//console.log('success');
		},
		error: function(e){
			var ar_names = JSON.parse(e.responseText).results;
			var unique_ar = getUnique(ar_names);
			
			//console.log("Alpha Report vertex names: ");
			//console.log(ar_names);
			$.ajax({
				type: 'GET',
				url: getMatchingVertices(te, ar_names),
				dataType: 'application/json',
				success: function(r){ 
					//console.log('success');
				},
				error: function(e){
					var te_matches = JSON.parse(e.responseText).results;
					var unique_te = getUniqueObjectArray(te_matches);
					//console.log("Target Event vertex matches: ");
					//console.log(te_matches);
					if (unique_te.length === unique_ar.length){
						$('#true').append('<li>Alpha Report vertices are subset of Target Event</li>');
					} else {
						$('#false').append('<li>Alpha Report vertices are not subset of Target Event</li>');
					}
				}
			});
		}
	});
	
	$.ajax({
		type: 'GET',
		url: getVertexNamesById(te),
		dataType: 'application/json',
		success: function(r1){ 
			//console.log('success');
		},
		error: function(e){
			var te_names = JSON.parse(e.responseText).results;
			var unique_te = getUnique(te_names);
			//console.log("Target Event vertex names: ");
			//console.log(te_names);
			
			$.ajax({
				type: 'GET',
				url: getMatchingVertices(ar, te_names),
				dataType: 'application/json',
				success: function(r){ 
					//console.log('success');
				},
				error: function(e){
					var ar_matches = JSON.parse(e.responseText).results;
					var unique_ar = getUniqueObjectArray(ar_matches);
					//console.log("Alpha Report vertex matches: ");
					//console.log(ar_matches);
					if (unique_ar.length === unique_te.length){
						$('#true').append('<li>Target Event vertices are subset of Alpha Report</li>');
					} else {
						$('#false').append('<li>Target Event vertices are not subset of Alpha Report</li>');
					}
				}
			});
		}
	});
};

//second ajax query unnecessary if following a match edge length
var compareEdges = function(ar, te){
	$.ajax({
		type: 'GET',
		url: getEdgeLabelsById(ar),
		dataType: 'application/json',
		success: function(r1){ 
			//console.log('success');
		},
		error: function(e){
			var ar_labels = JSON.parse(e.responseText).results;
			//console.log("Alpha Report edge labels: ");
			//console.log(ar_labels);
			$.ajax({
				type: 'GET',
				url: getMatchingEdges(te, ar_labels),
				dataType: 'application/json',
				success: function(r){ 
					//console.log('success');
				},
				error: function(e){
					var te_matches = JSON.parse(e.responseText).results;
					//console.log("Target Event edge matches: ");
					//console.log(te_matches);
					if (te_matches.length === ar_labels.length){
						$('#true').append('<li>Alpha Report egdes are subset of Target Event</li>');
					} else {
						$('#false').append('<li>Alpha Report egdes are not subset of Target Event</li>');
					}
				}
			});
		}
	});
	
	$.ajax({
		type: 'GET',
		url: getEdgeLabelsById(te),
		dataType: 'application/json',
		success: function(r1){ 
			//console.log('success');
		},
		error: function(e){
			var te_labels = JSON.parse(e.responseText).results;
			//console.log("Target Event edge labels: ");
			//console.log(te_labels);
			$.ajax({
				type: 'GET',
				url: getMatchingEdges(ar, te_labels),
				dataType: 'application/json',
				success: function(r){ 
					//console.log('success');
				},
				error: function(e){
					var ar_matches = JSON.parse(e.responseText).results;
					//console.log("Alpha Report edge matches: ");
					//console.log(ar_matches);
					if (ar_matches.length === te_labels.length){
						$('#true').append('<li>Target Event edges are subset of Alpha Report</li>');
					} else {
						$('#false').append('<li>Target Event edges are not subset of Alpha Report</li>');
					}
				}
			});
		}
	});
};

var compareOrientation = function(ar, te){
	$.ajax({
		type: 'GET',
		url: getAssertionsById(ar),
		dataType: 'application/json',
		success: function(r1){ 
			//console.log('success');
		},
		error: function(e){
			var assertions = JSON.parse(e.responseText).results;
			
			for (var i = 0; i < assertions.length; i++){
				assertions[i] = assertions[i].slice(2, assertions[i].length);
			}
			//console.log("Alpha Report assertions: ");
			//console.log(assertions);
			
			$.ajax({
				type: 'GET',
				url: getMatchingOrientation(te, assertions),
				dataType: 'application/json',
				success: function(r){
					//console.log('success');
				},
				error: function(e){
					var te_matches = JSON.parse(e.responseText).results;
					//console.log("Target Event matches: ");
					//console.log(te_matches);
					if (assertions.length === te_matches.length) {
						$('#true').append('<li>Alpha Report is a subset of Target Event</li>');
					} else {
						$('#false').append('<li>Alpha Report is not a subset of Target Event</li>');
					}
				}
			});
		}
	});
	
	$.ajax({
		type: 'GET',
		url: getAssertionsById(te),
		dataType: 'application/json',
		success: function(r1){ 
			//console.log('success');
		},
		error: function(e){
			var assertions = JSON.parse(e.responseText).results;
			
			for (var i = 0; i < assertions.length; i++){
				assertions[i] = assertions[i].slice(2, assertions[i].length);
			}
			
			//console.log("Target Event Assertions: ");
			//console.log(assertions);
			
			$.ajax({
				type: 'GET',
				url: getMatchingOrientation(ar, assertions),
				dataType: 'application/json',
				success: function(r){
					//console.log('success');
				},
				error: function(e){
					var ar_matches = JSON.parse(e.responseText).results;
					
					//console.log("Alpha Report matches: ");
					//console.log(ar_matches);
					if (assertions.length === ar_matches.length){
						$('#true').append('<li>Target Event is a subset of Alpha Report</li>');
					} else {
						$('#false').append('<li>Target Event is not a subset of Alpha Report</li>');
					}
				}
			});
		}
	});
};

var updateVertex = function(id, obj){
	$.ajax({
		type: 'POST',
		url: updateVertexQuery(id, obj),
		dataType: 'application/json',
		success: function(r){
			console.log('success');
		},
		error: function(e){
			var data = JSON.parse(e.responseText).results;
			console.log(data);
		}
	});
};