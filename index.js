//Modules
var express = require('express'),
	app = express(),
	server = require('http').Server(app),
	io = require('socket.io')(server),
	mongo = require('./db/mongo'),
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
			path = client.path = data.path,
			thisRoom = io.sockets.adapter.rooms[path];

		if (!thisRoom) {
			addReady(path, {});//clears the list of ready players
		}
		//Set New Player
		var players = {},
			player = 'players.'+client.id;
			players[player] = {czar: 0, score: 0, username: username};
		updateDB(path, players);
		//Join Handshake Sequence
		client.join(path);

		var msg = client.username + ' has joined '+path;
		io.to(path).emit('Server Message', msg);
		client.emit('pass deck', baseA);
	});

	client.on('submit card', function (data){
		io.to(data.path).emit('player answer', data);
	});

	client.on('player ready', function (data){
		var currentPlayers = Object.keys(io.sockets.adapter.rooms[data.path]);
		readyGetSet(data.path, client.id, currentPlayers, areReady);
		//emits pick winner to czar
	});

	client.on('winner picked', function (data){
		io.to(data.path).emit('show winner', data);
		var startNew = startGame.bind(null, data.path);
		//starts new game
		setTimeout(startNew, 4000);
	});

	client.on('update score', function (data){
		var currentPlayers = Object.keys(io.sockets.adapter.rooms[data.path]);
		incPlayerValue(data.path, client.id, 'score', 1);
		getScores(data.path, currentPlayers)
	});

	client.on('disconnect', function (){
		var thisRoom = io.sockets.adapter.rooms[client.path],
			room = {"players":{}},
			path = client.path;
		if (!thisRoom) { updateDB(path, room) };
	});

});

app.use(express.static('static'));
app.use('/', tables);

//Start up server
mongo.connect(uri, function (){
	//init cache? server only needs to serve one deck for now
	coll = mongo.collection('card');

	coll.find({expansion: {"$in": ["Base", "CAHe2", "CAHe3", "CAHe4", "CAHe5"]}, cardType: "A"},{_id: 0, text:1}).each(function (err, doc){
		if (err) throw err.message;
		baseA.push(doc);
	});

	coll.find({expansion: {"$in": ["Base", "CAHe2", "CAHe3", "CAHe4", "CAHe5"]}, cardType: "Q"},{_id: 0, numAnswers: 1, text:1}).each(function (err, doc){
		if (err) throw err.message;
		baseQ.push(doc);
	});

	console.log('connected to mongo @ ' + uri);
	server.listen(process.env.PORT || 3000, function(){
		console.log('listen @ 3000..');	
	});
});

var updateDB = function (path, toUpdate, operator) {
	var obj = {},
		operator = operator || "$set";
	obj[operator] = toUpdate;
	mongo.collection('gameRoom').update( {'path': path}, obj, {w:1, upsert:true}, function(err) {
  			if (err) console.warn(err.message);
  		});
}

var addReady = function(path, players){
	updateDB(path, {ready: players});
}


var readyGetSet = function (path, player, currentPlayers, emitter){
	mongo.collection('gameRoom').findOne( {'path': path}, function (err, result){
		if (err) console.warn(err.message);
		
		var players = result['ready'];

		if(!players[player]) {
			players[player] = true;
			addReady(path, players);
		}
		
		emitter(path, Object.keys(players).length >= currentPlayers.length - 1);
	});
}

//emitter
var areReady = function (path, bool) {// decouple czar from reg players to maintain flow
	if (bool) { io.to(path).emit('pick winner', 'Czar, please pick a winner'); }
}

var crownCzar = function (path, players) {

	mongo.collection('gameRoom').findOne( {'path': path},{"_id": 0, "players": 1},function (err, result){

		if (players.length > 1){
			players.sort(function ( a, b ){

				return result["players"][a]["czar"] - result["players"][b]["czar"];
			});
			//sorts array of players by times as "czar" asc
			//picks randomly from first half of array.
			player = players[Math.floor( (Math.random()*players.length)/2 )];
		} else {
			player = players[0];
		}

		incPlayerValue(path, player, 'czar', 1);
		io.to(player).emit('crown czar', 'You are the Czar!');
	});
}

var startGame = function(path){
	var currentPlayers = Object.keys(io.sockets.adapter.rooms[path]);
	io.to(path).emit('start', baseQ[Math.floor(Math.random()*baseQ.length)]);
	addReady(path, {});
	crownCzar(path, currentPlayers);
}

var incPlayerValue = function (path, playerId, key, value) {
//Data Structure {players: {playerid: {czar: 0, username: username, score: 0}}}
	var players = {},
		playerKey = 'players.'+playerId+'.'+key;
	players[playerKey] = value;
	updateDB(path, players, '$inc');
}

var getScores = function (path, players) {
	var player,
		scores = [];
	mongo.collection('gameRoom').findOne( {'path': path},{_id: 0, players: 1},function (err, result){

		if (players.length > 1){
			players.sort(function ( a, b ){
				return result["players"][a]["score"] - result["players"][b]["score"];
			});
			for (var i = players.length - 1; i >= 0; i--) {
				player = result["players"][players[i]];
				scores.push([player.username, player.score]);
				if (scores.length == players.length) { io.to(path).emit('send scores', scores); }
			}
		}
	});
}