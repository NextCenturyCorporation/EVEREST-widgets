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
			console.log(data);
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
	
	var assertion_url = 'http://everest-build:8081/target-assertion/';
	var event_url = 'http://everest-build:8081/target-event/';
	var titan_url = 'http://everest-build:8081/titan-graph/';
	
	var url = 'http://everest-build:8081/target-event';
	var announce = 'com.nextcentury.everest.data_table_announce.target-event';
	var timeline = 'com.nextcentury.everest.timeline_announcing';
	var workflow = 'com.nextcentury.everest.data.workflow';
	var target_event_widget = new table_widget(url, announce, timeline, workflow, 'TargetEvent');
	target_event_widget.execute();

	owfdojo.addOnLoad(function(){
		OWF.ready(function(){
			OWF.Eventing.subscribe(announce, function(sender, msg) {
				var data = JSON.parse(msg);
				console.log(data);
				if (data._id) {
					$.ajax({
						type: 'GET',
						url: event_url + data._id,
						dataType: 'application/json',
						success: function(r){
							console.log('success');
							console.log(r);
						},
						error: function(e){
							console.log('error');
							var te = JSON.parse(e.responseText);
							console.log(te);
							
							var assert_ids = te.assertions;
							var json = {
								assertions: [],
								singletons: []
							};
							
							assert_ids.forEach(function(d){
								$.ajax({
									type: 'GET',
									url: assertion_url + d,
									dataType: 'application/json',
									success: function(r){
										console.log('success');
										console.log(r);
									},
									error: function(e){
										var assertion = JSON.parse(e.responseText);
										console.log(assertion);
										
										if (assertion.entity2) {
											json.assertions.push(assertion);
										} else {
											json.singletons.push(assertion);
										}
										
										draw.redraw(json);
									}
								});
							});
							
						}
					});
				}
			});
		});
	});
	
	me.state = {
		name: new Date().getTime().toString(),
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
	
	me.initialize = function() {
		draw.setUpToolbars();
		draw.createCanvas();
		draw.createClickers();
		
		d3.select('#save_target').on('click', function(){
			var state = draw.getState();
			me.saveState(state);
		});
		
		map.initialize();
		
		$('#draw-tabs a').click(function(e) {
			e.preventDefault();
			$(this).tab('show');
			map.resize();
		});
		
		$('.draw-info').click(function(){
			alert(JSON.stringify(me.state));
		});
	};
	
	me.saveState = function(obj) {
		me.saveTargetAssertions(obj.circles, obj.lines);
		setTimeout(me.saveTargetEvent, 2500);
		setTimeout(function(){
			me.saveTargetEventToTitan(obj.circles, obj.lines);
		}, 2500);
	};

	me.saveTargetAssertions = function(circles, lines) {		
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
				
				console.log(JSON.stringify(postData));
				post( tempUrl, postData, function(r) {
					console.log(r);
					cObj1._id = r._id;
					cObj2._id = r._id;
					line._id = r._id;
					
					me.state.assertions.push(r._id);
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
	
	me.saveTargetEventToTitan = function(circles, lines){
		console.log(me.target_event);
		post( titan_url + 'vertices/', me.target_event, function(r){
			me.target_event._titan_id = r._titan_id;
			me.state._titan_id = r._titan_id;
			
			me.saveCirclesToTitan(circles, me.target_event._titan_id);
			setTimeout(function(){
				me.saveLinesToTitan(circles, lines);
			}, 2000);
		});
	};

	me.saveCirclesToTitan = function(circles, m_id){
		circles.forEach(function(circle) {
		
			var postCircle = {
				name: circle.d,
				type: circle.type,
				class: circle.class,
				color: circle.color
			};
			
			post( titan_url + 'vertices/', postCircle, function(r) {
				var cObj = circles[indexOfObj(circles, r.name, 'd')];
				cObj._titan_id = r._titan_id;
				
				var edge = {
					_label: 'metadata of',
					target_id: m_id,
					source_id: cObj._titan_id
				};
				
				post( titan_url + 'edges/', edge, function(r){ console.log(r) });
			});		
		});
	};
	
	me.saveLinesToTitan = function(circles, lines){
		lines.forEach(function(line){
			var cSvg1 = d3.select(line.source);
			var cSvg2 = d3.select(line.target);
			
			var cInd1 = indexOfObj(circles, cSvg1.attr('class'), 'class');
			var cInd2 = indexOfObj(circles, cSvg2.attr('class'), 'class');
			
			line.source_id = circles[cInd1]._titan_id;
			line.target_id = circles[cInd2]._titan_id;
			
			var postLine = {
				source_id: circles[cInd1]._titan_id,
				target_id: circles[cInd2]._titan_id,
				_label: line.d,
				class: line.class
			};
			
			post( titan_url + 'edges/', postLine, function(r){
				var lObj = lines[indexOfObj(lines, r.class,	'class')];
				lObj._titan_id = r._titan_id;
				
				d3.select('.draw-info')
					.style('opacity', 1)
					.text("Target Event " + me.state._titan_id + " saved to Titan")
					.transition()
					.duration(5000)
					.style('opacity', 0);
				
				OWF.Eventing.publish('com.nextcentury.everest.target-event', 'target-event');
			});
		});
	};
};
