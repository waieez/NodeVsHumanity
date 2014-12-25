$(document).ready(function(){

	var path = window.location.pathname,
		server = io.connect('/'),
		spammable = true,
		username,
		card,
		czar,
		numAnswers,
		answerDeck = [],
		answers = [],
		isReady;

	//Listeners	
	//Handshake
	server.on('connect', function(data){

	});

	$('#username form').on('submit.username', function(event){
		event.preventDefault();
		username = escapeHtml( $("input").val() );
		
		var info = {'path': path, 'username': username};
		server.emit('join', info);
		$('#username').addClass('hidden');
	});

	server.on('Server Message', function (message){
		notify('alert', message);
	});

		//Recieve and randomize white deck clientside
	server.on('pass deck', function (deck){
		shuffle(deck);
		var count = 0;
		deck.forEach(function (card){
			if (count < 7) {
				$('#hand').append('<li>'+card.text+'</li>');
			} else if (card) {
				answerDeck.push(card.text);
			}
			count++
		})
		ready();
	});

	//Start!
	server.on('start', function (data){
		enablePeon();
		isReady = false;
		answers = [];
		numAnswers = data.numAnswers
		$('#responses').empty();
		$('#black').html(data.text);
		$('#winner').html("");
	});

	server.on('crown czar', function (message){
		enableCzar();
		notify("alert", message);
	});

	//Populate Response
	server.on('player answer', function (card){
		if (czar) {
			cards = (card.card.length > 1) ? card.card.join('  <br>') : card.card[0];

			$('#responses').append( $('<li id="'+card.username+'"></li>').html(cards) );
		}
	});

	server.on('pick winner', function (data) {
		//Autostarts a new game
		if ($('#responses:first-of-type').text() == '') {
			server.emit('winner picked', 
				{'path': path, 'winner': '', 'text': $('.black').text()}) 
		};
	});

	//Czar picks a winner and emits the choen card to all
	//Winner triggers server to update score
	server.on('show winner', function (data){
		$('#winner').html(data.text);
		$('.player').addClass('hidden');
		$('.czar').addClass('hidden');
		if (username == data.winner) {
			server.emit('update score', {'path': path, 'username': username});
		}
	});

	server.on('send scores', function (array){
		$('#scores').empty();
		for (var i = 0; i < array.length; i++) {
			$('#scores').append( "<li>"+array[i].join(": ")+"</li>" );
		};
	});

	//Emitters
	//Trigger Submit/Emit Card to Server, reveal top card of hidden white deck if submission is from hand

	//only show hand to peons
	function enablePeon () {
		$('.czar').addClass('hidden');
		$('.player').removeClass('hidden');
	}

	$('#hand').on('click', 'li', function(event){
		if (!isReady && answers.length != numAnswers) { //hacky. i know
			card = $(this).text();
			$(this).remove();
			$('.player form').trigger('submit.card');

			var topCard = answerDeck.shift();
			$('#hand').append('<li>'+topCard+"</li>");
		}
	});

	$('.player form').on('submit.card', function(event){
		event.preventDefault();
		if (!isReady) {
			card = card || escapeHtml($('#wildcard').val());
			answers.push(card)
			if (answers.length == numAnswers) {
				server.emit('submit card', 
					{'username': username, 'path': path, 'card': answers});
				ready();	
			}

			card = '';
			$('#wildcard').val('');
		}
	});

	//only show submissions to czar, hide hand
	function enableCzar (){
		czar = true;
		$('.czar').removeClass('hidden');
		$('.player').addClass('hidden');
	}

	$('#responses').on('click', 'li', function(){
		var winner = $(this).attr('id');
		var text = $(this).html();
		server.emit('winner picked', {'path':path, 'winner':winner, 'text': text});
	});

	$('#newGame').on('click', function(){
		var winner = $(this).attr('id');
		var text = $(this).html();
		server.emit('winner picked', {'path':path, 'winner':winner, 'text': text});
	});

	function ready (){
		isReady = true;
		server.emit('player ready', {'path': path} );
	}

	//Fisher Yates Shuffle
	function shuffle (array) {
		var m = array.length, t, i;
		// While there remain elements to shuffle…
		while (m) {
			// Pick a remaining element…
			i = Math.floor(Math.random() * m--);
			// And swap it with the current element.
			t = array[m];
			array[m] = array[i];
			array[i] = t;
		}
		return array;
	}

	function notify (type, message) {
		console.log(message);
		var block = $('<div class=notify></div>').html(message);
		$(block).appendTo("."+type).fadeIn(1000);
		setTimeout(function(){ $("."+type).children().first().remove() }, 5000 )
	}

	function escapeHtml (text) {
		return $('<div/>').text(text).html();
	}
});