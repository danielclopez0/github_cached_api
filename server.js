'use strict'

var express = require('express');
var cors = require('cors');
var app = express();
var mcache = require('memory-cache');
const fetch = require("node-fetch");

var cache = (duration) => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url
    let cachedBody = mcache.get(key)
    if (cachedBody) {
      res.send(cachedBody)
      return
    } else {
      res.sendResponse = res.send
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body)
      }
      next()
    }
  }
}
app.use(cors())

app.get('/', cache(10), (req, res) => {
  res.json({ title: 'Hey', message: 'Hello there', date: new Date()})
})

app.get('/repo/:searchString/:sort', cache(10), (req, res) => {
  const { searchString, sort } = req.params;
  const url = `https://api.github.com/search/repositories?q=${searchString}&sort=${sort}&order=desc`;

  fetch(url)
    .then(response => response.json())
    .then(data => res.json(data))
})
// app.use((req, res) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   res.status(404).send('') //not found
// })

app.listen(3001, function () {
  console.log(`Listening on port 3001!`)
})
