var url = 'http://everest-build:8081/tag?sortKey=value.count&sort=desc&count=200'
var a,b;
$(function(){
	$.ajax({
		url: url,
		type: 'GET',
		success: function(data){
			a = data.docs.map(function(d){
				return { text: d._id, count: Math.log(d.value.count) };
			});

			b = data.docs;
			createCloud(a);
		}
	});

	var createCloud = function(data){
		var w = 960;
		var h = 600;
		var fill = d3.scale.category20();

		d3.layout.cloud().size([w, h])
			.words(data)
			.rotate(function() { return ~~(Math.random() * 2) * 90; })
			.font('Impact')
			.fontSize(function(d) { 
				return d.count * 20 - 100; 
			})
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
							return (d.count * 20 - 100) + 'px'; 
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
							console.log(b[ind].value.reports)
						})
		}
	}
}());

