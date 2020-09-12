"use strict";
// Basic libraries for nodejs, express application
const express = require('express');
const unirest = require('unirest');
const bodyParser = require('body-parser');
const multer = require('multer');
//const fetch = require('node-fetch');
global.fetch = require("node-fetch");
const path = require('path');

// Config
const port = 8080 | process.env.PORT;
const localModelURL = `http://localhost:${port}/`;

//const tfG = require('@tensorflow/tfjs-node-gpu');
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');


// Grab functionalities
const analyzeMedia = require('./services/analyzeMedia');
const analyzeText = require('./services/analyzeText');
const respondWithExampleJSON = require('./services/exampleJSON');


//this is where we get the POST form parser set up
const upload = multer();

//set app
const app = express();

//serve up models from this static path
app.use(express.static('models'))
app.use(bodyParser.raw({ limit: "100mb" })); // application/json
app.use(bodyParser.json({ limit: "100mb" })); //application/xwww-
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "100mb",
  })
);
// for parsing multipart/form-data
//app.use(upload.array()); 

app.use(function (err, req, res, next) {
  console.log('This is the invalid field ->', err.field)
  next(err)
})

//entity middleware function to do a full query parse into the semantic query we want.  
//https://googleapis.dev/nodejs/language/latest/index.html
var getEntities = async function (request, response, next) {
  next();
};



/**
 * GET  /
 */
app.get('/', (req, res) => res.send('Hey! I am maslo!'));

/**
 * GET  /getJSON
 */
app.get('/getJSON', function (req, res) {
  return respondWithExampleJSON(req, res);
});

/**
 * POST  /analyzeMedia
 */
app.post('/analyzeMedia', upload.single('media'), async function (req, res, next) {
  return analyzeMedia(req, res, next);
});

/**
 * POST  /analyzeText
 */
app.post('/analyzeText', upload.single('media'), (req, res) => {
  return analyzeText(req, res);
});

//SET THE APP to LISTEN FOR REQUESTS
app.listen(port, () => console.log(`Maslo Companion Server at http://localhost:${port}`))