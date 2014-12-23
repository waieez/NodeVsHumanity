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

8. Struggle v2
	- Added logic for selecting czar
	- Switched flow to accomodate czar's response
	- Tried to refactor clientside code and ended up introducing a multiple emitter bug
	- Currently control flow of game is mostly set. Game is rough but playable.

9. Heroku
	- Not as straightforward as implied.
	- IT'S ALIVE~!
	- A bit of styling

10. Refactor, Add Features
	- Moved Clientside script into own js file
	- Last Player to leave triggers room cleanup
	- Begin implementation of new Data Structure to better represent game data.
	- Implement Scores

Plans:

2. MongoDB LRU
	- Periodically Delete Rooms based on creation date (aka LRU cache?);

3. Add Game Logic
	- perhaps check ready status based on number of responses czar has, or use $inc to increment numReady

5. NiceToHaves
	- Notification for new players to understand game flow.
	- Private Tables ('socketio room password authentication/validation')
	- Custom settings
	- Welcome page
	- Democracy

6. Play