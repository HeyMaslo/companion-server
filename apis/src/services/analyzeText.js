"use strict";

//Text Based models
const toxicity = require('@tensorflow-models/toxicity');
const readabilityScores = require('readability-scores');
const Sentiment = require('sentiment');


//PARSE AND ANALYZE THE Text
//This isn't yet that interesting to require seperate functions.

var textParse = async function (textInput, request, response) {

  //GET the text
  var sentences = textInput;

  //set the output object up
  var textJSON = {};

  //RESPOND BACK WITH ORIGINAL MEDIA ID
  textJSON['originTextID'] = request.body.originTextID;
  //textJSON['mediaID']=Date.now();

  //set a time out here for the response so we limit bad requests
  response.locals.analysisComplete = false;
  var tO = 100000;
  if (request.body.timeOut != null && request.body.timeOut != "") {

    tO = parseInt(request.body.timeOut, 10);
  }
  else {
    tO = 100000;
  }

  response.setTimeout(tO, function () {
    // call back function is called when request timed out.
    //memory manage a bit
    //imgToParse.dispose();
    response.header("Access-Control-Allow-Origin", "*");
    response.locals.analysisComplete = true;
    response.send(408);
  });

  //BEGIN ANALYSIS

  //TOXICITY
  // The minimum prediction confidence.
  const threshold = 0.9;

  // Load the model. Users optionally pass in a threshold and an array of
  // labels to include.

  textJSON['nsfwLanguage'] = [];
  var toxMod = await toxicity.load(threshold);
  textJSON['nsfwLanguage'] = await toxMod.classify(sentences).then(predictions => {
    // `predictions` is an array of objects, one for each prediction head,
    // that contains the raw probabilities for each input along with the
    // final prediction in `match` (either `true` or `false`).
    // If neither prediction exceeds the threshold, `match` is `null`.

    //console.log(predictions);
    return predictions;

    /*
    prints:
    {
      "label": "identity_attack",
      "results": [{
        "probabilities": [0.9659664034843445, 0.03403361141681671],
        "match": false
      }]
    },
    {
      "label": "insult",
      "results": [{
        "probabilities": [0.08124706149101257, 0.9187529683113098],
        "match": true
      }]
    },
    ...
    */
  });


  console.log(textJSON['nsfwLanguage'])

  //readability
  var readability = readabilityScores(sentences);
  textJSON['readability'] = readability;

  //sentiment
  var sentiment = new Sentiment();
  var sentimentOut = sentiment.analyze(sentences);
  console.log(sentimentOut);    // Score: -2, Comparative: -0.666
  textJSON['sentimentScore'] = sentimentOut;

  // NOW PREP THE FINAL RESPONSE
  //SEND 
  response.locals.analysisComplete = true;
  console.log(response.locals.analysisComplete);

  //memory manage a bit
  //textToParse.dispose();
  response.header("Access-Control-Allow-Origin", "*");
  response.setHeader('Content-Type', 'application/json');
  response.json(textJSON);
  response.removeAllListeners();
  response.end();

  return true;

}

//analyzeText Post
module.exports = function (request, response) {
  var dNow = Date.now();
  var yMod = 13;
  var d = new Date();
  var n = d.getHours();


  var textParsed = textParse(request.body.media, request, response);
  console.log(request.body);




  var outJSON =
  {
    "originTextID": "123213432",
    "writingLevel": "78",
    "ageLevel": "18",
    "educationGradeLevel": "11",
    "vocabularyComplexity": "0.6",
    "sentimentScore": "-0.25",
    "emotionalChargedLanguage": "1",
    "genderCodedLanguage": [
      "somewhat female"
    ],
    "nsfwLanguage": "1",
    "emotionalTone": [
      "sad",
      "happy",
      "upbeat",
      "etc"
    ]
  }
  //response.setHeader('Content-Type', 'application/json');
  // response.json(outJSON);



}

