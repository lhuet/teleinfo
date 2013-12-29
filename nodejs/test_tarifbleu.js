var tarifbleu = require('./tarifbleu');
var util = require('util');

var datalogger = function (data) {
  console.log(new Date());
  console.log(util.inspect(data));
}

tarifbleu.tarifbleu('/dev/ttyAMA0', '00 * * * * *', datalogger);

console.log('lancement datalogger tarifbleu');
