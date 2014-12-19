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

5. Seed DB
	- card.json from https://github.com/samurailink3/hangouts-against-humanity/wiki/Cards
	- Had to tweak some character escaping to make it work with the node parser.

6. Game Logic
	- Changed behavior to have clients recieve same answer deck, which is hidden and shuffled clientside.
	- Hand is populated from client's deck on round start and on submit/draw event.

7. Struggle
	- Tried to have clients emit ready state to others via socket.io
	- Tried localcache as storage for ready state
	- Settled on MongoDB. Still Learning async control flow. For now will use nested callbacks

Plans:

2. MongoDB LRU
	- Periodically Delete Rooms based on creation date (aka LRU cache?);

3. Add Game Logic
	- Black Card is randomized
	- Client? cycles through white cards, displaying the combined black/white response in the DOM.

4. Finish Styling/Refactor
	- Styled so that all mobile devices can display and interact smoothly

5. NiceToHaves
	- Private Tables ('socketio room password authentication/validation')
	- Democracy/Czar

6. Play