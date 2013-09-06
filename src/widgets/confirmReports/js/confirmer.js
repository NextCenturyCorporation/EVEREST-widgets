var confirmer = function(){
	var me = this;
	var url = 'http://everest-build:8081/';
	
	me.alpha_reports = [];
	me.assertions = [];
	me.target_events = [];
	me.target_assertions = [];
		
	me.width = d3.select('.asserts').style('width').split('p')[0];
	me.height = d3.select('.asserts').style('height').split('p')[0];
	
	me.confirmed = {};
	me.curr_ar_id, me.curr_te_id;
	me.curr_assert_ids = [];
	
	me.svg_target = d3.select('.target-pattern')
		.append('svg')
		.attr('width', me.width)
		.attr('height', me.height);
	
	me.svg_asserts = d3.select('.asserts')
		.append('svg')
		.attr('width', me.width)
		.attr('height', me.height);
		
	me.te_view = new target_event_view(me.svg_target);

	me.createListeners = function(){
		d3.select('.confirm').on('click', function(){
			var d = parseFloat($('.percent').val());
			console.log(d);
			if ( isNaN(d) ){
				alert('Please enter a number in the percent field!');
				return;
			} else if ( d > 1 || d < 0){
				alert('Please enter a number between 0 and 1!');
				return;	
			} else {
				me.confirmReport();
			}
		});
		
		d3.select('.patterns').on('change', function(){
			var elem = $(this)[0];
			var elem_id = elem.options[elem.selectedIndex].text;
			me.curr_te_id = elem_id;
			me.getTargetAssertions(elem_id);
		});
		
		d3.select('.alphas').on('change', function(){
			var elem = $(this)[0];
			var elem_id = elem.options[elem.selectedIndex].text;
			me.curr_ar_id = elem_id;
			for (var i = 0; i < me.alpha_reports.length; i++){
				if (me.alpha_reports[i]._id === elem_id){
					me.displayAlphaReportInfo(me.alpha_reports[i]);
				}
			}
			me.getAssertions(elem_id);
		});
	};

	me.getAssertions = function(ar_id){
		$.getJSON(url +'assertion/?callback=?', function(asserts){
			me.assertions = asserts;
			var assertions = [];
			me.curr_assert_ids = [];
			for (var i = 0; i < asserts.length; i++){
				if (asserts[i].alpha_report_id === ar_id){
					assertions.push(asserts[i]);
					me.curr_assert_ids.push(asserts[i]._id);
				}
			}
			
			me.svg_asserts.remove();
			me.svg_asserts = d3.select('.asserts')
				.append('svg')
				.attr('width', me.width)
				.attr('height', me.height);
			
			me.svg_asserts.append('g')
				.attr('class', 'node-link-container');
					
			if (assertions.length !== 0){
				var net = new network(me.svg_asserts, assertions, false);
				net.draw();
			} 
		});
	};
	
	me.getTargetEvents = function(){
		$.getJSON(url + 'target_event/?callback=?', function(events){
			if (events[0] !== undefined){
				me.target_events = events;
				for ( var i = 0; i < events.length; i++ ) {
					d3.select('.patterns')
						.append('option')
						.text(events[i]._id);
				}
				me.curr_te_id = events[0]._id;
				me.getTargetAssertions(events[0]._id);
			}
		});
	};
	
	me.getTargetAssertions = function(event_id){
		var event;
		var maxX = -1;
		var maxY = -1;
		me.target_assertions = [];
		
		for ( var i = 0; i < me.target_events.length; i++){
			if ( me.target_events[i]._id === event_id ) {
				event = me.target_events[i];
			}
		}
		
		$.getJSON(url + 'target_assertion/?callback=?', function(asserts){
			for ( var i = 0; i < asserts.length; i++ ) {
				var a = asserts[i];
				
				if ( event.assertions.indexOf(a._id.toString()) !== -1 ) {
					me.target_assertions.push(a);
					
					maxX = Math.max(maxX, a.entity1[0].x);
					maxY = Math.max(maxY, a.entity1[0].y);
					
					if (a.entity2[0] !== undefined){
						maxX = Math.max(maxX, a.entity2[0].x);
						maxY = Math.max(maxY, a.entity2[0].y);
					}
				}
			}
			
			me.displayTargetEventInfo(event);
			me.te_view.draw(me.target_assertions, maxX, maxY);
		});
	};
	
	me.display = function(){
		$.getJSON(url + 'alpha_report/?callback=?', function(data){
			for (var i = 0; i < data.length; i++){
				d3.select('.alphas')
					.append('option')
					.text(data[i]._id);
			}
			
			me.alpha_reports = data;
		});
		me.getTargetEvents();
		
		setTimeout(function(){
			var ar = me.alpha_reports[0];
			me.displayAlphaReportInfo(ar);
			me.curr_ar_id = ar._id;
			me.getAssertions(ar._id);
		}, 1000);
	};
	
	me.confirmReport = function(){		
		me.confirmed.alpha_report_id = me.curr_ar_id;
		me.confirmed.target_event_id = me.curr_te_id;
		me.confirmed.confirmed_date = new Date();
		me.confirmed.assertions = me.curr_assert_ids;
		me.confirmed.target_event_percentage = $('.percent').val();
		
		
		$.ajax({
			type: "POST",
			url: "../../../lib/post_relay.php",
			data: JSON.stringify({url: url+'confirmed_report/', data: me.confirmed}),
			success: function(){console.log('success');},
			error: function(){console.log('error');}
		});
		
		$('.percent').val('');
	};
	
	me.displayAlphaReportInfo = function(alpha_report){
		d3.selectAll('.alpha-info text').remove();
		d3.selectAll('.alpha-info br').remove();
		
		var info = d3.select('.alpha-info');
		info.append('text')
			.text('Source name: ' + alpha_report.source_name);
		info.append('br');
		info.append('text').text('Source id: ' + alpha_report.source_id);
		info.append('br');
		info.append('text').text('Created date: ' + alpha_report.message_date);
		info.append('br');
		info.append('text').text('Message: ' + alpha_report.message_body);
	};
	
	me.displayTargetEventInfo = function(target_event){
		d3.selectAll('.target-info text').remove();
		d3.selectAll('.target-info br').remove();
		
		var info = d3.select('.target-info');
		info.append('text').text("Name: " + target_event.name);
		info.append('br');
		info.append('text').text("Description: " + target_event.description);
	};
};