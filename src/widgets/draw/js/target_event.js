var isAlone = function(lines, circle) {
	var alone = true;
	lines.forEach(function(line){
		if (line.source === circle.html || line.target === circle.html ) {
			alone = false;
		}
	});
	
	return alone;
};

var createPostObj = function(obj, type){
	var out = ['html', 'source', 'target', '_id'];
	var newObj = {};
	
	var keys = Object.keys(obj);
	keys.forEach(function(k){
		if ( out.indexOf(k) === -1 ){
			if ( k === 'd' ){
				if (!type){
					newObj.value = obj[k];
				} else if (type === 'line') {
					newObj._label = obj[k];
				}
			} else if ( k === 'x' || k === 'y' ){
				newObj[k] = parseInt(obj[k], 10);
			} else {
				newObj[k] = obj[k];
			}
		}
	});
	console.log('post object');
	console.log(JSON.stringify(newObj));
	return newObj;
};

var post = function(url, obj, success) {
	//$.post( url, obj, success );
	
	$.ajax({
		type: 'POST',
		url: url,
		data: obj,
		dataType: 'application/json',
		success: function(response){
			console.log('success?');
		},
		error: function(response) {
			var data = JSON.parse(response.responseText);
			if (data.error === undefined){
				success(data);
			} else {
				console.error(data.error);
			}
		}
	});
};

var get = function(url, success) {
	//$.get( url, success );
	
	$.ajax({
		type: 'GET',
		url: url,
		dataType: 'application/json',
		success: function(response){
			console.log('success?');
		},
		error: function(response) {
			var data = JSON.parse(response.responseText);
			if (data.error === undefined){
				success(data);
			} else {
				console.error(data.error);
			}
		}
	});
};

var target_event_widget = function(draw, map){
	var me = this;
	var assertion_url = 'http://everest-build:8081/event-assertion/';
	var event_url = 'http://everest-build:8081/target-event/';
	var titan_url = 'http://everest-build:8081/titan-graph/';
	var subscribe = 'com.nextcentury.everest.data_table_announce.target-event';
	
	owfdojo.addOnLoad(function(){
		OWF.ready(function(){
			OWF.Eventing.subscribe(subscribe, function(sender, msg) {
				var data = JSON.parse(msg);
				if (data._id) {
					me.loadState(data._id);
				}
			});
		});
	});
	
	me.state = {
		name: '',
		description: '',
		event_horizon: [],
		place: [],
		tags: [],
		assertions: []
	};
	
	me.target_event = {
		name: 'target event',
		type: 'metadata'
	};
	
	me.metadata = [];
	
	me.initialize = function() {
		draw.setUpToolbars();
		draw.createCanvas();
		draw.createClickers();
		
		map.initialize();
		
		$('#draw-tabs a').click(function(e) {
			e.preventDefault();
			$(this).tab('show');
			map.resize();
		});
		
		me.createListeners();
		
		me.loadMetadataIDs();
	};
	
	me.createListeners = function(){
		d3.select('#save_target').on('click', function(){
			var state = draw.getState();
			me.saveState(state);
		});
		
		d3.select('#metadata-select').on('change', function(){
			var elem = $(this)[0];
			var elem_id = elem.options[elem.selectedIndex].id;
			me.loadState(elem_id);
		});
		
		d3.select('.draw-info').on('click', function(){
			alert(JSON.stringify(me.state));
		});
		
		d3.select('#new').on('click', function(){
			draw.resetCanvas();
			me.state = {
				name: '',
				description: '',
				event_horizon: [],
				place: [],
				tags: [],
				assertions: []
			};
			
			me.target_event = {
				name: 'target event',
				type: 'metadata',
				comparedTo: []
			};
		});
	};
	
	me.loadMetadataIDs = function(){
		get(event_url, function(data) {
			data.docs.forEach(function(e) {
				var str = "Target Event " + e.name;
				d3.select('#metadata-select').append('li')
					.attr('id', e._id).append('a')
						.attr('xlink:href', '#')
						.text(str)
						.on('click', function(){
							me.loadState(e._id);
						});
			});
		});
	};
	
	me.loadState = function(target_event_id) {
		get(event_url + target_event_id, function(event){
			var assert_ids = event.assertions;
			var json = {
				assertions: [],
				singletons: []
			};
			
			assert_ids.forEach(function(d){
				get(assertion_url + d, function(assertion) {
					if (assertion.entity2) {
						json.assertions.push(assertion);
					} else {
						json.singletons.push(assertion);
					}
					
					draw.redraw(json);
				});
			});
		});
	};
	
	me.saveState = function(obj) {
		post( titan_url + 'vertices/', me.target_event, function(r){
			me.target_event._titan_id = r._titan_id;
			me.state.name = r._titan_id;
			
			me.saveEventAssertions(obj.circles, obj.lines);
		});
		
		setTimeout(me.saveTargetEvent, 2500);
	};

	me.saveEventAssertions = function(circles, lines) {		
		lines.forEach(function(line){
			var tempUrl = assertion_url;
			var cObj1 = null;
			var cObj2 = null;
			
			circles.forEach(function(circle) {
				if ( circle.html === line.source ) {
					cObj1 = circle;
					cObj1.type = 'entity1';
				}
				
				if ( circle.html === line.target ) {
					cObj2 = circle;
					cObj2.type = 'entity2';
				}
			});
			
			if ( cObj1 !== null && cObj2 !== null ) {
				var postData = {
					name: cObj1.d + ' ' + line.d + ' ' + cObj2.d,
					description: "",
					entity1: [createPostObj(cObj1)],
					relationship: [createPostObj(line)],
					entity2: [createPostObj(cObj2)]
				};
				
				//me.state.name += postData.name + " ";
				
				//post entire target assertion to mongo
				post( tempUrl, postData, function(r) {
					console.log(r);
					cObj1._id = r._id;
					cObj2._id = r._id;
					line._id = r._id;
					
					me.state.assertions.push(r._id);
					me.saveAssertionToTitan(cObj1, cObj2, line);
				});
			}
		});
		
		circles.forEach(function(circle){
			var tempUrl = assertion_url;
			if ( isAlone(lines, circle) ) {
				circle.type = 'entity1';
				var postData = {
					name: circle.d,
					description: "",
					entity1: [createPostObj(circle)]
				};
				
				post( tempUrl, postData, function(r){
					circle._id = r._id;
					me.state.assertions.push(r._id);
				});
				
				saveCircleToTitan(circle);
			}
		});
	};
	
	me.saveTargetEvent = function(circles, lines) {
		var tempUrl = event_url;
		me.state.place = [map.getState()];
		post( tempUrl, createPostObj(me.state), function(r) {
			me.state._id = r._id;
		});
	};

	me.saveAssertionToTitan = function(c1, c2, l) {
		me.saveCircleToTitan(c1, function(id){
			l.source_id = id;
			me.saveCircleToTitan(c2, function(id){
				l.target_id = id;
				me.saveLineToTitan(l);
			});
		});
	};

	me.saveCircleToTitan = function(circle, callback) {
		//timeout allows circle to get its titan_id so it doesn't get added multiple times
		setTimeout( function(){
			if (circle._titan_id) {
				callback(circle._titan_id);
			} else {
				var postCircle = {
					name: circle.d,
					type: circle.type,
					class: circle.class,
					color: circle.color,
					group: circle.group
				};
	
				post( titan_url + 'vertices/', postCircle, function(r) {
					console.log(r);
					circle._titan_id = r._titan_id;
					var edge = {
						_label: 'metadata of',
						target_id: me.state.name,
						source_id: r._titan_id
					};
					
					console.log(edge);
					if (callback) {
						callback(r._titan_id);
					}
					
					post( titan_url + 'edges/', edge, function(r) {
						console.log(r);
					});
				});
			}
		}, 1000);
	};
	
	me.saveLineToTitan = function(line){
		setTimeout(function(){
			if (line._titan_id) {
				console.log("Assertion already exists");
			} else {
				var postLine = {
					source_id: line.source_id,
					target_id: line.target_id,
					_label: line.d,
					class: line.class
				};
				
				post( titan_url + 'edges/', postLine, function(r) {			
					d3.select('.draw-info')
						.style('opacity', 1)
						.text("Target Event " + me.state.name + " saved to Titan")
						.transition()
						.duration(5000)
						.style('opacity', 0);
					
					OWF.Eventing.publish('com.nextcentury.everest.target-event', 'target-event');
				});
			}
		}, 1000);
	};
};