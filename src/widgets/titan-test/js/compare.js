var compareVertexAmount = function(ar, te){
	$.ajax({
		type: 'GET',
		url: getGroupVertexCountById(ar),
		dataType: 'application/json',
		success: function(r){ 
			console.log('success');
		},
		error: function(e){
			var ar_length = JSON.parse(e.responseText).results[0];				
			$.ajax({
				type: 'GET',
				url: getGroupVertexCountById(te),
				dataType: 'application/json',
				success: function(r){ 
					console.log('success');
				},
				error: function(e){
					var te_length = JSON.parse(e.responseText).results[0];
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
			console.log('success');
		},
		error: function(e){
			var ar_length = JSON.parse(e.responseText).results[0];				
			$.ajax({
				type: 'GET',
				url: getGroupEdgeCountById(te),
				dataType: 'application/json',
				success: function(r){ 
					console.log('success');
				},
				error: function(e){
					var te_length = JSON.parse(e.responseText).results[0];
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
			console.log('success');
		},
		error: function(e){
			var ar_names = JSON.parse(e.responseText).results;
			
			$.ajax({
				type: 'GET',
				url: getMatchingVertices(te, ar_names),
				dataType: 'application/json',
				success: function(r){ 
					console.log('success');
				},
				error: function(e){
					var te_matches = JSON.parse(e.responseText).results;
					if (te_matches.length === ar_names.length){
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
			console.log('success');
		},
		error: function(e){
			var te_names = JSON.parse(e.responseText).results;
			
			$.ajax({
				type: 'GET',
				url: getMatchingVertices(ar, te_names),
				dataType: 'application/json',
				success: function(r){ 
					console.log('success');
				},
				error: function(e){
					var ar_matches = JSON.parse(e.responseText).results;
					if (ar_matches.length === te_names.length){
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
			console.log('success');
		},
		error: function(e){
			var ar_labels = JSON.parse(e.responseText).results;
			$.ajax({
				type: 'GET',
				url: getMatchingEdges(te, ar_labels),
				dataType: 'application/json',
				success: function(r){ 
					console.log('success');
				},
				error: function(e){
					var te_matches = JSON.parse(e.responseText).results;
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
			console.log('success');
		},
		error: function(e){
			var te_labels = JSON.parse(e.responseText).results;
			$.ajax({
				type: 'GET',
				url: getMatchingEdges(ar, te_labels),
				dataType: 'application/json',
				success: function(r){ 
					console.log('success');
				},
				error: function(e){
					var ar_matches = JSON.parse(e.responseText).results;
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
			console.log('success');
		},
		error: function(e){
			var assertions = JSON.parse(e.responseText).results;
			
			for (var i = 0; i < assertions.length; i++){
				assertions[i] = assertions[i].slice(2, assertions[i].length);
			}
			console.log(assertions);
			
			$.ajax({
				type: 'GET',
				url: getMatchingOrientation(te, assertions),
				dataType: 'application/json',
				success: function(r){
					console.log('success');
				},
				error: function(e){
					var te_matches = JSON.parse(e.responseText).results;
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
			console.log('success');
		},
		error: function(e){
			var assertions = JSON.parse(e.responseText).results;
			
			for (var i = 0; i < assertions.length; i++){
				assertions[i] = assertions[i].slice(2, assertions[i].length);
			}
			console.log(assertions);
			
			$.ajax({
				type: 'GET',
				url: getMatchingOrientation(ar, assertions),
				dataType: 'application/json',
				success: function(r){
					console.log('success');
				},
				error: function(e){
					var ar_matches = JSON.parse(e.responseText).results;
					
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