//Modules
var express = require('express'),
		http = require('http'),
		app = express(),
		server = http.createServer(app),
		//
		io = require('socket.io')(server),
		events = require('events'),
		//fs = require('fs'),
		//request = require('request'),
		mongo = require('./mongo')
		format = require('util').format,
		tables = require('./routes/tables');

var uri = 'mongodb://onepiece:luffylaw@ds063240.mongolab.com:63240/waieez';


//IO event driven DOM manipulation
io.on('connection', function(client){

	var coll = mongo.collection('card');

	console.log('client connected...');

	client.on('join', function(data){
		client.username = data;

		//fetch from db
		coll.find().each(function(err, doc){
			if (err) throw err.message;
			client.emit('message', doc);
		})
		//console.log(coll.find({}));

		//for loop
		//client.emit(thing)
		console.log('client username set: '+ client.username);
	});

	client.on('reply', function(data){
		var username = client.username;
		var doc = {username: username, message: data};
		//collection.insert(docs, options, [callback]);
		coll.insert(doc, {w:1}, function(err, obj){
			if (err) throw err.message;
			console.log('String inserted into DB!');
		})
		io.emit('message', doc);
	});
});

app.use(express.static('static'));
app.use('/', tables); //sets the route root to '/'

//Start up server
mongo.connect(uri, function(){
	console.log('connected to mongo @ ' + uri);
	server.listen(3000, function(){
		console.log('listen @ 3000..');	
	});
});

