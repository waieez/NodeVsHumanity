Learning Node with code!

Background Knowledge:
Node + Express: Codeschool's Node and Express courses
Mongo: Udacity's MongoDB
and of course... Google/StackOverflow

Build Log(?):

1. Get node server working
	- This was relatively easy considering the massive pain that is Rails on Windows.

2. Get websockets and event emitters working
	- Completed both Node and Express courses at this point and decided to go deeper and make this project.
	
3. Get DB Working
	- Tried to understand/set up DB
	- Considered Redis, Postgres and Mongo
	- Settled with MongoLab's DBaaS's 'relatively' easy setup.
	- Learned CRUD(?) operations from Udacity's MongoDB course

4. Learn how to use SocketIO
	- Get famililar with Socket.IO namespaces/rooms
	- Perhaps route/table implementation mostly done with express/sockets alone.
	- Worked out key player interaction, Card Submission/Draw

Plans:

1. Implement White/Black Deck
	- Figure out a way to mass import the different expansions so I don't spend most of my time hardcoding the card strings
	- Or create random strings to serve as placeholder so I can work on Game logic

2. Add Routes
	- these are discarded when no users are present
	- starts game when players > n || players are ready via 'ready button'

3. Add Game Logic
	- Black Card is randomized
	- players emit 'draw card' event at the start of the game
	- server 'deals card' by assigning a random card from deck to the requesting player (pop/push? how?)
	- Server? cycles through white cards, displaying the combined black/white response in the DOM.

4. Finish Styling/Refactor
	- Styled so that all mobile devices can display and interact smoothly

5. NiceToHaves
	- Private Tables ('socketio room password authentication/validation')
	- Democracy/Czar

6. Play