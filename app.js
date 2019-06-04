const express = require('express');
const app = express();
const PORT = 1234;
const mysql = require('mysql');
require('dotenv').config();
app.use(express.static('public'));
app.use(express.json());


const conn = mysql.createConnection({
  host: 'localhost',
  user: 'ncrmns',
  password: process.env.DB_PASS,
  database: 'aliases'
});

app.get('/', (req, res) => {
  res.sendFile('index.html');
});
///
app.post('/api/links', (req, res) => {
  const { url, alias } = req.body;

  dbHasThis(url, alias)
    .then(() => dbInsert(url, alias))
    .then(insertId => dbRequestRecordById(insertId))
    .then(record => res.status(200).send(record))
    .catch(error => res.status(400).json({ error: error }))
});

app.get('/a/:alias', (req, res) => {
  const { alias } = req.params;
  dbUpdateScoreByAlias(alias)
    .then(() => dbRequestRecordByAlias(alias))
    .then(record => res.redirect(200, record.url))
    .catch(error => res.status(404).json(error))
});

app.get('/api/links', (req, res) => {
  dbRequestAll()
    .then(records => res.status(200).json(records))
    .catch(error => res.status(400).send(error))
});

app.delete('/api/links/:id', (req, res) => {
  const { id } = req.params;
  console.log(req.body.secretCode)
  dbRequestRecordById(id)
  .then(data => data.secretcode == req.body.secretCode ? dbDeleteBySecretCode(secretCode) : res.status(403).send('Secret code and id doesnt match'))
    .then(()=> res.status(204).send())
    .catch(error=> res.status(404).send(error))
  
});

app.listen(PORT, () => console.log('Server is listening on port: ' + PORT));

function dbHasThis(url, alias) {
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT (SELECT count(*) FROM aliases WHERE url=?) AS urlcount, (SELECT count(*) FROM aliases WHERE alias=?) AS aliascount;',
      [url, alias],
      (err, data) => {
        if (data[0].urlcount > 0)
          reject('URL is already in use');
        else if (data[0].aliascount > 0)
          reject('Alias is already in use');
        else
          resolve();
      });
  });
}

function dbInsert(url, alias) {
  return new Promise((resolve, reject) => {
    conn.query(
      'INSERT INTO aliases (url, alias, secretcode) VALUES (?,?,?);',
      [url, alias, Math.floor(Math.random() * (9999 - 1000) + 1000)],
      (err, insertdata) => {
        if (err)
          reject('There was an error updating the database');
        else
          resolve(insertdata.insertId);
      }
    )
  });
}

function dbRequestRecordById(id) {
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT * FROM aliases WHERE id=?;',
      [id],
      (err, record) => {
        if (err)
          reject('There was an error requesting the record');
        else
          resolve(record[0])
      });
  });
}

function dbUpdateScoreByAlias(alias) {
  return new Promise((resolve, reject) => {
    conn.query(
      'UPDATE aliases SET hitcount = hitcount + 1 WHERE alias=?;',
      [alias],
      (err, record) => {
        if (err)
          reject('There is no record with given alias');
        else
          resolve(record)
      });
  });
}

function dbRequestRecordByAlias(alias) {
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT * FROM aliases WHERE alias=?;',
      [alias],
      (err, record) => {
        if (err)
          reject('There is no record with given alias');
        else
          resolve(record[0])
      });
  });
}

function dbRequestAll() {
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT id, url, alias, hitcount FROM aliases;',
      (err, record) => {
        if (err)
          reject('There was an error requesting the records');
        else
          resolve(record)
      });
  });
}

function dbDeleteBySecretCode(secretcode){
  return new Promise((resolve,reject)=>{
    conn.query(
      'DELETE FROM aliases WHERE secretcode=?;',
      [secretcode],
      (err,data)=>{
        if (err)
          reject(err);
        else
          resolve();
      });
  });
}