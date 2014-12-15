var mongo = require('./mongo');
var master = require('./cards.json');

var uri = 'mongodb://onepiece:luffylaw@ds063240.mongolab.com:63240/waieez';

//alternative is to just import the file directly 


mongo.connect(uri, function(){
	console.log('connected to mongo @ ' + uri);

	var coll = mongo.collection('card');
	var count = 0;

	master.forEach(function (doc){

		coll.insert(doc, {w:1}, function(err, obj){
			if (err) throw err.message;
		})

		count++
	})

	console.log(count+" Docs inserted into DB");
});


/* Mongodb Table View
{
    "_id": "id",
    "id": "id",
    "_cardType": "cardType",
    "_text": "text",
    "_expansion": "expansion"
}
*/