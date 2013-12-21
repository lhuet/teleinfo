teleinfo.sh 
-----------

Script lancé par cron toutes les minutes (cf /etc/cron.d/teleinfo)


teleinfo_mongo.py
-----------------

Script python pour logger dans une base sqlite3 ou dans une base mongodb.
(ligne commentée pour la base sqlite3)
Attention à la durée de vie de la carte SD si stockage de la base sqlite3 sur celle-ci.

Le décodage des trames de compteur EDF prend en compte uniquement le tarif bleu pour le moment.

logging.conf
------------

Configuration de la conf des logs du script python.


createSqlite.py
---------------

Script de création de la base sqlite3 (create table)



