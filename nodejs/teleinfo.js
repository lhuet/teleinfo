var serialport = require('serialport');
var events = require('events');
var util = require('util');

function teleinfo(port) {
	// Evénements 'trame' et 'tramedecodee'
	var trameEvents = new events.EventEmitter();

	var serialPort = new serialport.SerialPort(port, {
		  baudrate: 1200,
		  dataBits: 7,
		  parity: 'even',
		  stopBits: 1,
		  // Caractères séparateurs = fin de trame + début de trame
		  parser: serialport.parsers.readline(String.fromCharCode(13,3,2,10))
		});

	serialPort.on('data', function(data) {
		trameEvents.emit('trame', data);
	});


	trameEvents.on('trame', function(data) {
		// Decode trame '9 lignes en tarif bleu'
		var trame = {};
		var arrayOfData = data.split('\r\n');
		for (var i=0; i < arrayOfData.length; i++) {
		  decodeLigne(arrayOfData[i], trame);
		}
		// trame incomplete s'il manque la première ligne ADCO
		if (!(trame['ADCO']===undefined)) {
		  trameEvents.emit('tramedecodee', trame);
		}
		else {
		  //console.log("Trame incomplete : \n" + util.inspect(trame));
		}
		
	});

  return trameEvents;
}


function decodeLigne(ligneBrute, trame) {
    // Ligne du type "PAPP 00290 ," (Etiquette / Donnée / Checksum)
    var elementsLigne = ligneBrute.split(' ');
    if (elementsLigne.length === 3) {
      // Spec chk : somme des codes ASCII + ET logique 03Fh + ajout 20 en hexadécimal
      // Résultat toujours un caractère ASCII imprimable allant de 20 à 5F en hexadécimal
      // Checksum calculé sur etiquette+space+données => retirer les 2 derniers caractères
      var sum = 0;
      for (var j=0; j < ligneBrute.length-2; j++) {
        sum += ligneBrute.charCodeAt(j);
      }
      sum = (sum & 63) + 32;
      if (sum === ligneBrute.charCodeAt(j+1)) {
        // Checksum ok -> on ajoute la propriété à la trame
        // Conversion en valeur numérique pour certains cas
        switch (elementsLigne[0].substr(0,4)) {
          case 'BASE': // Index Tarif bleu
          case 'HCHC': // Index Heures creuses
          case 'HCHP': // Index Heures pleines
          case 'EJPH': // Index EJP (HN et HPM)
          case 'BBRH': // Index Tempo (HC/HP en jours Blanc, Bleu et Rouge)
          case 'ISOU': // Intensité souscrite
          case 'IINS': // Intensité instantannée (1/2/3 pour triphasé)
          case 'ADPS': // Avertissement de dépassement
          case 'IMAX': // Intensité max appelée (1/2/3 pour triphasé)
          case 'PAPP': // Puissance apparente
          case 'PMAX': // Puissance max triphasée atteinte
            trame[elementsLigne[0]]= Number(elementsLigne[1]);
            break;
          default:
            trame[elementsLigne[0]]= elementsLigne[1];
        }
        return true;
      } else {
        // Checksum ko
        return false;
      }
    };
};


exports.teleinfo = teleinfo;

