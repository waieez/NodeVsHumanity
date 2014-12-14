//Modules
var express = require('express'),
		app = express(),
		server = require('http').Server(app),
		io = require('socket.io')(server),
		//events = require('events'),
		//fs = require('fs'),
		//request = require('request'),
		mongo = require('./mongo')
		format = require('util').format,
		tables = require('./routes/tables');

var uri = 'mongodb://onepiece:luffylaw@ds063240.mongolab.com:63240/waieez';


//IO event driven DOM manipulation
io.on('connection', function (client){

	var coll = mongo.collection('card');//change to specific room in future?

	console.log('client connected...'+client);

	client.on('join', function (data){
		var username;
		var path = data.path;
		client.username = username = data.username;
		client.join(path);
		var msg = username + ' has joined '+path;
		io.to(path).emit('welcome', msg);
		console.log(client.username+' registered on server');

		//obj with hash of all rooms and sockets connected to it '/room': { sock:true, sock:true }
		//console.log(io.sockets.adapter);
		//client id (cookie?) is the room this socket autojoins
		//console.log(client.id);

		//fetch from db
		coll.find().each(function (err, doc){
			if (err) throw err.message;
			client.emit('message', doc);// for now everyone gets the same set
		})

		console.log('client username set: '+ client.username);
	});

	client.on('reply', function (data){
		//collection.insert(docs, options, [callback]);
		coll.insert(data, {w:1}, function(err, obj){
			if (err) throw err.message;
			console.log('String inserted into DB!');
		})
		io.to(data.path).emit('message', data);
	});

	client.on('draw', function (data){
		console.log('dealing out another card');
		client.emit('message', {'message':'heres another card for ya'});
	});


	client.on('disconnect', function (client) {
		console.log('goodbye...'+client.username);//is undefined by the time disconnection occurs
	})
});

app.use(express.static('static'));
app.use('/', tables);

//Start up server
mongo.connect(uri, function(){
	console.log('connected to mongo @ ' + uri);
	server.listen(3000, function(){
		console.log('listen @ 3000..');	
	});
});
