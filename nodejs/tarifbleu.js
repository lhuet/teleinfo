var cronJob = require('cron').CronJob;
var teleinfo = require('./teleinfo');
var util = require('util');

var trameEvents = teleinfo.teleinfo('/dev/ttyAMA0');

var conso = {};

function razconso() {
  conso.imini = 30; // max de la souscription
  conso.imaxi= 0;
  conso.imoy= 0;
  conso.isum= 0;
  conso.pmini= 8000; // max la souscription
  conso.pmaxi= 0;
  conso.pmoy= 0;
  conso.psum= 0;
  conso.nb_mesure= 0;
}

razconso();

trameEvents.on('tramedecodee', function (data) {
  //console.log(util.inspect(data));
  conso.nb_mesure += 1;
  if (data['IINST']<conso.imini) {
    conso.imini = data['IINST'];
  }
  if (data['IINST']>conso.imaxi) {
    conso.imaxi = data['IINST'];
  }
  conso.isum += data['IINST'];
  conso.imoy = conso.isum / conso.nb_mesure;
  if (data['PAPP']<conso.pmini) {
    conso.pmini = data['PAPP'];
  }
  if (data['PAPP']>conso.pmaxi) {
    conso.pmaxi = data['PAPP'];
  }
  conso.psum += data['PAPP'];
  conso.pmoy = conso.psum / conso.nb_mesure;
  conso.index = data['BASE'];
});


var job = new cronJob('00 * * * * *', function(){
    // Fonction exécutée toutes les minutes
    console.log(util.inspect(conso));
    // TODO : Logguer dans une base mongo
    // Raz moyenne
    razconso();
  }, function () {
    // Fonction exécutée lorsque le job s'arrête
    console.log('Job stoppé');
  },
  true
);

console.log("Lancement du cron téléinfo");
