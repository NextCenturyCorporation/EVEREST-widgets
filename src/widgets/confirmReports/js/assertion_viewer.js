var confirmer = function(){
	var me = this;
	var url = 'http://everest-build:8081/';
	me.alpha_reports = [];
	me.assertions = [];

	me.createListeners = function(){			
		d3.select('.alphas').on('change', function(){
			var elem = $(this)[0];
			var elem_id = elem.options[elem.selectedIndex].text;
			
			for (var i = 0; i < me.alpha_reports.length; i++){
				if (me.alpha_reports[i]._id === elem_id){
					d3.selectAll('.alpha-text').remove();
					d3.select('.alpha-info').append('div')
						.attr('class', 'alpha-text')
							.append('text')
							.text(JSON.stringify(me.alpha_reports[i]));
				}
			}
			me.getAssertions(elem_id);
		});
	};
	
	me.getAlphaReports = function(){
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
	
	me.getAssertions = function(ar_id){
		$.getJSON(url +'assertion/?callback=?', function(asserts){
			me.assertions = asserts;
			var assertions = [];
			for (var i = 0; i < asserts.length; i++){
				if (asserts[i].alpha_report_id === ar_id){
					assertions.push(asserts[i]);
				}
			}
			
			d3.select('.assertion-graph').remove();
			d3.select('.target-graph').remove();
			
			var svg = d3.select('.asserts').append('svg')
				.attr('class', 'assertion-graph')
				.attr('width', 490)
				.attr('height', 490);
			
			var svg1 = d3.select('.target-pattern').append('svg')
				.attr('class', 'target-graph')
				.attr('width', 490)
				.attr('height', 490);
				
			if (assertions.length !== 0){			
				//display assertions
				var net = new network(svg, assertions, true);
				
				net.draw();
				net.draw({}, { entity1: "A", relationship: "E", entity2: "B" });
				net.draw({}, { entity1: "b", relationship: "e", entity2: "c" });
				net.draw({}, { entity1: "b", relationship: "e", entity2: "f" });
				net.draw({}, { entity1: "B", relationship: "E", entity2: "C" });
				
				//display assertions
				var net1 = new network(svg1, assertions, false);
				net1.draw();
				net1.draw({}, { entity1: "A", relationship: "E", entity2: "B" });
				net1.draw({}, { entity1: "B", relationship: "E", entity2: "C" });
				//net1.draw({}, { entity1: "a", relationship: "e", entity2: "a" });
				net1.draw({}, { entity1: "d", relationship: "e", entity2: "b" });
			} 
		});
	};
	
	me.getTargetEvents = function(){
		$.getJSON(url + 'target-event/?callback=?', function(data){
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
			d3.selectAll('.alpha-text').remove();
			d3.select('.alpha-info').append('div')
				.attr('class', 'alpha-text')
					.append('text')
					.text(JSON.stringify(ar));
			
			me.getAssertions(ar._id);
		}, 2000);
	};
};