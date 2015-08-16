
var express = require('express');
var app = require('../app');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Spotify' });
});

router.get('/play', function(req, res, next) {
	var command = "play";
	
	var spawn = require('child_process').spawn(
		'spotify',
		[command]);
	

	spawn.on('data', function(data) {
		res.render('index', { title: command, data_out: data });
	});

	spawn.on('close', function(code) {
		res.json({status: 'playing'});	
	});
});

router.get('/pause', function(req, res, next) {
	var command = "pause";
	
	var spawn = require('child_process').spawn(
		'spotify',
		[command]);

	spawn.on('close', function(code) {
		res.json({status: 'pausing'});	
	});
});

function getPlayListFromMood(mood){
  if(mood == 'jazz') {
    return 'Cool jazz';
  }
  else if (mood == 'tbt') {
    return '2000s';
  }
  else if (mood == 'chill') {
    return 'Chill';
  }
  else if (mood == 'party') {
    return 'Dance Party';
  }
  else if (mood == 'top100') {
    return 'Top 100';
  }
  else if (mood == 'happy') {
    return 'Fun in the sun';
  }
  else {
    return 'Gangster';
  }
}

router.get('/mood/:mood', function(req, res, next) {
	console.log(req.params.mood);
	var mood = req.params.mood;

	var playlist = getPlayListFromMood(mood);

	var spawn = require('child_process').spawn(
		'spotify',
		["play", "list", "'"+playlist+"'"]
	);

	var bufs = [];

	spawn.stdout.on('data', function(data) {
		bufs.push(data);
	});

	spawn.stdout.on('end', function() {
		var buf = Buffer.concat(bufs);
		var playlistURLPartial = buf.toString('utf-8').split('Spotify URL: ');

		playlistURL = playlistURLPartial[playlistURLPartial.length-1];
		console.log(playlistURL);
		var r = /\\u([\d\w]{4})/gi;
		playlistURL = playlistURL.replace(r, function (match, grp) {
    			return String.fromCharCode(parseInt(grp, 16)); } );
		playlistURL = unescape(playlistURL);
		// playlistURL = playlistURL.split(0, playlistURL.length-4)[0];
		
	});

	spawn.on('close', function(code) {


		var response_json = {
			mood: mood,
			playlistURL: playlistURL
		}
		console.log(response_json);
		// res.setHeader('Content-Type', 'application/json');
    	// res.send(JSON.stringify(response_json));
		res.json(response_json);	
	});

});


module.exports = router;
