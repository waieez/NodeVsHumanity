var express = require('express'),
	router = express.Router();

router.route('/')
	.all(function(req, res, next){
		next();
	})
	.get(function(req, res){
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