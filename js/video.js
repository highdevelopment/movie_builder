/* -----------------------------------------------------
*
*   Author 	    : Sergey Kuznetov
*   Created     : 2016/07/28
*   Description : Jquery Object to convert to mp4
*
--------------------------------------------------------*/

var classVideo 	= function(parent)
{
	var main 	= this;
	var userid 	= "";
	var mtransition_time;
	var mRender_tic = 30;

	main.parent = null;
	main.host 	= "http://46.101.151.36:3001";
	// main.host 	= "http://localhosts:3000";
	main.socket = null;
	main.total 	= 0;
	main.done 	= 0;
	main.fps 	= 30; // the number of frames per a second
	var mPauseCnt = 100;
	var mTotal_time = mPauseCnt * 6;

	// main.userid = "";

	main.setVideoPorperty = function(canvas, width, height)
	{
		main.width 	= width;
		main.height = height;
		main.theCanvas = canvas;
		main.total_height = canvas.height;
	};

	main.init 	= function()
	{
		console.log("init.........", main.userid);
		main.parent = parent;
		main.initSocket();
		mtransition_time = $('#text_transition_time').val();
		var mPauseCnt = mtransition_time * 1000 / mRender_tic;
	}

	main.initSocket = function()
	{
		main.socket 		= io.connect(main.host);

		main.socket.on('connect', function (socket) {
			console.log('connected____');
		});

		main.socket.on('video_complete', function(data)
		{
			console.log(userid, data);
			if(userid != data.user)
				return;

			// $("#overlay_download a").attr("href", "server/" + data.name);

			// main.parent.progress.hideProgress();
			// main.parent.popup.show("overlay_download");
			$('#text_status').hide();
			$('#text_result').show();
			var theUrl = "server/" + data.name;
			var text = $("#text_result a");
			text.attr("href", theUrl);
			text.text(theUrl);
		});
	}

	main.generateVideo 	= function()
	{
		// main.vname = "video_" + Date.now();

		// if(!main.parent.animator || !main.parent.animator.anim_class)
		// {
		// 	alert("There is nothing to render now!");
		// 	return;
		// }

		// main.parent.progress.showProgress("Generating Video ...");
		// main.parent.progress.updateProgress(0);

		// main.total = 0;

		// for(var i = 0; i < main.parent.animator.anim_class.timeArr.length; i ++)
		// {
		// 	main.total += main.parent.animator.anim_class.timeArr[i];
		// }

		// main.total 	= Math.floor(main.total / main.fps);
		// main.done 	= 0;
		main.fname  = "frame-" + Date.now();

		main.sTime 	= Date.now();
		main.isFlag = 1;
		main.isStopVideo = false;
		
		userid		= main.makeid();

		// main.parent.animator.stop();
		// main.parent.animator.is_finish = 0;

		main.renderVideo();
		main.createVideo();
		$('#btn_start').attr('disabled', true);
	}

	var mTimeCnt = 0;
	var mRenderedPageCnt;
	main.renderVideo = function()
	{
		main.yPos = -main.height;
		main.timer = setInterval( function() { main.onTimer() }, mRender_tic );
		mPauseCnt = 0;
		mRenderedPageCnt = 0;
	}

	var mAniSpeed = 30;
	main.onTimer = function()
	{
		mTimeCnt++;
		if(main.yPos > main.total_height - main.height)
		{
			setTimeout(function()
			{
				main.stopVideo();
			}, 3000);
		}
		else
		{
			if(mPauseCnt > 0)
				mPauseCnt--;
			else
			{
				main.yPos += mAniSpeed;
				if((main.yPos + mAniSpeed > main.total_height / 6.0 * mRenderedPageCnt))
				{
					//main.yPos = main.total_height / 6 * mRenderedPageCnt + mRenderedPageCnt;
					mPauseCnt = mtransition_time / mRender_tic * 1000;
					mRenderedPageCnt++;
				}
			}
		}
		var canvas = $("#animation_canvas")[0];
		var ctx = canvas.getContext('2d');
		//ctx.fillRect(0, 0, main.width, main.height);
		ctx.drawImage(main.theCanvas, 0, main.yPos, main.width, main.height, 0, 0, main.width, main.height);
	}
	
	main.stopVideo = function()
	{
		main.isStopVideo = true;
		clearInterval(main.timer);
		$('#btn_start').attr('disabled', false);
	}

	main.createVideo 	= function()
	{
		if(!main.isFlag)
		{
			return;
		}

		// if(yPos > main.total_height - main.height)
		// {
		// 	isEnd = true;
		// 	// 	$("#progress_area h3").html("Getting Video Link......");
		// 	// 	main.parent.progress.updateProgress(99);
		// 	// 	main.parent.animator.stop();
		// }
		// else
		// {
		// 	if(yPos > 0)
		// 		yPos = yPos + 5;
		// 	else
		// 		yPos = yPos + 15;
		// }

		try 
		{
			// main.parent.animator.play();
			main.done ++;
			main.isFlag = 0;
			// main.parent.progress.updateProgress(main.done / main.total * 100);

			setTimeout(function()
			{
				main.sTime = Date.now();
				main.isFlag = 1;
				// main.parent.animator.pause();

				if(!main.isStopVideo)
				{
					setTimeout(function()
					{
						main.createVideo();
					}, main.fps)
				}
				else
				{
					// main.parent.progress.updateProgress(99);
				}

				var canvas = $("#animation_canvas")[0];
				var data = canvas.toDataURL('image/jpeg');

				main.socket.emit('render-frame', 
				{
					name  : main.fname,
					frame : main.mkFrameName(main.done),
					isEnd : main.isStopVideo,
					user  : userid,
					width : main.width,
					height: main.height,
					file  : data,
				});

			}, main.fps)
		}
		catch(ex) 
		{ 
			alert("Sorry, We can't connect server!");

			// main.parent.progress.hideProgress();
		}
	}

	main.mkFrameName 	= function(frame_num)
	{
		var frame_str 	= "";

		if(frame_num < 10)
			frame_str += "00" + frame_num;
		else if(frame_num < 100)
			frame_str += "0" + frame_num;
		else
			frame_str += frame_num;

		return frame_str;
	}

	main.makeid 		= function()
	{
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for( var i = 0; i < 20; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}


	main.init();
}
