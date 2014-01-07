var url = 'http://everest-build:8081/tag?sortKey=value.count&sort=desc&count=300'
var a,b;

var getFontSize = function(x1, x2, value){
	var y1 = 100;
	var y2 = 20;

	if (x1 === x2) {
		return value;
	}

	var c1 = Math.log(y1/y2)/(x1 - x2);
	var c2 = y1 / Math.exp(c1 * x1);

	return c2 * Math.exp(value * c1)
};

var announce = function(str) {
	if(OWF.Util.isRunningInOWF()) {

	    OWF.ready(function() {
	        OWF.Eventing.publish('com.nextcentury.everest.tagCloud', str);
	    });
	}
}

$(function(){
	$.ajax({
		url: url,
		type: 'GET',
		success: function(data) {
			var firstCount = data.docs[0].value.count;
			var lastCount = data.docs[data.docs.length - 1].value.count;
			a = data.docs.map(function(d){
				return { text: d._id, count: getFontSize(firstCount, lastCount, d.value.count) };
			});

			b = data.docs;
			createCloud(a);
		}
	});

	var createCloud = function(data) {
		var w = 960;
		var h = 600;
		var fill = d3.scale.category20b();

		d3.layout.cloud().size([w, h])
			.words(data)
			.rotate(function() { return ~~(Math.random() * 2) * 90; })
			.font('Impact')
			.fontSize(function(d) { return d.count; })
			.on('end', draw)
			.start();

		function draw(words) {
			var count = 0;
			d3.select('body').append('svg')
				.attr('width', w).attr('height', h)
				.append('g')
					.attr('transform', 'translate(480, 300)')
				.selectAll('text')
					.data(words)
					.enter().append('text')
						.style('font-size', function(d) { 
							return d.count + 'px'; 
						})
						.style('font-family', 'Impact')
						.style('fill', function(d, i) { return fill(i); })
						.attr('text-anchor', 'middle')
						.attr('transform', function(d){
							return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
						})
						.text(function(d) { return d.text; })
						.on('click', function(){
							var ind = b.map(function(e){return e._id}).indexOf(d3.select(this).text());
							console.log(b[ind].value.reports);
							announce(b[ind].value.reports)
						})
		}
	}
}());

