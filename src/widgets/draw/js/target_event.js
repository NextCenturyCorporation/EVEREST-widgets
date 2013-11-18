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
				newObj[k + 'loc'] = parseInt(obj[k], 10);
			} else {
				newObj[k] = obj[k];
			}
		}
	});
	console.log(newObj);
	return newObj;
};

var post = function(url, obj, success) {
	$.post( url, obj, success );
	
	/*$.ajax({
		url: url,
		data: obj,
		success: success,
		error: function(error){
			console.log(error);
		}
	});*/
};

var target_event_widget = function(draw, map){
	var me = this;
	
	var assertion_url = 'http://everest-build:8081/target-assertion/';
	var event_url = 'http://everest-build:8081/target-event/';
	var titan_url = 'http://localhost:8081/titan-graph/';
	
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
			post( titan_url + 'vertices/', createPostObj(circle), function(r){
				var cObj = circles[indexOfObj(circles, r.value, 'd')];
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
			if ( line._titan_id === undefined ) {
				var cSvg1 = d3.select(line.source);
				var cSvg2 = d3.select(line.target);
				
				var cInd1 = indexOfObj(circles, cSvg1.attr('class'), 'class');
				var cInd2 = indexOfObj(circles, cSvg2.attr('class'), 'class');
				
				line.source_id = circles[cInd1]._titan_id;
				line.target_id = circles[cInd2]._titan_id;
				
				post( titan_url + 'edges/', createPostObj(line, 'line'), function(r){
					var lObj = lines[indexOfObj(lines, r.class,	'class')];
					lObj._titan_id = r._titan_id;
					
					d3.select('.draw-info')
						.style('opacity', 1)
						.text("Target event saved to Titan")
						.transition()
						.duration(5000)
						.style('opacity', 0);
					
					OWF.Eventing.publish('com.nextcentury.everest.target-event', 'target-event');
				});
			}
		});
	};
};