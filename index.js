//Modules
var express = require('express'),
	app = express(),
	server = require('http').Server(app),
	io = require('socket.io')(server),
	mongo = require('./db/mongo')
	format = require('./lib/util'),
	tables = require('./routes/tables');

var uri = 'mongodb://onepiece:luffylaw@ds063240.mongolab.com:63240/waieez';
//Cache on server for the decks
var coll;
var gameRoom;
var baseA = [];
var baseQ = [];

//IO event driven DOM manipulation
io.on('connection', function (client){

	client.on('join', function (data){
		var username = client.username = data.username,
			path = data.path,
			thisRoom = io.sockets.adapter.rooms[path];

		if (!thisRoom) {
			addReady(path, {});//clears the list of ready players
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
		io.to(data.path).emit('player answer', data);
	});

	client.on('player ready', function (data){
		var currentPlayers = Object.keys(io.sockets.adapter.rooms[data.path]);
		readyGetSet(data.path, client.id, currentPlayers, areReady)
		//emits pick winner to czar
	});

	client.on('winner picked', function (data){
		io.to(data.path).emit('show winner', data.winner);
		var startNew = startGame.bind(null, data.path);
		//starts new game
		setTimeout(startNew, 3000);
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

	coll.find({expansion:"Base", cardType: "Q"},{_id: 0, numAnswers: 1, text:1}).each(function (err, doc){
		if (err) throw err.message;
		baseQ.push(doc);
	});

	console.log('connected to mongo @ ' + uri);
	server.listen(process.env.PORT || 3000, function(){
		console.log('listen @ 3000..');	
	});
});

var upSertDB = function (path, toUpsert) {
	mongo.collection('gameRoom')
		.update( {'path': path}, {$set: toUpsert}, {w:1, upsert:true}, function(err) {
  			if (err) console.warn(err.message);
  		});
}

var addReady = function(path, players){
	upSertDB(path, {ready: players});
};


var readyGetSet = function (path, player, currentPlayers, emitter){
	var gameRoom = mongo.collection('gameRoom');
	gameRoom.findOne( {'path': path}, function (err, result){
		if (err) console.warn(err.message);
		
		var players = result['ready'];

		if(!players[player]) {
			players[player] = true;
			addReady(path, players);
		}

		emitter(path, Object.keys(players).length >= currentPlayers.length - 1);
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

	mongo.collection('gameRoom').findOne( {'path': path},{_id: 0, czar: 1},function (err, result){

		if (players.length > 1){
			players.sort(function ( a, b ){
				return result.czar[a] - result.czar[b];
			});
			//sorts array of players by times as czar asc
			//picks randomly from first half of array.
			czar = players[Math.floor( (Math.random()*players.length)/2 )];
		} else {
			upSertDB(path, { czar: {} } ); //cleans the room of old data
			czar = players[0];
		}

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