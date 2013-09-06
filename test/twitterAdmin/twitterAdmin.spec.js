describe('To test the twitter admin widget', function() {
	var admin_widget;

	var fake_data = [{"consumer_key":"1","consumer_secret":"1","access_token_key":"1","access_token_secret":"1","_id":"5228bc2a0689793124000006","active":false,"updatedDate":"2013-09-05T17:15:22.452Z","createdDate":"2013-09-05T17:15:22.452Z"}];
	var fake_data_2 = {"__v":0,"consumer_key":"a","consumer_secret":"b","access_token_key":"c","access_token_secret":"d","_id":"5229f483b2f4a94e57000008","updatedDate":"2013-09-06T15:28:03.784Z","createdDate":"2013-09-06T15:28:03.784Z"};
	var error_response = {"error":"Server error There was an error creating feed"}

	beforeEach(function() {
		//d3.select('body').attr('class', 'twitter_admin_container');
		$("body").append('<div class="twitter_admin_container"></div>');
	});

	afterEach(function() {
		$(".twitter_admin_container").remove();
	});

	describe('main panel', function() {
		describe('with no key defined', function() {
			beforeEach(function() {
				spyOn($, 'ajax').andCallFake(function(data_object) {
					data_object.success({});
				});

				admin_widget = new twitter_admin();
			});

			it('check for correct fields on itialization with no key', function() {
				expect($(".twitter_admin_container").length).toBe(1);
				admin_widget.execute();

				expect($(".api_key_container_block").length).toBe(0);

				expect($(".twitter_admin_alert").length).toBe(1);
				expect($(".twitter_admin_alert").text()).toBe('');
				expect($(".twitter_admin_sub_alert").length).toBe(1);
				expect($(".twitter_admin_sub_alert").text()).toBe('');
				expect($(".twitter_filter_form").length).toBe(1);
				expect($(".twitter_admin_form").length).toBe(1);
				expect($(".twitter_admin_buttons_div").length).toBe(1);
				expect($(".button_inner_div").length).toBe(1);
				expect($(".twitter_admin_new_key").length).toBe(1);
				expect($(".twitter_admin_new_key").is(":visible")).toBe(false);
				expect($(".twitter_admin_save_button").length).toBe(1);
				expect($(".twitter_admin_save_button").is(":visible")).toBe(true);
				expect($(".twitter_admin_cancel_button").length).toBe(1);
				expect($(".twitter_admin_cancel_button").is(":visible")).toBe(false);

				expect($(".consumer_key_field").length).toBe(1);
				expect($(".consumer_secret_field").length).toBe(1);
				expect($(".access_token_key_field").length).toBe(1);
				expect($(".access_token_secret_field").length).toBe(1);
			});
		});

		describe('with key defined', function() {
			beforeEach(function() {
				spyOn($, 'ajax').andCallFake(function(data_object) {
					data_object.success(fake_data);
				});

				admin_widget = new twitter_admin();
			});

			it('check for correct fields on itialization with key', function() {
				expect($(".twitter_admin_container").length).toBe(1);
				admin_widget.execute();

				//expect($(".api_key_container_block").length).toBe(1);

				expect($(".twitter_admin_alert").length).toBe(1);
				expect($(".twitter_admin_alert").text()).toBe('');
				expect($(".twitter_admin_sub_alert").length).toBe(1);
				expect($(".twitter_admin_sub_alert").text()).toBe('');
				expect($(".twitter_filter_form").length).toBe(1);
				expect($(".twitter_admin_form").length).toBe(1);
				expect($(".twitter_admin_buttons_div").length).toBe(1);
				expect($(".button_inner_div").length).toBe(1);
				expect($(".twitter_admin_new_key").length).toBe(1);
				expect($(".twitter_admin_new_key").is(":visible")).toBe(true);
				expect($(".twitter_admin_save_button").length).toBe(1);
				expect($(".twitter_admin_save_button").is(":visible")).toBe(false);
				expect($(".twitter_admin_cancel_button").length).toBe(1);
				expect($(".twitter_admin_cancel_button").is(":visible")).toBe(false);

				expect($(".consumer_key_field").length).toBe(0);
				expect($(".consumer_secret_field").length).toBe(0);
				expect($(".access_token_key_field").length).toBe(0);
				expect($(".access_token_secret_field").length).toBe(0);
			});
		});
	});

	describe('add form', function() {
		beforeEach(function() {
			spyOn($, 'ajax').andCallFake(function(data_object) {
				data_object.success(fake_data);
			});

			admin_widget = new twitter_admin();
		});

		it('click the new button and check for fields', function() {
			expect($(".twitter_admin_container").length).toBe(1);
			admin_widget.execute();
			expect($(".twitter_admin_new_key").length).toBe(1);
			expect($(".twitter_admin_new_key").is(":visible")).toBe(true);
			expect($(".consumer_key_field").length).toBe(0);
			expect($(".consumer_secret_field").length).toBe(0);
			expect($(".access_token_key_field").length).toBe(0);
			expect($(".access_token_secret_field").length).toBe(0);


			$(".twitter_admin_new_key").click();
			expect($(".consumer_key_field").length).toBe(1);
			expect($(".consumer_secret_field").length).toBe(1);
			expect($(".access_token_key_field").length).toBe(1);
			expect($(".access_token_secret_field").length).toBe(1);
		});

		it('click the new button and click cancel', function() {
			expect($(".twitter_admin_container").length).toBe(1);
			admin_widget.execute();
			expect($(".twitter_admin_new_key").length).toBe(1);
			expect($(".twitter_admin_new_key").is(":visible")).toBe(true);
			expect($(".twitter_admin_save_button").length).toBe(1);
			expect($(".twitter_admin_save_button").is(":visible")).toBe(false);
			expect($(".twitter_admin_cancel_button").length).toBe(1);
			expect($(".twitter_admin_cancel_button").is(":visible")).toBe(false);
			expect($(".consumer_key_field").length).toBe(0);
			expect($(".consumer_secret_field").length).toBe(0);
			expect($(".access_token_key_field").length).toBe(0);
			expect($(".access_token_secret_field").length).toBe(0);

			//click and check for fields
			$(".twitter_admin_new_key").click();
			expect($(".consumer_key_field").length).toBe(1);
			expect($(".consumer_secret_field").length).toBe(1);
			expect($(".access_token_key_field").length).toBe(1);
			expect($(".access_token_secret_field").length).toBe(1);
			expect($(".twitter_admin_save_button").length).toBe(1);
			expect($(".twitter_admin_save_button").is(":visible")).toBe(true);
			expect($(".twitter_admin_cancel_button").length).toBe(1);
			expect($(".twitter_admin_cancel_button").is(":visible")).toBe(true);

			//click cancel and check for no fields
			$(".twitter_admin_cancel_button").click();
			expect($(".consumer_key_field").length).toBe(0);
			expect($(".consumer_secret_field").length).toBe(0);
			expect($(".access_token_key_field").length).toBe(0);
			expect($(".access_token_secret_field").length).toBe(0);
			expect($(".twitter_admin_save_button").length).toBe(1);
			expect($(".twitter_admin_save_button").is(":visible")).toBe(false);
			expect($(".twitter_admin_cancel_button").length).toBe(1);
			expect($(".twitter_admin_cancel_button").is(":visible")).toBe(false);
		});

		it('click the new button, add data, and click save', function() {
			expect($(".twitter_admin_container").length).toBe(1);
			admin_widget.execute();
			expect($(".twitter_admin_new_key").length).toBe(1);
			expect($(".twitter_admin_new_key").is(":visible")).toBe(true);
			expect($(".twitter_admin_save_button").length).toBe(1);
			expect($(".twitter_admin_save_button").is(":visible")).toBe(false);
			expect($(".twitter_admin_cancel_button").length).toBe(1);
			expect($(".twitter_admin_cancel_button").is(":visible")).toBe(false);
			expect($(".consumer_key_field").length).toBe(0);
			expect($(".consumer_secret_field").length).toBe(0);
			expect($(".access_token_key_field").length).toBe(0);
			expect($(".access_token_secret_field").length).toBe(0);
			//expect($(".api_key_container_block").length).toBe(1);

			$(".twitter_admin_new_key").click();
			expect($(".consumer_key_field").length).toBe(1);
			expect($(".consumer_secret_field").length).toBe(1);
			expect($(".access_token_key_field").length).toBe(1);
			expect($(".access_token_secret_field").length).toBe(1);
			expect($(".twitter_admin_save_button").length).toBe(1);
			expect($(".twitter_admin_save_button").is(":visible")).toBe(true);
			expect($(".twitter_admin_cancel_button").length).toBe(1);
			expect($(".twitter_admin_cancel_button").is(":visible")).toBe(true);

			$(".consumer_key_field").val("2");
			$(".consumer_secret_field").val("2");
			$(".access_token_key_field").val("2");
			$(".access_token_secret_field").val("2");

			$.ajax.andCallFake(function(data_object) {
				data_object.success(fake_data_2);
			});

			$(".twitter_admin_save_button").click();
			
			//FIXME check for second row

			expect($(".twitter_filter_form").length).toBe(1);
			expect($(".twitter_admin_form").length).toBe(1);
			//expect($(".api_key_container_block").length).toBe(2);
			expect($(".twitter_admin_buttons_div").length).toBe(1);
			expect($(".button_inner_div").length).toBe(1);
			expect($(".twitter_admin_new_key").length).toBe(1);
			expect($(".twitter_admin_new_key").is(":visible")).toBe(true);
			expect($(".twitter_admin_save_button").length).toBe(1);
			expect($(".twitter_admin_save_button").is(":visible")).toBe(false);
			expect($(".twitter_admin_cancel_button").length).toBe(1);
			expect($(".twitter_admin_cancel_button").is(":visible")).toBe(false);

			expect($(".consumer_key_field").length).toBe(0);
			expect($(".consumer_secret_field").length).toBe(0);
			expect($(".access_token_key_field").length).toBe(0);
			expect($(".access_token_secret_field").length).toBe(0);

		});

		it('attempt to save bad data and check warnings', function() {
			expect($(".twitter_admin_container").length).toBe(1);
			admin_widget.execute();
			expect($(".twitter_admin_new_key").length).toBe(1);
			expect($(".twitter_admin_new_key").is(":visible")).toBe(true);
			expect($(".twitter_admin_save_button").length).toBe(1);
			expect($(".twitter_admin_save_button").is(":visible")).toBe(false);
			expect($(".twitter_admin_cancel_button").length).toBe(1);
			expect($(".twitter_admin_cancel_button").is(":visible")).toBe(false);
			expect($(".consumer_key_field").length).toBe(0);
			expect($(".consumer_secret_field").length).toBe(0);
			expect($(".access_token_key_field").length).toBe(0);
			expect($(".access_token_secret_field").length).toBe(0);
			//expect($(".api_key_container_block").length).toBe(1);

			$(".twitter_admin_new_key").click();
			expect($(".consumer_key_field").length).toBe(1);
			expect($(".consumer_secret_field").length).toBe(1);
			expect($(".access_token_key_field").length).toBe(1);
			expect($(".access_token_secret_field").length).toBe(1);
			expect($(".twitter_admin_save_button").length).toBe(1);
			expect($(".twitter_admin_save_button").is(":visible")).toBe(true);
			expect($(".twitter_admin_cancel_button").length).toBe(1);
			expect($(".twitter_admin_cancel_button").is(":visible")).toBe(true);

			//fake a bad response
			$.ajax.andCallFake(function(data_object) {
				data_object.error(null, null, error_response.error);
			});

			$(".twitter_admin_save_button").click();
			
			expect($(".twitter_filter_form").length).toBe(1);
			expect($(".twitter_admin_form").length).toBe(1);
			//expect($(".api_key_container_block").length).toBe(1);
			expect($(".twitter_admin_buttons_div").length).toBe(1);
			expect($(".button_inner_div").length).toBe(1);
			expect($(".twitter_admin_new_key").length).toBe(1);
			expect($(".twitter_admin_new_key").is(":visible")).toBe(false);
			expect($(".twitter_admin_save_button").length).toBe(1);
			expect($(".twitter_admin_save_button").is(":visible")).toBe(true);
			expect($(".twitter_admin_cancel_button").length).toBe(1);
			expect($(".twitter_admin_cancel_button").is(":visible")).toBe(true);

			expect($(".consumer_key_field").length).toBe(1);
			expect($(".consumer_secret_field").length).toBe(1);
			expect($(".access_token_key_field").length).toBe(1);
			expect($(".access_token_secret_field").length).toBe(1);

			expect($(".twitter_admin_alert").length).toBe(1);
			expect($(".twitter_admin_alert").text()).toBe('Server error There was an error creating feed');
		});
	});

	//NOT IMPLEMENTED
	xdescribe('expand and view', function() {
		beforeEach(function() {
			spyOn($, 'ajax').andCallFake(function(data_object) {
				data_object.success(fake_data);
			});

			admin_widget = new twitter_admin();
		});

		it('click the expand arrow and check for views', function() {

		});

		it('click the expand and click the collapse', function() {

		});
	});


	describe('filters and toggles', function() {
		beforeEach(function() {
			spyOn($, 'ajax').andCallFake(function(data_object) {
				data_object.success(fake_data);
			});

			admin_widget = new twitter_admin();
		});

		it('check for a filter on the existing', function() {
			expect($(".twitter_admin_container").length).toBe(1);
			admin_widget.execute();

			expect($(".twitter_admin_form").length).toBe(1);
			expect($(".filter_line").length).toBe(1);
		});

		it('add a filter and verify there are two', function() {
			expect($(".twitter_admin_container").length).toBe(1);
			admin_widget.execute();

			expect($(".twitter_admin_form").length).toBe(1);
			expect($(".filter_line").length).toBe(1);

			var addButton = $(".add_more_filters_button");
			expect(addButton.length).toBe(1);

			addButton.click();

			expect($(".filter_line").length).toBe(2);
		});

		it('toggle and check filters are greyed', function() {
			expect($(".twitter_admin_container").length).toBe(1);
			admin_widget.execute();

			expect($(".twitter_admin_form").length).toBe(1);
			expect($(".filter_line").length).toBe(1);

			$(".toggle-on").click();

			expect($("twitter_admin_filter").is(":visible")).toBe(false);
		});
	});
});