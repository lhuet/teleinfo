Module teleinfo
---------------
Module node.js pour décoder les trames téléinfo.
Il devrait fonctionner avec tous les tarifs et sur tout matériel compatible node avec un port série
(Testé sur Raspberry Pi avec tarif bleu).

Dépendance avec le module serialport :

    npm install serialport

Utilisation
-----------

Importer le module :

```javascript
var teleinfo = require('./teleinfo');
```

Récupérer l'instance d'EventEmitter du module en appelant la fonction teleinfo qui prend en paramètre le port série :

```javascript
// Exemple d'utilisation sur Raspberry Pi
var trameEvents = teleinfo.teleinfo('/dev/ttyAMA0');
```

Les trames téléinfo sont envoyées sous forme d'évènements :
* trame : trames brutes non vérifiées (utile uniquement à des fins de debug)
* tramedecodee : trames sous forme d'un objet (checksums validés pour chaque propriété)

Exemple :

```javascript
trameEvents.on('tramedecodee', function (data) {
  console.log(util.inspect(data));
});
```

Objet récupéré (data) du type :

```javascript
    { ADCO: '000000000000',
      OPTARIF: 'BASE',
      ISOUSC: 30,
      BASE: 6366719,
      PTEC: 'TH..',
      IINST: 1,
      IMAX: 30,
      PAPP: 300,
      MOTDETAT: '000000' }
```

Module tarifbleu
----------------
Module node.js exploitant les données spécifiques du tarif bleu.
Ce module utilise le module [cron](https://github.com/ncb000gt/node-cron) et utilise une fonction callback qu'elle exécute à fréquence donnée (configuration du cron).

Dépendance avec les modules teleinfo et cron :

    npm install cron

Utilisation
-----------

Importer le module :

```javascript
var tarifbleu = require('./tarifbleu');
```

Démarrer le 'job' en utilisant la fonction tarifbleu :

```javascript
tarifbleu.tarifbleu('/dev/ttyAMA0', '00 * * * * *', datalogger);
```

Les paramètres de cette fonction sont :

* Le nom du port
* La configuration du cron
* Une fonction callback prenant en paramètre l'objet de données

Contenu de l'objet de données :

```javascript
    { imini: 1,
      imaxi: 1,
      imoy: 1,
      pmini: 200,
      pmaxi: 210,
      pmoy: 208.57142857142858,
      index: 6401853,
      pinst: 210,
      iinst: 1 }
```

avec :
* imini, imaxi, imoy : l'intensité mini/maxi/moyenne pendant la période (en A)
* pmini, pmaxi, pmoy : puissance apparente mini/maxi/moyenne pendant la période (en VA)
* index : index compteur (en Wh)
* pinst, iinst : puissance apparente et intensité instantanées à la fin de la période
