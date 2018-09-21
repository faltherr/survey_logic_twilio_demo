const express = require('express');
const bodyParser = require('body-parser')
const massive = require('massive')
const controller = require('./controller');
// const urlencoded = require('body-parser').urlencoded
require('dotenv').config()

const {CONNECTION_STRING} = process.env

const app = express();

massive(CONNECTION_STRING).then(db =>{
    app.set('db', db)
    console.log('db is connected')
})

app.use(bodyParser.json())
// app.use(urlencoded({ extended: true }));

app.post('/sms', controller.emergency)

// app.post('/sms/register', message)

app.listen(1337, () => {
  console.log('Express server listening on port 1337');
});