//Modules
var express = require('express'),
		app = express(),
		server = require('http').Server(app),
		io = require('socket.io')(server),
		//events = require('events'),
		//fs = require('fs'),
		//request = require('request'),
		mongo = require('./db/mongo')
		format = require('util').format,
		tables = require('./routes/tables');

var uri = 'mongodb://onepiece:luffylaw@ds063240.mongolab.com:63240/waieez';
//Cache on server for the decks
var coll;
var baseA = [];
var baseQ = [];

//IO event driven DOM manipulation
io.on('connection', function (client){

	console.log('client connected...'+client);

	client.on('join', function (data){
		var username;
		client.username = username = data.username;
		var path = data.path;
		var thisRoom = io.sockets.adapter.rooms[path];//rooms autoclose when length 0

		if (!thisRoom) {
			client.emit('welcome', 'You are the first one here')
		};

		//Join Handshake Sequence
		client.join(path);
		io.to(path).emit('welcome', client.username + ' has joined '+path);
		console.log(client.username+' registered on server');
		client.emit('pass deck', baseA);
		console.log('client username set: '+ client.username);	
	});


	//Start Round
		//emit accepting answers --> triggers clickable clientside
		//listen for responses (duration 10-30s) || num response = numplayers ?on new player join, refresh timer?
		//true >>
			//disable submit clientside + trigger show response cycle clientside, at end everyone gets a list of all submissions

			// only czar can pick
				//<-- czar's pick
				//on winner chosen --> emit winning answer, update score clientside
				//5s later call start round
		//false >>
			//on submit card --> emit player answer

	client.on('submit card', function (data){
		console.log(data.path, data.username, data.card);
		io.to(data.path).emit('player answer', data);
	});

	client.on('disconnect', function (client) {
		console.log('goodbye...');
	})
});

app.use(express.static('static'));
app.use('/', tables);

//Start up server
mongo.connect(uri, function (){

	//init cache? server only needs to serve one deck for now
	coll = mongo.collection('card');
	coll.find({expansion:"Base", cardType: "A"},{_id: 0, text:1}).each(function (err, doc){
		if (err) throw err.message;
		baseA.push(doc);
	});
	coll.find({expansion:"Base", cardType: "Q"},{_id: 0, text:1}).each(function (err, doc){
		if (err) throw err.message;
		baseQ.push(doc);
	});

	console.log('connected to mongo @ ' + uri);
	server.listen(3000, function(){
		console.log('listen @ 3000..');	
	});
});