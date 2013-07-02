
var datas = [1387959625000,1353282133000,1344038600000,1340092813000];	


describe('Test src/widgets/timeline/js/timeline.js base functions', function(){
	
	describe('Tests the add function', function(){
	
		it('Tests add method call logic', function(){
			spyOn(window, 'add').andCallThrough();
	
			expect(document.getElementById("container").childNodes.length).toBe(0);	
	
			add(null, datas);
	
			expect(document.getElementById("container").childNodes.length).toBe(datas.length);	

		});
	});
});
