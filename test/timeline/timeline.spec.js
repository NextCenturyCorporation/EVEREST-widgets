var datas = [1387959625000,1353282133000,1344038600000,1340092813000,1364656027000,1374508754000,1369841743000,
1355628308000,1400766482000,1369750279000,1384007456000,1374537060000,1389253430000,1348952488000,1345639741000,
1360665027000,1386572893000,1367971646000,1386992323000,1396551843000,1386486489000,1375609067000,1353890516000,
1353894116000,1353894176000,1376947286000,1355568202000,1347417294000,1363393012000,1370126240000,1346421623000];	


describe('Test src/widgets/timeline/js/testing.js base functions', function(){
	
	describe('Tests the add function', function(){
	
		it('Tests add method call logic', function(){
			spyOn(d3, 'selectAll').andCallThrough();
			spyOn(d3, 'select').andCallThrough();
	
			add();
	
			//if select and selectAll were called with correct params
			expect(d3.selectAll).toHaveBeenCalledWith('th');
			expect(d3.select).toHaveBeenCalledWith('#submit');
			expect(d3.select).toHaveBeenCalledWith('#reset');
		});
	});
});