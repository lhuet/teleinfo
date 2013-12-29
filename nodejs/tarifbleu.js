var cronJob = require('cron').CronJob;
var teleinfo = require('./teleinfo');
var mongodb = require('mongodb');
var util = require('util');

var trameEvents;
var conso = {};

function tarifbleu(port, cronTime, datalogger) {

  trameEvents = teleinfo.teleinfo(port);
  razconso();
  trameEvents.on('tramedecodee', function (data) {
    majData(data);
  });

  var job = new cronJob(cronTime, function(){
      // Fonction exécutée toutes les minutes
      if (typeof datalogger === 'function') {
        // Suppression propriétés internes
        delete conso.psum;
        delete conso.isum;
        delete conso.nb_mesure;
        datalogger(conso);
      }
      else {
        console.log(util.inspect(conso));
      }
      // Raz moyenne
      razconso();
    }, function () {
      // Fonction exécutée lorsque le job s'arrête
      console.log('Job stoppé');
    },
    true
  );


}


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

function majData(data) {
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
}


exports.tarifbleu = tarifbleu;
