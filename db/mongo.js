//Modules
var MongoClient = require('mongodb').MongoClient,
    db,
    connected = false;

module.exports = {
  connect: function(url, callback){
    MongoClient.connect(url, function(err, _db){
      if (err) { throw new Error('Could not connect: '+err); }
      
      db = _db;
      connected = true;
      
      callback(db);
    });
  },
  collection: function(name){
    if (!connected) {
      throw new Error('Must connect to Mongo before calling "collection"');
    }
    
    return db.collection(name);
  }
};