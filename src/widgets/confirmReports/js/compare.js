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

var scores = {};

var compareVertexAmount = function(id1, id2){
	$.ajax({
		type: 'GET',
		url: getGroupVertexCountById(id1),
		dataType: 'application/json',
		success: function(r){ 
			//console.log('success');
		},
		error: function(e){
			var ar_length = JSON.parse(e.responseText).results[0];	
			//console.log("The Left Graph vertex length: " + ar_length);				
			$.ajax({
				type: 'GET',
				url: getGroupVertexCountById(id2),
				dataType: 'application/json',
				success: function(r){ 
					//console.log('success');
				},
				error: function(e){
					var te_length = JSON.parse(e.responseText).results[0];
					//console.log("The Right Graph vertex length: " + te_length);
					
					if (te_length === ar_length){
						$(scores[id1]).find('.true').append('<li id="1">There are the same number of vertices</li>');
					} else {
						$(scores[id1]).find('.false').append('<li id="1">There are a different number of vertices</li>');
					}
				}
			});
		}
	});
};

var compareEdgeAmount = function(id1, id2){
	$.ajax({
		type: 'GET',
		url: getGroupEdgeCountById(id1),
		dataType: 'application/json',
		success: function(r1){ 
			//console.log('success');
		},
		error: function(e){
			var ar_length = JSON.parse(e.responseText).results[0];
			//console.log("The Left Graph edge length: " + ar_length);			
			$.ajax({
				type: 'GET',
				url: getGroupEdgeCountById(id2),
				dataType: 'application/json',
				success: function(r){ 
					//console.log('success');
				},
				error: function(e){
					var te_length = JSON.parse(e.responseText).results[0];
					//console.log("The Right Graph edge length: " + te_length);
					if (te_length === ar_length){
						$(scores[id1]).find('.true').append('<li id="1">There are the same number of edges</li>');
					} else {
						$(scores[id1]).find('.false').append('<li id="1">There are a different number of edges</li>');
					}
				}
			});
		}
	});
};

//second ajax query unnecessary if following a match vertex length
var compareVertices = function(id1, id2){
	$.ajax({
		type: 'GET',
		url: getVertexNamesById(id1),
		dataType: 'application/json',
		success: function(r1){ 
			//console.log('success');
		},
		error: function(e){
			var ar_names = JSON.parse(e.responseText).results;
			var unique_ar = getUnique(ar_names);
			
			//console.log("The Left Graph vertex names: ");
			//console.log(ar_names);
			$.ajax({
				type: 'GET',
				url: getMatchingVertices(id2, ar_names),
				dataType: 'application/json',
				success: function(r){ 
					//console.log('success');
				},
				error: function(e){
					var te_matches = JSON.parse(e.responseText).results;
					var unique_te = getUniqueObjectArray(te_matches);
					//console.log("The Right Graph vertex matches: ");
					//console.log(te_matches);
					/*if (unique_te.length === unique_ar.length){
						$(scores[id1]).find('.true').append('<li id="1">The Left Graph vertices are subset of The Right Graph</li>');
					//} else if (te_matches.length > 0) {
					//	$(scores[id1]).find('.true').append('<li id="1">Some of The Left Graph vertices match those of The Right Graph</li>');
					} else {
						$(scores[id1]).find('.false').append('<li id="1">The Left Graph vertices are not subset of The Right Graph</li>');
						//$(scores[id1]).find('.false').append('<li id="1">None of The Left Graph vertices match those of The Right Graph</li>');
					}*/
					var score = te_matches.length / ar_names.length;
					console.log(score);
					
					if (score > 0){
						$(scores[id1]).find('.true').append('<li id=' + score + '>The Left Graph vertices are subset of The Right Graph</li>');
					} else {
						$(scores[id1]).find('.false').append('<li id="1">None of The Left Graph vertices match those of The Right Graph</li>');
					}
				}
			});
		}
	});
	
	$.ajax({
		type: 'GET',
		url: getVertexNamesById(id2),
		dataType: 'application/json',
		success: function(r1){ 
			//console.log('success');
		},
		error: function(e){
			var te_names = JSON.parse(e.responseText).results;
			var unique_te = getUnique(te_names);
			//console.log("The Right Graph vertex names: ");
			//console.log(te_names);
			
			$.ajax({
				type: 'GET',
				url: getMatchingVertices(id1, te_names),
				dataType: 'application/json',
				success: function(r){ 
					//console.log('success');
				},
				error: function(e){
					var ar_matches = JSON.parse(e.responseText).results;
					var unique_ar = getUniqueObjectArray(ar_matches);
					//console.log("The Left Graph vertex matches: ");
					//console.log(ar_matches);
					/*if (unique_ar.length === unique_te.length){
						$(scores[id1]).find('.true').append('<li id="1">The Right Graph vertices are subset of The Left Graph</li>');
					//} else if (ar_matches.length > 0 ){
					//	$(scores[id1]).find('.true').append('<li id="1">Some of The Right Graph vertices match those of The Left Graph</li>');
					} else {
						$(scores[id1]).find('.false').append('<li id="1">The Right Graph vertices are not subset of The Left Graph</li>');
					//	$(scores[id1]).find('.false').append('<li id="1">None of The Right Graph vertices match those of The Left Graph</li>');
					}*/
					
					var score = ar_matches.length / te_names.length;
					console.log(score);
					
					if (score > 0){
						$(scores[id1]).find('.true').append('<li id=' + score + '>The Right Graph vertices are subset of The Left Graph</li>');
					} else {
						$(scores[id1]).find('.false').append('<li id="1">None of The Right Graph vertices match those of The Left Graph</li>');
					}
				}
			});
		}
	});
};

//second ajax query unnecessary if following a match edge length
var compareEdges = function(id1, id2){
	$.ajax({
		type: 'GET',
		url: getEdgeLabelsById(id1),
		dataType: 'application/json',
		success: function(r1){ 
			//console.log('success');
		},
		error: function(e){
			var ar_labels = JSON.parse(e.responseText).results;
			//console.log("The Left Graph edge labels: ");
			//console.log(ar_labels);
			$.ajax({
				type: 'GET',
				url: getMatchingEdges(id2, ar_labels),
				dataType: 'application/json',
				success: function(r){ 
					//console.log('success');
				},
				error: function(e){
					var te_matches = JSON.parse(e.responseText).results;
					//console.log("The Right Graph edge matches: ");
					//console.log(te_matches);
					/*if (te_matches.length === ar_labels.length){
						$(scores[id1]).find('.true').append('<li id="1">The Left Graph egdes are subset of The Right Graph</li>');
					//} else if (te_matches.length > 0) {
					//	$(scores[id1]).find('.true').append('<li id="1">Some of The Left Graph egdes match those of The Right Graph</li>');
					} else {
						$(scores[id1]).find('.false').append('<li id="1">The Left Graph egdes are not subset of The Right Graph</li>');
					//	$(scores[id1]).find('.false').append('<li id="1">None of The Left Graph egdes match those of The Right Graph</li>');
					}*/
					
					var score = te_matches.length / ar_labels.length;
					console.log(score);
					
					if (score > 0){
						$(scores[id1]).find('.true').append('<li id=' + score + '>The Left Graph egdes are subset of The Right Graph</li>');
					} else {
						$(scores[id1]).find('.false').append('<li id="1">None of The Left Graph egdes match those of The Right Graph</li>');
					}
				}
			});
		}
	});
	
	$.ajax({
		type: 'GET',
		url: getEdgeLabelsById(id2),
		dataType: 'application/json',
		success: function(r1){ 
			//console.log('success');
		},
		error: function(e){
			var te_labels = JSON.parse(e.responseText).results;
			//console.log("The Right Graph edge labels: ");
			//console.log(te_labels);
			$.ajax({
				type: 'GET',
				url: getMatchingEdges(id1, te_labels),
				dataType: 'application/json',
				success: function(r){ 
					//console.log('success');
				},
				error: function(e){
					var ar_matches = JSON.parse(e.responseText).results;
					//console.log("The Left Graph edge matches: ");
					//console.log(ar_matches);
					/*if (ar_matches.length === te_labels.length){
						$(scores[id1]).find('.true').append('<li id="1">The Right Graph edges are subset of The Left Graph</li>');
					//} else if (ar_matches.length > 0){
					//	$(scores[id1]).find('.true').append('<li id="1">Some of The Right Graph egdes match those of The Left Graph</li>');
					} else {
						$(scores[id1]).find('.false').append('<li id="1">The Right Graph edges are not subset of The Left Graph</li>');
					//	$(scores[id1]).find('.false').append('<li id="1">None of The Right Graph egdes match those of The Left Graph</li>');
					}*/
					
					var score = ar_matches.length / te_labels.length;
					console.log(score);
					
					if (score > 0){
						$(scores[id1]).find('.true').append('<li id=' + score + '>The Right Graph edges are subset of The Left Graph</li>');
					} else {
						$(scores[id1]).find('.false').append('<li id="1">None of The Right Graph egdes match those of The Left Graph</li>');
					}
				}
			});
		}
	});
};

var compareOrientation = function(id1, id2){
	$.ajax({
		type: 'GET',
		url: getAssertionsById(id1),
		dataType: 'application/json',
		success: function(r1){ 
			//console.log('success');
		},
		error: function(e){
			var assertions = JSON.parse(e.responseText).results;
			
			for (var i = 0; i < assertions.length; i++){
				assertions[i] = assertions[i].slice(2, assertions[i].length);
			}
			//console.log("The Left Graph assertions: ");
			//console.log(assertions);
			
			$.ajax({
				type: 'GET',
				url: getMatchingOrientation(id2, assertions),
				dataType: 'application/json',
				success: function(r){
					//console.log('success');
				},
				error: function(e){
					var te_matches = JSON.parse(e.responseText).results;
					//console.log("The Right Graph matches: ");
					//console.log(te_matches);
					/*if (assertions.length === te_matches.length) {
						$(scores[id1]).find('.true').append('<li id="1">The Left Graph is a subset of The Right Graph</li>');
					} else {
						$(scores[id1]).find('.false').append('<li id="1">The Left Graph is not a subset of The Right Graph</li>');
					}*/
					
					var score = te_matches.length / assertions.length;
					console.log(score);
					
					if (score > 0){
						$(scores[id1]).find('.true').append('<li id=' + score + '>The Left Graph is a subset of The Right Graph</li>');
					} else {
						$(scores[id1]).find('.false').append('<li id="1">The Left Graph is not a subset of The Right Graph</li>');
					}
				}
			});
		}
	});
	
	$.ajax({
		type: 'GET',
		url: getAssertionsById(id2),
		dataType: 'application/json',
		success: function(r1){ 
			//console.log('success');
		},
		error: function(e){
			var assertions = JSON.parse(e.responseText).results;
			
			for (var i = 0; i < assertions.length; i++){
				assertions[i] = assertions[i].slice(2, assertions[i].length);
			}
			
			$.ajax({
				type: 'GET',
				url: getMatchingOrientation(id1, assertions),
				dataType: 'application/json',
				success: function(r){
					//console.log('success');
				},
				error: function(e){
					var ar_matches = JSON.parse(e.responseText).results;
					
					//console.log("The Left Graph matches: ");
					//console.log(ar_matches);
					/*if (assertions.length === ar_matches.length){
						$(scores[id1]).find('.true').append('<li id="1">The Right Graph is a subset of The Left Graph</li>');
					} else {
						$(scores[id1]).find('.false').append('<li id="1">The Right Graph is not a subset of The Left Graph</li>');
					}*/
					
					var score = ar_matches.length / assertions.length;
					console.log(score);
					
					if (score > 0){
						$(scores[id1]).find('.true').append('<li id=' + score + '>The Right Graph is a subset of The Left Graph</li>');
					} else {
						$(scores[id1]).find('.false').append('<li id="1">The Right Graph is not a subset of The Left Graph</li>');
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
		}
	});
};

var addScore = function(id){
	scores[id] = $('<div>').appendTo('#information').attr('class', 'info').attr('id', id).hide();
	$('<div>').appendTo(scores[id]).attr('class', 'true');
	$('<div>').appendTo(scores[id]).attr('class', 'false');
	$('<div>').appendTo(scores[id]).attr('class', 'score').hide();
};

var resetScores = function(){
	$('.info').remove();
	scores = {};
	return scores;
};