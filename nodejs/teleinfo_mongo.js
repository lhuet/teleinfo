var tarifbleu = require('./tarifbleu');
var util = require('util');
var assert = require('assert');
var mongoClient = require('mongodb').MongoClient;

var login = process.argv[2];
var pwd = process.argv[3];
var hostmongo = 'ds061928.mongolab.com';
var portmongo = '61928';
var databaseName = 'teleinfo';
var url = 'mongodb://'+login+':'+encodeURIComponent(pwd) + '@'+hostmongo+':'+portmongo+'/'+databaseName;
var collection;

mongoClient.connect(url, {uri_decode_auth: true, auto_reconnect: true }, function (err, db) {
    assert.equal(null, err);
    assert.ok(db != null);
    db.stats(function(err, stats) {
      assert.equal(null, err);
      assert.ok(stats != null);
    });
    console.log('Connexion database ok');
    collection = db.collection('teleinfo');
});

var mongologger = function (data) {
  var docToInsert = {
    'datetime' : new Date(),
    'indexcpt' : data.index,
    'imoy' : data.imoy,
    'imax' : data.imaxi,
    'pmoy' : data.pmoy,
    'pmax' : data.pmaxi
  };
  collection.insert(docToInsert, {safe: true}, function(err, records){
    if (err) {
      console.log(util.inspect(err));
    }
  });
};

// Log toutes les minutes
tarifbleu.tarifbleu('/dev/ttyAMA0', '00 * * * * *', mongologger);

console.log('Lancement datalogger Mongo tarifbleu');
