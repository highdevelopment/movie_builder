
$(window).ready(function()
{
	var mainClass = new CMainClass();
})


var logo_url;
var CMainClass = function()
{
	var main = this;
	this.animView = null;
	var theCanvas = null;

	var mVideo = new classVideo(main);

	this.init = function()
	{
	}

	this.onLoadedJson = function(jsonData)
	{
		var data = new CData(jsonData);
		this.animView = data.view;
		// var height = $(window).height();
		// this.animView.css('top', height);
		var width = $('#text_width').val() * 1;
		var height = $('#text_height').val() * 1;
		var canvas = $("#animation_canvas")[0];
		canvas.width = width;
		canvas.height = height;
		$("#animation_canvas").css('width', width);
		$("#animation_canvas").css('height', height);
		$('body').append(main.animView);

		this.createCanvas();
	}

	this.onCreatedCanvas = function(canvas)
	{
	}

	$('#btn_start').click(function()
	{
		var json_url = $('#text_url').val();
		$.getJSON(json_url, function(json)
		{
			$('#page_1').fadeOut();
			$('#page_2').fadeIn();

			$('#text_status').show();
			$('#text_result').hide();
			main.onLoadedJson(json);
		});
	});

	this.createCanvas = function()
	{
		var width = $('#text_width').val() * 1;
		var height = $('#text_height').val() * 1;
		var o_width = main.animView.width();
		var rate = 1;//o_width / width;
		main.animView.show();
		$('.section_data').css('height', height);
		$('.section_data').css('width', width);

		html2canvas(main.animView, {
			onrendered: function(canvas) {
				theCanvas = document.createElement('canvas');
				var rate = width / canvas.width;
				theCanvas.width = width;
				theCanvas.height = canvas.height * rate;
				var backCtx = theCanvas.getContext('2d');
				// save main canvas contents
				backCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, theCanvas.width, theCanvas.height);

				var image = new Image();
				// var _img = $('.type_logo img');
				// image.src = _img[0].src;
				image.src = 'css/12119148_1654884704760544_3965289323018514907_n.jpg';
				var img_logo = main.animView.find('.type_logo img');
				var pos = main.animView.offset();
				var pos1 = img_logo.offset();
				var left = pos1.left - pos.left;
				var top = pos1.top - pos.top;
				var img_width = img_logo.width();
				var img_height = img_logo.height();
				image.onload = function()
				{
					backCtx.drawImage(image, 0, 0, image.width, image.height, 20, top * rate, 600, 600);
					// var img = theCanvas.toDataURL();
					// $('body').append(theCanvas);
					mVideo.setVideoPorperty(theCanvas, width, height);
					mVideo.generateVideo();
				}
				main.animView.hide();
           // var img = theCanvas.toDataURL();
           // window.open(img);

			}
		});
	}

	$('#text_width').on('change', function()
	{
		var width = $('#text_width').val() * 1;
		var height = $('#text_height').val() * 1;
		var canvas = $("#animation_canvas")[0];
		canvas.width = width;
		canvas.height = height;
		$("#animation_canvas").css('width', width);
		$("#animation_canvas").css('height', height);
	})

	$('#text_height').on('change', function()
	{
		var width = $('#text_width').val() * 1;
		var height = $('#text_height').val() * 1;
		var canvas = $("#animation_canvas")[0];
		$("#animation_canvas").css('width', width);
		$("#animation_canvas").css('height', height);
		canvas.width = width;
		canvas.height = height;
	})

	this.init();
}

var CData = function(jsonData)
{
	var main = this;
	this.view;
	this.init = function()
	{
		this.view = $('<div id="data"></div>');
		$.each(jsonData, function(index, json_section)
		{
			var section;
			if(json_section.type == 'title')
			{
				section = new CTtitle(json_section.data);
			}
			else if(json_section.type == 'foursquare-tip')
			{
				section = new CTip(json_section.data);
			}
			else if(json_section.type == 'logo')
			{
				section = new CLogo(json_section.data);
			}
			main.appendSection(section);
		})
	}

	this.appendSection = function(section)
	{
		this.view.append(section.view);
	}

	this.init();
}

var CTtitle = function(json)
{
	this.view;
	this.init = function()
	{
		var html = '<div class="section_data type_title">\
						<h1>' + json.text + '</h1>\
					</div>';
		this.view = $(html);
	}

	this.init();
}

var CTip = function(json)
{
	this.view;
	this.init = function()
	{
							// <img class="info_picture" src="' + json.user_photo_prefix + json.user_photo_suffix + '">' +
		var html = '<div class="section_data type_tip">\
						<div class="data_text">\
							<p>' + json.text + '</p>\
						</div>\
						<div class="info">\
							<img class="info_picture" src="css/icon.png">' +
							'<div class="info_name">\
								<p>' + json.user_first_name + '</p>\
								<p>' + json.user_last_name + '</p>\
							</div>\
						</div>\
					</div>';
		this.view = $(html);
	}

	this.init();
}

var CLogo = function(json)
{
	this.view;
	this.init = function()
	{
		var html = '<div class="section_data type_logo">\
						<img src=' + json.logo + '>\
					</div>';
		this.view = $(html);
		logo_url = json.logo;
		// this.view.css('background-image', 'url("' + json.logo + '")');
		// this.view.css('background-image', 'url("http://d2j259rizy5u5h.cloudfront.net/outputvideos/thumbs/email_44_2015_03_02_54f462457526c-00001.png")');
		// this.view.css('background-repeat', 'no-repeat');
		// this.view.css('height', '600px');
	}

	this.init();
}
