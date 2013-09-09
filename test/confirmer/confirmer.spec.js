describe('test the confirmer.js file', function(){
	
	var app = d3.select('body').append('div').attr('class', 'app');
	var alpha = app.append('div').attr('class', 'alpha');
	var alpha_report = alpha.append('div').attr('class', 'alpha_report');
	alpha_report.append('select').attr('class', 'alphas');
	alpha_report.append('div').attr('class', 'alpha-info');
	alpha.append('div').attr('class', 'asserts');

	var matcher = app.append('div').attr('class', 'matcher');
	var confirm = matcher.append('div').attr('class', 'confirmer');
	confirm.append('select').attr('class', 'patterns');
	confirm.append('div').attr('class', 'target-info');
	confirm.append('input').attr('class', 'percent');
	confirm.append('button').attr('class', 'confirm');
	matcher.append('div').attr('class', 'target-pattern');
	var test_confirm = new confirmer();
	
	xdescribe('test the display function', function(){
		it('for proper method call logic', function(){
			
			spyOn(d3, 'select').andCallThrough();
			spyOn(test_confirm, 'getTargetEvents').andCallThrough();
			spyOn(test_confirm, 'displayAlphaReportInfo').andCallThrough();
			spyOn(test_confirm, 'getAssertions').andCallThrough();
			jasmine.Clock.useMock();
			test_confirm.display();
			
			//waitsFor(function(){
			//	return test_confirm.alpha_reports.length > 0;
			//});
			expect(d3.select).toHaveBeenCalledWith('.alphas');
		});
	});
	
	xdescribe('test the createListeners function', function(){
		it('for proper method call logic', function(){
			spyOn(d3, 'select').andCallThrough();
			spyOn(window, 'parseFloat').andCallThrough();
			spyOn(test_confirm, 'confirmReport').andCallThrough();
			spyOn(window, 'alert').andCallThrough();
			spyOn(test_confirm, 'getTargetAssertions').andCallThrough();
			spyOn(test_confirm, 'displayAlphaReportInfo').andCallThrough();
			spyOn(test_confirm, 'getAssertions').andCallThrough();
			
			test_confirm.createListeners();
			
			expect(d3.select).toHaveBeenCalledWith('.confirm');
			expect(d3.select).toHaveBeenCalledWith('.patterns');
			expect(d3.select).toHaveBeenCalledWith('.alphas');
		});
	});
});