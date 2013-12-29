Module node.js teleinfo
-----------------------
Module node.js pour décoder les trames téléinfo.
Tester du Raspberry Pi avec tarif bleu (devrait fonctionner avec tous les tarifs)

Utilisation
-----------

Importer le module :

    var teleinfo = require("./teleinfo");

Récupérer l'instance d'EventEmitter du module en appelant la fonction teleinfo qui prend en paramètre le port série :
    
    // Exemple d'utilisation sur Raspberry Pi
    var trameEvents = teleinfo.teleinfo("/dev/ttyAMA0");

Les trames téléinfo sont envoyée sous forme d'évènements :
* trame : trames brutes non vérifiées (utile uniquement à des fins de debug)
* tramedecodee : trames (checksums validés pour chaque propriété) sous forme d'un objet 

Exemple :

    trameEvents.on('tramedecodee', function (data) {
      console.log(util.inspect(data));
    });

Objet récupéré (data) du type :

    { ADCO: '000000000000',
      OPTARIF: 'BASE',
      ISOUSC: 30,
      BASE: 6366719,
      PTEC: 'TH..',
      IINST: 1,
      IMAX: 30,
      PAPP: 0300,
      MOTDETAT: '000000' }


