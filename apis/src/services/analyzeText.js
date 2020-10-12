/* eslint-disable no-console */
// Text Based models
const toxicity = require('@tensorflow-models/toxicity');
const readabilityScores = require('readability-scores');
const Sentiment = require('sentiment');

// PARSE AND ANALYZE THE Text
// This isn't yet that interesting to require seperate functions.

const textParse = async function textParse(textInput, request, response) {
  // GET the text
  const sentences = textInput;

  // set the output object up
  const textJSON = {};

  // RESPOND BACK WITH ORIGINAL MEDIA ID
  textJSON.originTextID = request.body.originTextID;
  // textJSON['mediaID']=Date.now();

  // set a time out here for the response so we limit bad requests
  response.locals.analysisComplete = false;
  let tO = 100000;
  if (request.body.timeOut != null && request.body.timeOut !== '') {
    tO = parseInt(request.body.timeOut, 10);
  } else {
    tO = 100000;
  }

  response.setTimeout(tO, () => {
    // call back function is called when request timed out.
    // memory manage a bit
    // imgToParse.dispose();
    response.header('Access-Control-Allow-Origin', '*');
    response.locals.analysisComplete = true;
    response.send(408);
  });

  // BEGIN ANALYSIS

  // TOXICITY
  // The minimum prediction confidence.
  const threshold = 0.9;

  // Load the model. Users optionally pass in a threshold and an array of
  // labels to include.

  textJSON.nsfwLanguage = [];
  const toxMod = await toxicity.load(threshold);

  // `predictions` is an array of objects, one for each prediction head,
  // that contains the raw probabilities for each input along with the
  // final prediction in `match` (either `true` or `false`).
  // If neither prediction exceeds the threshold, `match` is `null`.
  textJSON.nsfwLanguage = await toxMod.classify(sentences).then((predictions) => predictions);

  console.log(textJSON.nsfwLanguage);

  // readability
  const readability = readabilityScores(sentences);
  textJSON.readability = readability;

  // sentiment
  const sentiment = new Sentiment();
  const sentimentOut = sentiment.analyze(sentences);
  console.log(sentimentOut); // Score: -2, Comparative: -0.666
  textJSON.sentimentScore = sentimentOut;

  // NOW PREP THE FINAL RESPONSE
  // SEND
  response.locals.analysisComplete = true;
  console.log(response.locals.analysisComplete);

  // memory manage a bit
  // textToParse.dispose();
  response.header('Access-Control-Allow-Origin', '*');
  response.setHeader('Content-Type', 'application/json');
  response.json(textJSON);
  response.removeAllListeners();
  response.end();

  return true;
};

// analyzeText Post
const analyzeText = function analyzeText(request, response) {
  textParse(request.body.media, request, response);
  console.log(request.body);
};

module.exports = {
  analyzeText,
  textParse,
};
