var tarifbleu = require('./tarifbleu');
var util = require('util');

var datalogger = function (data) {
  console.log(new Date());
  console.log(util.inspect(data));
};

tarifbleu.tarifbleu('/dev/ttyAMA0', '00 * * * * *', datalogger);

setInterval(function() {
  console.log('Papp : ' + tarifbleu.getPuissanceApparente() + ' VA');
  console.log('Intensité : ' + tarifbleu.getIntensite() + ' A');
  console.log('Index compteur : ' + tarifbleu.getIndex() + ' Wh');
}, 2000);

console.log('Lancement datalogger tarifbleu');
