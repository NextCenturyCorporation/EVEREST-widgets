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
					console.log('There are the same number of vertices: ');
					console.log(te_length === ar_length);
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
					console.log('There are the same number of edges: ');
					console.log(te_length === ar_length);
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
					console.log('Alpha Report vertices are subset of Target Event: ');
					console.log(te_matches.length === ar_names.length);
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
					console.log('Target Event vertices are subset of Alpha Report: ');
					console.log(ar_matches.length === te_names.length);
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
					console.log('Alpha Report egdes are subset of Target Event: ');
					console.log(te_matches.length === ar_labels.length);
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
					console.log('Target Event edges are subset of Alpha Report: ');
					console.log(ar_matches.length === te_labels.length);
				}
			});
		}
	});
};