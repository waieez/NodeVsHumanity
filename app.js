//Modules
var express = require('express'),
	app = express(),
	server = require('http').Server(app),
	io = require('socket.io')(server),
	//events = require('events'),
	//fs = require('fs'),
	//request = require('request'),
	mongo = require('./db/mongo')
	//format = require('util').format,
	roundRobin = require('./lib/util'),
	tables = require('./routes/tables');

var uri = 'mongodb://onepiece:luffylaw@ds063240.mongolab.com:63240/waieez';
//Cache on server for the decks
var coll;
var gameRoom;
var baseA = [];
var baseQ = [];

//IO event driven DOM manipulation
io.on('connection', function (client){

	console.log('client connected...'+client);

	client.on('join', function (data){
		var username = client.username = data.username,
			path = data.path,
			thisRoom = io.sockets.adapter.rooms[path];//rooms autoclose when length 0

		if (!thisRoom) {
			addReady(path, {});//path, player
		}

		//Join Handshake Sequence
		client.join(path);

		var msg = client.username + ' has joined '+path;
		io.to(path).emit('Server Message', msg);
		client.emit('pass deck', baseA);
		console.log('client username set: '+ client.username);
	});
	//not yet used
	client.on('czar action', function (data){
		io.to(data.path).emit('start', 'Game started!');
	});

	client.on('player ready', function (data){
		var numPlayers = Object.keys(io.sockets.adapter.rooms[data.path]).length;
		readyGetSet(data.path, client.id, numPlayers, areReady)
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

	client.on('disconnect', function (path) {
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

var addReady = function(path, players){
	var ready = {ready: players},
		gameRoom = mongo.collection('gameRoom');

	gameRoom.update( {'path': path}, {$set: ready}, {w:1, upsert:true}, function(err) {
  		if (err) console.warn(err.message);
  		else console.log('successfully updated');
  	});
};

//good enough for now
var readyGetSet = function (path, player, numPlayers, emitter){
	var gameRoom = mongo.collection('gameRoom');
	gameRoom.findOne( {'path': path}, {'_id': 0, 'ready': 1}, function (err, result){
		if (err) console.warn(err.message);
		var players = result['ready'];

		if(!players[player]) {
			players[player] = true;
			addReady(path, players);
		}

		emitter(path, Object.keys(players).length >= numPlayers);
	});
};

var areReady = function (path, bool) {
	if (bool) {
		addReady(path, {});
		io.to(path).emit('start', 'starting new round')
	} else { 
		io.to(path.emit('waiting', 'still waiting for slowpokes');
	}
}