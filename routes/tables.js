var express = require('express'),
	router = express.Router();

router.route('/')
	.get(function(req, res){
		res.render('index.html.ejs');	
	})

//router.route('/:dynamic') access with request.params.':dynamic'
router.route('/:table')
	.get(function(req, res){
		res.render('index.html.ejs');	
	})


module.exports = router;