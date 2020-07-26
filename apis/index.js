const express = require('express');
const unirest = require('unirest');
const bodyParser = require('body-parser');
const multer = require('multer');
const rita = require('rita');
const qs = require('qs');
const url = require('url');

//this is where we get the POST form parser set up
const upload = multer();

//set app
const app = express();

//TENSORFLOW JS makes it easy to do cheap things with small things
//https://www.npmjs.com/package/@tensorflow/tfjs-node
const tf = require('@tensorflow/tfjs-node');

// Note: you do not need to import @tensorflow/tfjs here.
//this is the Image Classification model
const mobilenet = require('@tensorflow-models/mobilenet');






// Imports the Google Cloud client library, this is not used in non cloud deploys
const language = require('@google-cloud/language');


//gotta do this port for Google App Engine, yo!  This can be changed for other situations/on prem


const port = 8080;

/* BUILD OUT A BOOT PROCESS TO TEST EVERYTHING WITH AN INITIATION ROUTINE
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
*/

//this is to help parse JSON apis and stuff

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
//app.use(upload.array()); 

app.use(function (err, req, res, next) {
  console.log('This is the invalid field ->', err.field)
  next(err)
})

//this is what ya get if ya hit the root end point
app.get('/', (req, res) => res.send('Hey! I am maslo!'));


//very simple get API to show off the analyzeText JSON
app.get('/getJSON', function (req, res) {

//helper calcs
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

//useful function for text processing
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

//image parse
var mediaParse = async function (img) {


    // for getting the data images

  const imgToParse = tf.node.decodePng(img,3);

  // Object Classifications
  // Load the model.
  const model = await mobilenet.load();
  
  // Classify the image.
  const predictions = await model.classify(imgToParse);
  
  console.log('Image Object Predictions: ');
  console.log(predictions);



};


//analyzeMedia Post
app.post('/analyzeMedia',upload.single('media'),function (req, res) {

  //to handle included text use req.body
  // multer docs https://github.com/expressjs/multer
  //parse image and classify

//console.log(req.file.buffer);
//console.log(req.body);

  var parsedMediaOut = mediaParse(req.file.buffer);
  


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

//analyzeText Post
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