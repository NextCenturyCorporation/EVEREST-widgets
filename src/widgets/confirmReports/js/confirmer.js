var confirmer = function(){
	var me = this;
	var url = 'http://everest-build:8081/';
	me.alpha_reports = [];
	me.assertions = [];
	
	//holder	
	me.createCanvas = function(){
		d3.select('.target-pattern').append('svg');
	};

	me.createListeners = function(){
		d3.select('.confirm').on('click', function(){
		
		});
		
		d3.select('.patterns').on('change', function(){
			var elem = $(this)[0];
			
			console.log(elem.options[elem.selectedIndex].text);
		});
		
		d3.select('.alphas').on('change', function(){
			var elem = $(this)[0];
			var elem_id = elem.options[elem.selectedIndex].text;
			
			for (var i = 0; i < me.assertions.length; i++){
				if (me.assertions[i]._id === elem_id){
					d3.selectAll('text').remove();
					d3.select('.alpha-info').append('text')
						.text(JSON.stringify(me.assertions[i]));
				}
			}
			me.getAssertions(elem_id);
		});
	};
	
	me.getAlphaReports = function(){
		/*$.getJSON(url + 'alpha_report/?callback=?', function(data){
			me.alpha_reports = data;
			for (var i = 0; i < data.length; i++){
				d3.select('.alphas')
					.append('option')
					.text(data[i]._id);
			}
		});*/
		$.ajax({
			url: url + 'alpha_report/?callback=?',
			async: false,
			success: function(result){
				me.alpha_reports = result;
			},
			dataType: 'json'
		});
		return data;
	};
	
	/*me.getAssertions = function(id){
		$.getJSON(url + 'assertion/?callback=?', function(data){
			for (var i = 0; i < data.length; i++){
				console.log(data[i].alpha_report_id);
				if (data[i].alpha_report_id === id){
					me.assertions.push(data[i]);
				}
			}
		});
	};*/
	
	me.getAssertions = function(ar_id){
		$.getJSON(url +'assertion/?callback=?', function(asserts){
			var assertions = [];
			for (var i = 0; i < asserts.length; i++){
				if (asserts[i].alpha_report_id === ar_id){
					assertions.push(asserts[i]);
				}
			}
			
			d3.select('.assertion-graph').remove();
			if (assertions.length !== 0){
				var svg = d3.select('.asserts').append('svg')
					.attr('class', 'assertion-graph')
					.attr('width', 490)
					.attr('height', 490);
					
				svg.append('defs').append('marker')
					.attr('id', 'Triangle')
					.attr('refX', 0).attr('refY', 3)
					.attr('markerUnits', 'strokeWidth')
					.attr('markerWidth', 100)
					.attr('markerHeight', 100)
					.attr('orient', 'auto')
					.append('svg:path')
						.attr('d', 'M 0 0 L 6 3 L 0 6 z');
						
				//display assertions
				var net = new network(svg, assertions, 'disjoint');
				net.draw();
				net.draw({}, { entity1: "A", relationship: "E", entity2: "B" });
			} 
		});
	};
	
	me.getTargetEvents = function(){
		$.getJSON(url + 'target_event/?callback=?', function(data){
			me.target_events = data;
			for (var i = 0; i < data.length; i++){
				d3.select('.patterns')
					.append('option')
					.text(data[i]._id);
			}
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
		
		setTimeout(function(){
			//grab an alpha report
			var ar = me.alpha_reports[0];
			
			//display alpha report
			d3.select('.alpha-info').append('text')
				.text(JSON.stringify(ar));
			
			me.getAssertions(ar._id);
		}, 2000);
	};
};