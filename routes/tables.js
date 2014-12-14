var express = require('express'),
		router = express.Router();

var cards = []; // need actual database for persistence

router.route('/')
	.all(function(req, res, next){
		next();
	}) // or .params
	.get(function(req, res){
		//figure out how to pass info from db or info from event triggers
		res.render('index.html.ejs');	
	})
	.post(function(req, res){});

//router.route('/:dynamic') access with request.params.':dynamic'

router.route('/:table')
	.all(function(req, res, next){
		next();
	})
	.get(function(req, res){
		res.render('index.html.ejs');	
	})
	.post(function(req, res){});

module.exports = router;