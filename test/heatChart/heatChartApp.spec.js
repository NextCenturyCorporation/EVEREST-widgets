describe("Testing the HeatChartApp object", function() {

	it('does app things', function() {

		// Create a mock for the ajax data retrieval
        dataInject = new HeatChartData();
        dataInject._GET = function(url, successCallback, failureCallback) {
            data = [1374261832200, 1374261832200, 1374261832200, 1374261832400, 1374261833000, 1374261842000, 
                    1374261932000, 1374261932000, 1374261934000, 1374262832000, 1374262833000, 1376940232200];
            setTimeout(function(){
                successCallback(data);
            }, 0);
        };
		spyOn(dataInject, 'fetch').andCallThrough();

		app = new HeatChartApp('year', dataInject);
		expect(app).toBeTruthy();
		expect(dataInject.fetch).toHaveBeenCalled();

		// Set the chart to Jul 19 and verify the correct four chunks
		app.setChartRange(1374206400000, "day", function(time_chunks){
			expect(time_chunks.length).toEqual(24*60);
			expect(time_chunks[19+23*24]).toEqual({title:"Fri Jul 19 2013 19:23:00 GMT-0400 (Eastern Daylight Time)", value:5});
			expect(time_chunks[19+24*24]).toEqual({title:"Fri Jul 19 2013 19:24:00 GMT-0400 (Eastern Daylight Time)", value:1});
		});


	});

});