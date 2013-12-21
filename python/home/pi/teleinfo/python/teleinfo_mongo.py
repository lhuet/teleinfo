#!/usr/bin/env python

import sys, serial, time, logging, logging.config, pprint, datetime, sqlite3, pymongo
from pymongo import MongoClient

# Port serie : /dev/ttyAMA0, 1200 Baud, 7E1

# Trame commence par STX et fini par ETX
# Exemple pour tarif bleu

# MOTDETAT 000000 B
# ADCO 200000294579 P
# OPTARIF BASE 0
# ISOUSC 30 9
# BASE 002565285 ,
# PTEC TH.. $
# IINST 002 Y
# IMAX 030 B
# PAPP 00420 '


def lectureTrame(ser):
	"""Lecture d'une trame sur le port serie specifie en entree.
	La trame debute par le caractere STX (002 h) et fini par ETX (003 h)"""
	logger = logging.getLogger(__name__)
	# Lecture d'eventuel caractere avant le debut de trame
	# Jusqu'au caractere \x02 + \n (= \x0a)
	trame = list()
	while trame[-2:]!=['\x02','\n']:
		trame.append(ser.read(1))
	logger.debug('Lecture de caracteres avant trame : \n' + pprint.pformat(trame))
	# Lecture de la trame jusqu'au caractere \x03
	trame=list()
	while trame[-1:]!=['\x03']:
		trame.append(ser.read(1))
	logger.debug('Lecture de caracteres trame (avant pop) : ' + pprint.pformat(trame))
	# Suppression des caracteres de fin '\x03' et '\r' de la liste
	trame.pop()
	trame.pop()
	return trame

def decodeTrame(trame):
	"""Decode une trame complete et renvoie un dictionnaire des elements"""
	logger = logging.getLogger(__name__)
	# Separation de la trame en groupe
	lignes = trame.split('\r\n')
	logger.debug('Groupes de la trame : \n' + pprint.pformat(lignes))
	result = {}
	for ligne in lignes:
		tuple = valideLigne(ligne)
		result[tuple[0]]=tuple[1]
	return result

def valideLigne(ligne):
	"""Retourne les elements d'une ligne sous forme de tuple si le checksum est ok"""
	logger = logging.getLogger(__name__)
	chk = checksumLigne(ligne)
	items = ligne.split(' ')
	if ligne[-1]==chk:
		return (items[0], items[1])
	else:
		logger.error("Pb de checksum : calcul = " + chk + " / chk dans trame = " + items[2])
		raise Exception("Checksum error")

def checksumLigne(ligne):
	"""Verifie le checksum d'une ligne et retourne un tuple"""
	logger = logging.getLogger(__name__)
	sum = 0
	for ch in ligne[:-2]:
		sum += ord(ch)
	sum = (sum & 63) + 32
	logger.debug("Checksum ligne : " + ligne + " ==> " + chr(sum))
	return chr(sum)

def ligneToCSV(lignes, cles):
	ligneCSV = list()
	ligneCSV.append(time.strftime("%Y-%m-%d", time.localtime()))
	ligneCSV.append(time.strftime("%H:%M:%S", time.localtime()))
	for cle in cles:
		# Attention, transformation de String en Int ... Toutes les cles ne fonctionnent pas !!!
		# Double conversion pour supprimer les 0 a gauche
		valeur = str(int(lignes[cle]))
		ligneCSV.append(valeur)
	return ";".join(ligneCSV)

def ligneToSQLite(lignes):
	db = sqlite3.connect('/home/pi/teleinfo/python/compteurElec.db', detect_types = sqlite3.PARSE_COLNAMES)
	c = db.cursor()
	c.execute('insert into teleinfo(date, indexconso, intensite, puissance) values(?, ?, ?, ?)'
			, (datetime.datetime.now(), lignes['BASE'], lignes['IINST'], lignes['PAPP']))
	db.commit()

def ligneToMongo(lignes):
	client = MongoClient('moninstance.mongolab.com', 41758)
	db = client.home
	db.authenticate('monlogin','monpassword')
	collection = db['ConsoElec']
	docToInsert = {"datetime": datetime.datetime.now(),
								"indexconso": int(lignes['BASE']),
								"intensite": int(lignes['IINST']),
								"puissance": int(lignes['PAPP'])}
	collection.insert(docToInsert)
	client.close

if __name__ == '__main__':
	# Initialisation Logger
	logging.config.fileConfig('/home/pi/teleinfo/python/logging.conf')
	logger = logging.getLogger(__name__)
	# Lecture du port serie
	ser = serial.Serial('/dev/ttyAMA0', 1200, 7, 'E', 1, timeout=1)
	ser.open()

	for i in range(2):
		logger.debug("tentative " + str(i))
		error = False
		ligneCSV = ''
		try:
			trame = lectureTrame(ser)
			# traitement de la trame
			lignes = decodeTrame("".join(trame))
			# export CSV
			ligneCSV = ligneToCSV(lignes, ['BASE','IINST', 'PAPP'])
			# Insertion en base
			# ligneToSQLite(lignes)
			ligneToMongo(lignes)
		except Exception as e:
			logger.error("Erreur : " + str(e))
			logger.error("Pb de lecture -> tentative complementaire " + str(i))
			error = True

		if not error:
			break;

	print ligneCSV

	ser.close()
	
