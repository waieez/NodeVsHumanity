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

		//New player has never been Czar
		setTimesCzar(path, client.id, 0);

		//Join Handshake Sequence
		client.join(path);

		var msg = client.username + ' has joined '+path;
		io.to(path).emit('Server Message', msg);
		client.emit('pass deck', baseA);
		console.log('client username set: '+ client.username);
	});

	client.on('submit card', function (data){
		console.log(data.path, data.username, data.card);
		io.to(data.path).emit('player answer', data);
	});

	client.on('player ready', function (data){
		var currentPlayers = Object.keys(io.sockets.adapter.rooms[data.path]);
		readyGetSet(data.path, client.id, currentPlayers, areReady)
		//emits pick winner to czar
	});

	//not yet used
	client.on('winner picked', function (data){
		console.log(data.winner);
		setTimeout(startGame(data.path), 2000);
		//starts game
	});

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

var upSertDB = function (path, toUpsert) {
	mongo.collection('gameRoom')
		.update( {'path': path}, {$set: toUpsert}, {w:1, upsert:true}, function(err) {
  			if (err) console.warn(err.message);
  			//else console.log('successfully updated');
  		});
}

var addReady = function(path, players){
	upSertDB(path, {ready: players});
};

//good enough for now
var readyGetSet = function (path, player, currentPlayers, emitter){
	var gameRoom = mongo.collection('gameRoom');
	gameRoom.findOne( {'path': path}, function (err, result){
		if (err) console.warn(err.message);
		
		var players = result['ready'];

		if(!players[player]) {
			players[player] = true;
			addReady(path, players);
		}

		emitter(path, Object.keys(players).length >= currentPlayers.length);
	});
};

//emitter
var areReady = function (path, bool) {// decouple czar from reg players to maintain flow
	if (bool) {//start new round
		io.to(path).emit('pick winner', 'Czar, please pick a winner')
	} else { 
		io.to(path).emit('waiting', 'still waiting for slowpokes');
	}
}

var setTimesCzar = function (path, playerId, times) {
	var timesCzar = {},
		player = 'czar.'+playerId;
	timesCzar[player] = times;
	upSertDB(path, timesCzar);
}

var crownCzar = function (path, players) {
	var gameRoom = mongo.collection('gameRoom');
	gameRoom.findOne( {'path': path},{_id: 0, czar: 1},function (err, result){

		players.sort(function ( a, b ){
			return result.czar[a] - result.czar[b];
		});
		//sorts array of players by times as czar asc
		//picks randomly from first half of array.
		czar = players[Math.floor( (Math.random()*players.length)/2 )];
		var timesCzar = result.czar[czar] + 1;
		setTimesCzar(path, czar, timesCzar);
		io.to(czar).emit('crown czar', 'You are the Czar!');
	});
}

var startGame = function(path){
	var currentPlayers = Object.keys(io.sockets.adapter.rooms[path]);
	io.to(path).emit('start', baseQ[Math.floor(Math.random()*baseQ.length)]);
	addReady(path, {});
	crownCzar(path, currentPlayers);
}


// emit to czar 'YOU ARE CZAR'
// make czar active, hide his cards, show the inc responses when all ready
// make players active,
// set a timer for responses
// show everyone all the responses
// czar can pick best one
// show winner to everyone
// restart

//tofix

//czar function now working anymore.