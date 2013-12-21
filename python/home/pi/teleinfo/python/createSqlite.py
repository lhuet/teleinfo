import sqlite3

db = sqlite3.connect('compteurElec.db')
c = db.cursor()
c.execute('create table teleinfo (id integer primary key, date timestamp, indexconso integer, intensite integer, puissance integer)')

