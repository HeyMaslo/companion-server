// Basic libraries for nodejs, express application
const express = require('express');
const unirest = require('unirest');
const bodyParser = require('body-parser');
const multer = require('multer');
const rita = require('rita');
const qs = require('qs');
const url = require('url');
//const fetch = require('node-fetch');
global.fetch = require("node-fetch");
const path = require('path');
const fs = require("fs");
const assert = require('assert');

//traditional image processing and other media helpers
const { Image } = require('image-js');
const ce = require('colour-extractor');
const gm = require('gm');
const ColorThief = require('color-thief');
var Jimp = require('jimp');
const zlib = require('zlib');
const jpeg = require('jpeg-js');
const jsfeat = require('jsfeat');
const sharp = require('sharp');


//TENSORFLOW JS makes it easy to do cheap things with small things
// https://www.npmjs.com/package/@tensorflow/tfjs-node
// get almost any kind of model you want here: https://tfhub.dev/
// the harder work, of course, is in the choices of integration and synthesis.


// Tensorflow kernels and libraries
const tfN = require('@tensorflow/tfjs');
const tf = require('@tensorflow/tfjs-node');
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const { image } = require('@tensorflow/tfjs-node');
const automl = require("@tensorflow/tfjs-automl");
const tfconv = require('@tensorflow/tfjs-converter');

//Text Based models
const toxicity = require('@tensorflow-models/toxicity');
const readabilityScores = require('readability-scores');
const Sentiment = require('sentiment');

//non-Tensorflow ML libraries
const tmImage = require('@teachablemachine/image');
const onnxjs = require('onnxjs');
require("onnxjs-node");

// Tensflow trained models.
//NOTE THAT SOME OF THESE ACCESS THE INTERNET BY DEFAULT.  Change that.
const mobilenet = require('@tensorflow-models/mobilenet');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const blazeface = require('@tensorflow-models/blazeface');
const facemesh = require('@tensorflow-models/facemesh');
const posenet = require('@tensorflow-models/posenet');
const nsfw = require('nsfwjs');


//we need to get all the models loaded up on BOOT, not run time.  the models dont change request to request.  (though there is a case to be made to not boot a giant set of things into memory)
const deeplab = require('@tensorflow-models/deeplab');

// this is how we can swap out for LOCAL models, not internet ones.  so download them and bring them in locally
const loadModelDeepLab = async () => {
  const modelName = 'pascal';   // set to your preferred model, either `pascal`, `cityscapes` or `ade20k`
  const quantizationBytes = 2;  // either 1, 2 or 4
  const url = 'https://tfhub.dev/tensorflow/tfjs-model/deeplab/pascal/1/default/1/model.json?tfjs-format=file';
  return await deeplab.load({modelUrl: url,base: modelName, quantizationBytes});
};

//load Deeplab - may wanna remove this
loadModelDeepLab().then(() => console.log(`Loaded the DeepLab successfully!`));

const imageSegmentation = async (imageParse) => {
        console.log(imageParse);
        //console.log(loadModelDeepLab);

        //for now we are just passing back the segments and "colors", but we should pass back the map itself.
       return await loadModelDeepLab()
            .then((model) => model.segment(imageParse))
             .then(
            ({legend}) =>
               // console.log(`The predicted classes are ${JSON.stringify(legend)}`);
                legend
                );
        /* if we want to return the segmentation map
               return await loadModelDeepLab()
            .then((model) => model.segment(imageParse))
             .then(
            (segmentationMap) =>
               // console.log(`The predicted classes are ${JSON.stringify(legend)}`);
                segmentationMap
                );
        */
        //return await loadModelDeepLab.model.segment(imageParse);
    }



const loadModelsOld = async function (modelURL,request, response) {
  const MODELS_URL = path.join(__dirname, '/models');
  console.log(MODELS_URL);

  
  
  /*
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_URL);
// accordingly for the other models:
  await faceapi.nets.tinyFaceDetector.loadFromDisk(MODELS_URL);
  await faceapi.nets.mtcnn.loadFromDisk(MODELS_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_URL);
  await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(MODELS_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_URL);
  await faceapi.nets.faceExpressionNet.loadFromDisk(MODELS_URL);
  

 await faceapi.loadSsdMobilenetv1Model('/models')
 // accordingly for the other models:
 // await faceapi.loadTinyFaceDetectorModel('/models')
 // await faceapi.loadMtcnnModel('/models')
 // await faceapi.loadFaceLandmarkModel('/models')
 // await faceapi.loadFaceLandmarkTinyModel('/models')
 // await faceapi.loadFaceRecognitionModel('/models')
 // await faceapi.loadFaceExpressionModel('/models')
*/

};

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement, additionally an implementation
// of ImageData is required, in case you want to use the MTCNN

//FACE API is a useful face algo, but it doesn't play nice with TF 2.0
// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
const canvas= require('canvas');
const faceapi=require('face-api.js');
const { Canvas, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
faceapi.env.monkeyPatch({ fetch: fetch });
//tmImage.env.monkeyPatch({ Canvas });

// Imports the Google Cloud client library, this is not used in non cloud deploys
const language = require('@google-cloud/language');
const { response } = require('express');
const { parse } = require('path');


//Final Express Application constants/variables


//this is where we get the POST form parser set up
const upload = multer();

//set app
const app = express();


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


// MIDDLE WARE and ROUTE HANDLING
//serve up models
app.use(express.static('models'))

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

//load up all the models for the app so each API call is fast
var loadModelsVeryOld = async function (request, response, next) {
  const MODELS_URL = path.join(__dirname, '/models');
  console.log(MODELS_URL);

  
  
  /*
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_URL);
// accordingly for the other models:
  await faceapi.nets.tinyFaceDetector.loadFromDisk(MODELS_URL);
  await faceapi.nets.mtcnn.loadFromDisk(MODELS_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_URL);
  await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(MODELS_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_URL);
  await faceapi.nets.faceExpressionNet.loadFromDisk(MODELS_URL);
  

 await faceapi.loadSsdMobilenetv1Model('/models')
 // accordingly for the other models:
 // await faceapi.loadTinyFaceDetectorModel('/models')
 // await faceapi.loadMtcnnModel('/models')
 // await faceapi.loadFaceLandmarkModel('/models')
 // await faceapi.loadFaceLandmarkTinyModel('/models')
 // await faceapi.loadFaceRecognitionModel('/models')
 // await faceapi.loadFaceExpressionModel('/models')
*/
  next();

};

//app.use(loadModels);


//HELPER FUNCTIONS FOR SOME MODELS
function loadModelOld() {
  tf.load
	return tf.loadModel('gender/model.json');
}

function saveModelToLocalStorage(model) {
	return model.save('localstorage://model');
}

function predict(tensor, model) {
	return model.predict(tensor);
}

function preprocessTensor(imageData) {
		let tensor = tf.browser.fromPixels(imageData);
		tensor = tf.cast(tensor, 'int32');
		tensor = tensor.div(255.0);
		tensor = tensor.expandDims(0);
		return tensor;
}

const convert = async (img) => {
  // Decoded image in UInt8 Byte array
  const image = await jpeg.decode(img, true)

  const numChannels = 3
  const numPixels = image.width * image.height
  const values = new Int32Array(numPixels * numChannels)

  for (let i = 0; i < numPixels; i++)
    for (let c = 0; c < numChannels; ++c)
      values[i * numChannels + c] = image.data[i * 4 + c]

  return tf.tensor3d(values, [image.height, image.width, numChannels], 'int32')
}

// REQUEST HANDLERS
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

//PARSE AND ANALYZE THE IMAGE
var mediaParse = async function (img, request, response) {
  
  //set a time out here for the response so we limit bad requests
  response.locals.analysisComplete = false;

  response.setTimeout(7000, function(){
    // call back function is called when request timed out.
      //memory manage a bit
  imgToParse.dispose();
    response.locals.analysisComplete=true;
    response.send(408);
    });



//SET UP OUTPUT  
var analysisJSONReference =
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
};

var analysisJSON= {};

console.log(request.body);



//RESPOND BACK WITH ORIGINAL MEDIA ID
analysisJSON['originMediaID']=request.body.originMediaID;
analysisJSON['mediaID']=Date.now();


// CONVERT IMAGE BUFFER FOR TENSORFLOW

  const imgToParse = tf.node.decodeImage(img,3);
 // const imgToParse4D = tf.node.decodeImage(img,3);

//GET BASIC INFO ABOUT THE IMAGE
  //first the basics of image processing
  //https://image-js.github.io/image-js/#imagecomponents

  let imageBasics = await Image.load(img);

  /* This is too slow
//TESTING JS FEAT

//context2d.drawImage(video, 0, 0, width, height);
//var image_data = context2d.getImageData(0, 0, width, height);
var image_data = imageBasics;
var gray_img = new jsfeat.matrix_t(imageBasics.width, imageBasics.height, jsfeat.U8_t | jsfeat.C1_t);
var code = jsfeat.COLOR_RGBA2GRAY;
var jsFeatOut={}
jsFeatOut=await jsfeat.imgproc.grayscale(image_data, imageBasics.width, imageBasics.height, gray_img, code);
analysisJSON['imageLines']=jsFeatOut;
var matrix = new jsfeat.matrix_t(2,2, jsfeat.U8_t | jsfeat.C1_t);
matrix.data[1] = 4; 
console.log(matrix.data[1]);

console.log("jsfeat: " + jsFeatOut);
*/


  //console.log(imageBasics.getHistograms());

      var ct = new ColorThief();
      var palette = ct.getPalette(img, 5);
      
      analysisJSON['mediaDominantColors']=palette.map(x=>ce.rgb2hex(x));

    //map over all the colors to convert
    //ce.rgb2hex(colours[0][0][1])

      
      analysisJSON['mediaImageResolution']={
        "height": imageBasics.width,
        "width": imageBasics.height
      };
      analysisJSON['mediaColorComponents']=imageBasics.components;

      //image quality assessment.
      //analysisJSON['mediaVisualFocus']=[
       // "blurry"
      //];

      //image quality assessment.
      const { entropy, sharpness } = await sharp(img).stats();
      analysisJSON['mediaVisualFocus'] = {"blurriness":sharpness,"entropy":entropy};

      var compressed = zlib.deflateSync(img).toString('base64');
      var uncompressed = zlib.inflateSync(new Buffer(compressed, 'base64')).toString();
      analysisJSON['mediaFileSize']=imageBasics.size;//may want to use: uncompressed
      console.log(Buffer.byteLength(compressed));
      console.log(Buffer.byteLength(uncompressed));
      analysisJSON['mediaCompressionSize']=Buffer.byteLength(compressed);
      analysisJSON['mediaCompressionRatio']=Buffer.byteLength(compressed)/Buffer.byteLength(uncompressed);

      //TIME OF DAY - use the image segmentation data. https://github.com/tensorflow/tfjs-models/tree/master/deeplab
     // analysisJSON['timeOfDay']={
      //  "tag": "morning",
     //   "salience": 0.88
     // };

          //load expression model, then use in cropped face.
      const timeofDayModel = await automl.loadImageClassification('http://localhost:8080/dayandnight/model.json');
      //face emotion test
      const timeofDayModelpredictions = await timeofDayModel.classify(imgToParse);
      console.log('day or night: ');
      console.log(timeofDayModelpredictions);
      analysisJSON['timeOfDay']=timeofDayModelpredictions;
 

      //had to force something in the deeplap tensorflow library... so watch out.
      analysisJSON['imageSegmentation']= await imageSegmentation(imgToParse);

      //estimated year of photo
      analysisJSON['mediaEstimatedCreationDate']= 2018;

  //then do machine learning stuff

  // Image/Scene Classifications
  // Load the model.

  //const mn = mobilenet;
  //mn.modelURL = `file://./models/mobilenet/model.json`
  //const model= await mn.load({"modelUrl":"http://localhost:8080/mobilenet/model.json"})
  //const model = await mobilenet.load('file://./models/mobilenet/model.json');

  //const model = await tf.loadGraphModel('file://./models/mobilenet/model.json',{size:224})

  //had to get these to be local mobilenet pick ups...  

  const model = await mobilenet.load();
  
  // Classify the image.
  const predictions = await model.classify(imgToParse);
  
  console.log('Image Scene Predictions: ');
  console.log(predictions);
  analysisJSON['scenes'] = predictions;


  //Object Detection

    // Load the model.
    const modelObjects = await cocoSsd.load();

    // Classify the image.
    const predictionsObjects = await modelObjects.detect(imgToParse);
  
    console.log('Image Object Predictions: ');
    console.log(predictionsObjects);
    analysisJSON['objects'] = predictionsObjects;

//GET PERSON AND IS ANIMAL COUNTS

const nsfwModel = await nsfw.load('file://./models/nsfw/',{size: 299}) // To load a local model, nsfw.load('file://./path/to/model/')
// Image must be in tf.tensor3d format
// you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)

//const imageNSFW =  tf.node.decodeImage(personCrop.toBuffer({"format":"jpeg"}),3);
//const imageNSFW = convert(img);
const nsfwPredictions =  nsfwModel.classify(imgToParse)
analysisJSON['nsfw']=nsfwPredictions;
//imageNSFW.dispose() // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
console.log(nsfwPredictions)

var objectClasses={};
var isAnimal={}
predictionsObjects.forEach(function(v) {
  objectClasses[v.class] = (objectClasses[v.class] || 0) + 1;


  //we may want to put some thresholding in here.  like above 90%...
  if(v.class =='cat' || v.class =='dog' || v.class =='horse'){
    isAnimal=v;
  }
  j=0;
  if(v.class=='person'){
        //build this up from Dominant Colors and percentages from overall image and the crop of pose, face...
       // analysisJSON['personsClothed']=0.8;

        //GOTTA DO THE CROP ROUTINE and EXTRACT BOUNDING BOX
        //bbox: [x, y, width, height]
        personCrop=imageBasics.crop({x:v.bbox[0],y:v.bbox[1],width:v.bbox[2],heigh:v.bbox[3]});
        personCrop.save('./imagesout/body-' + analysisJSON.originMediaID + "-" + j + '.png');

        
        var palette = ct.getPalette(personCrop.toBuffer({"format":"jpeg"}), 5);   
        analysisJSON['personsClothed']=palette;
        //use the NSFW for additional info      
       // analysisJSON['mediaDominantColors']=palette.map(x=>ce.rgb2hex(x));



        
  }
  j++;

  })
analysisJSON['isAnimal']=isAnimal;
analysisJSON['objectCountsbyClass']=objectClasses;
console.log(objectClasses);


  //POSES are useful for figuring out the COMPOSITION of the image AND whether someone is laying down.
  //posenet
  const net = await posenet.load();

  const predictionPose = await net.estimateSinglePose(imgToParse, {
    flipHorizontal: false
  });
  console.log('PosePredictions: ');
  console.log(predictionPose);
  analysisJSON['pose'] = predictionPose;

  //old facemood     
  //const URL = path.join(__dirname, '/models/tm-faceemotion/');
  const URL= "http://localhost:8080/tm-faceemotion/"
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  const weightsURL = URL + "weights.bin";

  //teachable Machines based Emotion Model
 // const emotionmodel = await tf.loadLayersModel(modelURL);
 // const emotionalTMpredictions = await emotionmodel.predict(imgToParse);


//emotionmodel = await tmImage.load(modelURL, metadataURL);
//const emotionalTMpredictions =await emotionmodel.predict(img);
//console.log("emotional from test faces:" + emotionalTMpredictions);

  //blazeface
    // Load the model.
    const bfmodel = await blazeface.load();

    // Pass in an image or video to the model. The model returns an array of
    // bounding boxes, probabilities, and landmarks, one for each detected face.
  
    const returnTensors = false; // Pass in `true` to get tensors back, rather than values.
    const blazeFacePredictions = await bfmodel.estimateFaces(imgToParse, returnTensors);

    console.log('blazeFace: ');
    console.log(blazeFacePredictions);

    //deal with summary metrics
    
    analysisJSON['allFaces'] = blazeFacePredictions;

      //count faces up
    analysisJSON['faceCount']=blazeFacePredictions.length;

    //count persons... gotta refactor this to find bodies that may not have faces recognized... use the object recognizer or poses
    analysisJSON['personsCount']=blazeFacePredictions.length;

    //get general emotions
    analysisJSON['emotionTags']=[
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
    ];
  //TODO is detect the faces individually in an image and evaluate each face.
  //AutoML Model for Facial Expression Classification

    //load expression model, then use in cropped face.
  const faceExpressionModel = await automl.loadImageClassification('http://localhost:8080/ferFace/model.json');
  //get the gender model too
  const genderModel = await tf.loadLayersModel('file://./models/gender/model.json');

  var primarySubjectFaceVisible={visibility: 0};
  if (blazeFacePredictions[0]){
    analysisJSON['primarySubjectFaceVisible']=blazeFacePredictions[0];
   

  }
  else{
    analysisJSON['primarySubjectFaceVisible']=primarySubjectFaceVisible;
  }

  var secondarySubjectFaceVisible={visibility: 0};
  if (blazeFacePredictions[1]){
    var secondarySubjectFaceVisible=blazeFacePredictions[1];
  }
  else {
    analysisJSON['secondarySubjectFaceVisible']=secondarySubjectFaceVisible;
  }



  if (blazeFacePredictions.length > 0) {
    /*
    `predictions` is an array of objects describing each detected face, for example:

    [
      {
        topLeft: [232.28, 145.26],
        bottomRight: [449.75, 308.36],
        probability: [0.998],
        landmarks: [
          [295.13, 177.64], // right eye
          [382.32, 175.56], // left eye
          [341.18, 205.03], // nose
          [345.12, 250.61], // mouth
          [252.76, 211.37], // right ear
          [431.20, 204.93] // left ear
        ]
      }
    ]
    */
   
    //NOTE that BlazeFace orders by highest probability face.  we may want a different logic for primary face.
    analysisJSON['facialExpressions']=[];
    for (let i = 0; i < blazeFacePredictions.length; i++) {
      const start = blazeFacePredictions[i].topLeft;
      const end = blazeFacePredictions[i].bottomRight;
      const size = [end[0] - start[0], end[1] - start[1]];

      // Render a rectangle over each detected face.
      //ctx.fillRect(start[0], start[1], size[0], size[1]);
         //useful for cropping for the detected faces
         //clean up crop size issues.
         if(imageBasics.width-end[0]<0)
          {
              end[0]=imageBasics.width
          }
          if(imageBasics.height-end[01]<0)
          {
              end[1]=imageBasics.height
          }
         //console.log();
      console.log(imageBasics.height-end[1]);
      var faceCrop = imageBasics.crop({
        x:start[0],
        y:start[1],
        width:end[0] - start[0],
        height:end[1] - start[1]
      });

      faceCrop.save('./imagesout/' + analysisJSON.originMediaID + "-" + i + '.png');

      //face emotion test
      const faceExpressionModelpredictions = await faceExpressionModel.classify(faceCrop);
      console.log('faceExpressionModel: ');
      console.log(faceExpressionModelpredictions);
      analysisJSON['facialExpressions'].push(faceExpressionModelpredictions);


      if (i==0){
            tensor = tf.cast(tf.node.decodeImage(faceCrop.resize({width:96,height:96}).toBuffer(),3), 'float32');
            tensor = tensor.div(255.0);
            tensor = tensor.expandDims(0);
            genderresult = genderModel.predict(tensor);

            //convert the thresholds to a label.
            const confidences = Array.from(genderresult.dataSync());
            const genderTypes = ['male', 'female'];
            analysisJSON['primarySubjectGender'] = {
              "tag": genderTypes[confidences.indexOf(Math.max(...confidences))],
              "salience": genderresult.arraySync()
            };
         }
      //console.log(genderModel.predict(faceCrop));

     

    }
  }

  //PHOTO FILTERS and MANIPULATIONS

  analysisJSON['photoManipulation']=  {   "salience": 0.7,
                                          "photoFilter": [
                                          "instagram",
                                          "snapchat",
                                          "photoshop",
                                          "unrecognized"
                                        ]
                                      }

// NOW PREP THE FINAL RESPONSE
//SEND 
  response.locals.analysisComplete = true;
  console.log(response.locals.analysisComplete);

  //memory manage a bit
  imgToParse.dispose();

  response.setHeader('Content-Type', 'application/json');
  response.json(analysisJSON);

  return true;


};


//analyzeMedia Post
app.post('/analyzeMedia',upload.single('media'),function (request, response,next) {

  //to handle included text use req.body
  // multer docs https://github.com/expressjs/multer
  //parse image and classify

    //console.log(req.file.buffer);
    //console.log(req.body);

  var parsedMediaOut =  mediaParse(request.file.buffer, request,response);
  console.log(parsedMediaOut);


  var dNow=Date.now();
  var yMod=13;
  var d = new Date();
  var n = d.getHours();
    


  //next();
  



});




//PARSE AND ANALYZE THE IMAGE
var textParse = async function (textInput, request, response) {

  //GET the text
  sentences = textInput;

  //set the output object up
  textJSON={};

  //RESPOND BACK WITH ORIGINAL MEDIA ID
  textJSON['originTextID']=request.body.originTextID;
  //textJSON['mediaID']=Date.now();

    //set a time out here for the response so we limit bad requests
    response.locals.analysisComplete = false;


    response.setTimeout(7000, function(){
      // call back function is called when request timed out.
        //memory manage a bit
    //imgToParse.dispose();
      response.locals.analysisComplete=true;
      response.send(408);
      });

    //BEGIN ANALYSIS

    //TOXICITY
    // The minimum prediction confidence.
        const threshold = 0.9;

        // Load the model. Users optionally pass in a threshold and an array of
        // labels to include.

        textJSON['nsfwLanguage']=[];
        toxMod = await toxicity.load(threshold);
        textJSON['nsfwLanguage']= await toxMod.classify(sentences).then(predictions => {
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
        readability = readabilityScores(sentences);
        textJSON['readability']=readability;

        //sentiment
        var sentiment = new Sentiment();
        var sentimentOut = sentiment.analyze(sentences);
        console.log(sentimentOut);    // Score: -2, Comparative: -0.666
        textJSON['sentimentScore']=sentimentOut;

// NOW PREP THE FINAL RESPONSE
//SEND 
response.locals.analysisComplete = true;
console.log(response.locals.analysisComplete);

//memory manage a bit
//textToParse.dispose();

response.setHeader('Content-Type', 'application/json');
response.json(textJSON);

return true;

}

//analyzeText Post
app.post('/analyzeText',upload.single('media'),function (request, response) {
  var dNow=Date.now();
  var yMod=13;
  var d = new Date();
  var n = d.getHours();


  var textParsed =  textParse(request.body.media, request,response);
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



});


//SET THE APP to LISTEN FOR REQUESTS
app.listen(port, () => console.log(`Maslo Companion Server at http://localhost:${port}`))