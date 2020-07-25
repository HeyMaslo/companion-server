const express = require('express');
const unirest = require('unirest');
const bodyParser = require('body-parser');
const ElizaBot = require('elizabot');
const rita = require('rita');
//const wtf = require('wtf_wikipedia')
const qs = require('qs');
const url = require('url');
const app = express();

//TENSORFLOW JS makes it easy to do cheap things with small things
//https://www.npmjs.com/package/@tensorflow/tfjs-node
const tf = require('@tensorflow/tfjs-node');

// Imports the Google Cloud client library
const language = require('@google-cloud/language');


//gotta do this port for Google App Engine, yo!  This can be changed for other situations/on prem


const port = 8080;

const model = tf.sequential();
model.add(tf.layers.dense({ units: 1, inputShape: [200] }));
model.compile({
  loss: 'meanSquaredError',
  optimizer: 'sgd',
  metrics: ['MAE']
});


// Generate some random fake data for demo purpose.
const xs = tf.randomUniform([10000, 200]);
const ys = tf.randomUniform([10000, 1]);
const valXs = tf.randomUniform([1000, 200]);
const valYs = tf.randomUniform([1000, 1]);


// Start model training process.
async function train() {
  await model.fit(xs, ys, {
    epochs: 100,
    validationData: [valXs, valYs],
    // Add the tensorBoard callback here.
    callbacks: tf.node.tensorBoard('/tmp/fit_logs_1')
  });
}
train();

// --------------- IMPORTANT CODE PHILOSOPHY NOTE ------------------------------------//

/*
    @un1crom, the original author of this crazed code base is not a super big fan of
    Test Driven Dev or really strict QA first approaches to code bases.  

    why?
    a) unless the code base deals with money transactions or life altering situations TTD is usually overkill in design phase
    b) the universe is computationally irreducible so TTD is only going to catch the most trivial of design patterns
    c) there's a lot of overhead to linting and all that stuff.
    d) i tend to think functionally anyway and try to make super self contained small things that are expressive
    e) try/catches are good though.  especially on weird async stuff
    f) i'm too old and cranky to get all weird about it.  if you hate this code style then you'll change it
    g) javascript is terrible anyway, one never knows what's really happening, so it's someone elses fault.
    h) this is why i am always the first dev on a project AND NEVER THE LAST
    i) never take my advice on anything important

*/

/*TODOS and NOTES to SELF and SCRATCH PAD

Get 
*/

// The Empathetic Engine Begins here

//this is to help parse JSON apis and stuff

app.use(bodyParser.json());

//this is what ya get if ya hit the root end point
app.get('/', (req, res) => res.send('Hey! I am maslo!'));


//very simple get API to show off the analyzeText JSON
app.get('/getJSON', function (req, res) {
var dNow=Date.now();
var yMod=13;
var d = new Date();
var n = d.getHours();
  var outJSON =
  {
    "originMediaID": "062fea4d-efdd-4a7f-92b1-4039503efd5b",
    "mediaID": 3919454996583159000,
    "scenes": [
      {
        "tag": "travel photo",
        "salience": 0.85
      },
      {
        "tag": "outside",
        "salience": 0.65
      }
    ],
    "timeOfDay": {
      "tag": "morning",
      "salience": 0.88
    },
    "emotionTags": [
      {
        "tag": "sad",
        "salience": 0.98
      },
      {
        "tag": "happy",
        "salience": 0.82
      },
      {
        "tag": "laughing",
        "salience": 0.76
      }
    ],
    "sentiment": 0.6,
    "facialExpressions": [
      {
        "tag": "smiling",
        "salience": 0.92
      },
      {
        "tag": "frowning",
        "salience": 0.78
      },
      {
        "tag": "anger",
        "salience": 0.51
      },
      {
        "tag": "surprise",
        "salience": 0.24
      }
    ],
    "faceCount": 4,
    "personsCount": 4,
    "personsClothed": 0.8,
    "mediaImageResolution": {
      "height": 1000,
      "width": 1000
    },
    "mediaFileSize": 23432,
    "mediaDominantColors": [
      "#FFFFFF",
      "#EEEEEE"
    ],
    "mediaCompressionSize": 120,
    "mediaVisualFocus": [
      "blurry"
    ],
    "mediaEstimatedCreationDate": 2018,
    "mediaInterestingness": 0.3,
    "primarySubjectFaceVisible": {
      "visibility": 0.6,
      "boundingX": 225,
      "boundingY": 52,
      "boundingHeight": 375,
      "boundingWidth": 280
    },
    "secondarySubjectFaceVisible": {
      "visibility": 0.6,
      "boundingX": 225,
      "boundingY": 52,
      "boundingHeight": 375,
      "boundingWidth": 280
    },
    "isAnimal": [
      {
        "tag": "dog",
        "salience": 0.89
      },
      {
        "tag": "tiger",
        "salience": 0.25
      }
    ],
    "primarySubjectGender": {
      "tag": "female",
      "salience": 0.95
    },
    "pose": [
      "selfie",
      "front",
      "side",
      "fullbody",
      "etc."
    ],
    "composition": [
      "rule of thirds",
      "portrait",
      "landscape",
      "etc."
    ],
    "photoManipulation": 0.7,
    "photoFilter": [
      "instagram",
      "snapchat",
      "photoshop",
      "unrecognized"
    ]
  }
  res.setHeader('Content-Type', 'application/json');
res.json(outJSON);


}
);

//useful function
var capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}


//entity middleware function to do a full query parse into the semantic query we want.  
//https://googleapis.dev/nodejs/language/latest/index.html
var getEntities = async function (request, response, next) {

  next();

};

//This stays off for now...  until entities is replaced with a non google api
//app.use(getEntities);

//analyzeMedia Post
app.post('/analyzeMedia',function (req, res) {
  var dNow=Date.now();
  var yMod=13;
  var d = new Date();
  var n = d.getHours();
    var outJSON =
    {
      "originMediaID": "062fea4d-efdd-4a7f-92b1-4039503efd5b",
      "mediaID": 3919454996583159000,
      "scenes": [
        {
          "tag": "travel photo",
          "salience": 0.85
        },
        {
          "tag": "outside",
          "salience": 0.65
        }
      ],
      "timeOfDay": {
        "tag": "morning",
        "salience": 0.88
      },
      "emotionTags": [
        {
          "tag": "sad",
          "salience": 0.98
        },
        {
          "tag": "happy",
          "salience": 0.82
        },
        {
          "tag": "laughing",
          "salience": 0.76
        }
      ],
      "sentiment": 0.6,
      "facialExpressions": [
        {
          "tag": "smiling",
          "salience": 0.92
        },
        {
          "tag": "frowning",
          "salience": 0.78
        },
        {
          "tag": "anger",
          "salience": 0.51
        },
        {
          "tag": "surprise",
          "salience": 0.24
        }
      ],
      "faceCount": 4,
      "personsCount": 4,
      "personsClothed": 0.8,
      "mediaImageResolution": {
        "height": 1000,
        "width": 1000
      },
      "mediaFileSize": 23432,
      "mediaDominantColors": [
        "#FFFFFF",
        "#EEEEEE"
      ],
      "mediaCompressionSize": 120,
      "mediaVisualFocus": [
        "blurry"
      ],
      "mediaEstimatedCreationDate": 2018,
      "mediaInterestingness": 0.3,
      "primarySubjectFaceVisible": {
        "visibility": 0.6,
        "boundingX": 225,
        "boundingY": 52,
        "boundingHeight": 375,
        "boundingWidth": 280
      },
      "secondarySubjectFaceVisible": {
        "visibility": 0.6,
        "boundingX": 225,
        "boundingY": 52,
        "boundingHeight": 375,
        "boundingWidth": 280
      },
      "isAnimal": [
        {
          "tag": "dog",
          "salience": 0.89
        },
        {
          "tag": "tiger",
          "salience": 0.25
        }
      ],
      "primarySubjectGender": {
        "tag": "female",
        "salience": 0.95
      },
      "pose": [
        "selfie",
        "front",
        "side",
        "fullbody",
        "etc."
      ],
      "composition": [
        "rule of thirds",
        "portrait",
        "landscape",
        "etc."
      ],
      "photoManipulation": 0.7,
      "photoFilter": [
        "instagram",
        "snapchat",
        "photoshop",
        "unrecognized"
      ]
    }
    res.setHeader('Content-Type', 'application/json');
  res.json(outJSON);



});

//analyzeMedia Post
app.post('/analyzeText',function (req, res) {
  var dNow=Date.now();
  var yMod=13;
  var d = new Date();
  var n = d.getHours();
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
    res.setHeader('Content-Type', 'application/json');
  res.json(outJSON);



});

app.listen(port, () => console.log(`Maslo Companion Server at http://localhost:${port}`))