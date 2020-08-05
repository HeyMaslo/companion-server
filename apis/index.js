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
const localModelURL = "http://localhost:8080/"


//TENSORFLOW JS makes it easy to do cheap things with small things
// https://www.npmjs.com/package/@tensorflow/tfjs-node
// get almost any kind of model you want here: https://tfhub.dev/
// the harder work, of course, is in the choices of integration and synthesis.


// Tensorflow kernels and libraries
//const tfN = require('@tensorflow/tfjs');
const tf = require('@tensorflow/tfjs-node');
//const tfG = require('@tensorflow/tfjs-node-gpu');
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

// IMAGE SEGMENTATION this is how we can swap out for LOCAL models, not internet ones.  so download them and bring them in locally
const loadModelDeepLab = async () => {
  const modelName = 'pascal';   // set to your preferred model, either `pascal`, `cityscapes` or `ade20k`
  const quantizationBytes = 2;  // either 1, 2 or 4
  //const url = 'https://tfhub.dev/tensorflow/tfjs-model/deeplab/pascal/1/default/1/model.json?tfjs-format=file';
  //locally need to get the right model for each of these settings
  const url = localModelURL+'tensorflowlocal/deeplab/deeplab_pascal_1_default_1/model.json?tfjs-format=file'
  console.log(url)
  //return await deeplab.load({base: modelName, quantizationBytes});
  return await deeplab.load({modelUrl: url,base: modelName, quantizationBytes});
};

//load Deeplab - may wanna remove this
//loadModelDeepLab().then(() => console.log(`Loaded the DeepLab successfully!`));

const imageSegmentation = async (imageParse) => {
        console.log(imageParse);
        //console.log(loadModelDeepLab);
        //x = tf.tensor4d([1, 2, 3, 4],[1,1,1,1])
        //for now we are just passing back the segments and "colors", but we should pass back the map itself.
       return await loadModelDeepLab()
            .then((model) => model.segment(tf.cast(imageParse,"int32")))
             .then(
            ({legend}) =>
               // console.log(`The predicted classes are ${JSON.stringify(legend)}`);
                legend
                ).catch((error)=>{
                  console.log(error)}
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

//serve up models from this static path
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

//Each Parser gets it's own function
//TEMPLATE FOR PARSING FUNCTIONS
var generalParsingFunction = async function(img, parseCallback) {
  console.log(typeof(img));
  analysisJSON={};
  if (typeof(img)=="object") {

        parseCallback(null, analysisJSON);
        
  }
  else {
    analysisJSON['error']="no image information parsed.";
    parseCallback(new Error("image object not supplied to function."),analysisJSON);
  }
  return analysisJSON;
}

//general cb error handler
var cb = async function (error, retval) {
  if (error) {
    console.log(error);
    return;
  }
  console.log(retval);
  return retval;
}

//General Parser/Model Error Handler and Response parser
var parseCallback = async function (error, retval) {
  if (error) {
    console.log(error);
    return retval;
  }
  console.log(retval);
  return retval;
}

//Basic Image Data
var imageMetadata = async function(img, parseCallback) {
  console.log(typeof(img));
  analysisJSON={};
  if (typeof(img)=="object") {



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
        analysisJSON['mediaVisualFocus'] = {"sharpness":sharpness,"entropy":entropy};
  
        var compressed = zlib.deflateSync(img).toString('base64');
        var uncompressed = zlib.inflateSync(new Buffer(compressed, 'base64')).toString();
        analysisJSON['mediaFileSize']=imageBasics.size;//may want to use: uncompressed
        //console.log(Buffer.byteLength(compressed));
       // console.log(Buffer.byteLength(uncompressed));
        analysisJSON['mediaCompressionSize']=Buffer.byteLength(compressed);
        analysisJSON['mediaCompressionPercentage']=Buffer.byteLength(compressed)/Buffer.byteLength(uncompressed);

        parseCallback(null, analysisJSON);
  }
  else {
    analysisJSON['error']="no image information parsed.";
    parseCallback(new Error("image object not supplied to function."),analysisJSON);
  }
  return analysisJSON;
}

//IMAGE SCENE
var imageScene = async function(img, parseCallback) {
  //Expects TENSOR version of image...
  console.log(typeof(img));
  analysisJSON={};
  if (typeof(img)=="object") {
         //TIME OF DAY - use the image segmentation data. https://github.com/tensorflow/tfjs-models/tree/master/deeplab
     // analysisJSON['timeOfDay']={
      //  "tag": "morning",
     //   "salience": 0.88
     // };

          //load expression model, then use in cropped face.
          const timeofDayModel = await automl.loadImageClassification('http://localhost:8080/dayandnight/model.json');
          const timeofDayModelpredictions = await timeofDayModel.classify(img);
          //console.log('day or night: ');
         // console.log(timeofDayModelpredictions);
          analysisJSON['timeOfDay']=timeofDayModelpredictions;

          //estimated year of photo
          //DROP THIS MODEL IN
          analysisJSON['mediaEstimatedCreationDate']= 2018;
     
          //IMAGE SEGMENTATION is useful for Composition Assessments.
          //had to force something in the deeplap tensorflow library... so watch out.
          analysisJSON['composition']= await imageSegmentation(img);
    


          // Image/Scene Classifications
          // Load the model.

          //const mn = mobilenet;
          //mn.modelURL = `file://./models/mobilenet/model.json`
          //const model= await mn.load({"modelUrl":"http://localhost:8080/mobilenet/model.json"})
          //const model = await mobilenet.load('file://./models/mobilenet/model.json');

          //const model = await tf.loadGraphModel('file://./models/mobilenet/model.json',{size:224})




          //had to get these to be local mobilenet pick ups...  
          const model = await mobilenet.load(modelConfig = {
            version: 1,
            alpha: 1.0,
            modelUrl:localModelURL+'mobilenet/model.json?tfjs-format=file'
        });

          // Classify the image.
          const predictions = await model.classify(img);
          
         // console.log('Image Scene Predictions: ');
         // console.log(predictions);
          analysisJSON['scenes'] = predictions;

        parseCallback(null, analysisJSON);
  }
  else {
    analysisJSON['error']="no image scene parsed.";
    parseCallback(new Error("image object not supplied to function."),analysisJSON);
  }
  return analysisJSON;
}

//OBJECT DETECTION
var imageObjectDetection = async function(img, parseCallback) {
  console.log(typeof(img));
  analysisJSON={};
  if (typeof(img)=="object") {

    const imgToParse = tf.node.decodeImage(img,3);
    // const imgToParse4D = tf.node.decodeImage(img,3);

    //CONVERT IMAGE to image object for image-js... useful for many things
    let imageBasics = await Image.load(img);
      //Object Detection

    // Load the model. LOCALLY
    const modelObjects = await cocoSsd.load({base: "mobilenet_v2",modelUrl:localModelURL+'tensorflowlocal/ssd_mobilenet_v2_1_default_1/model.json?tfjs-format=file'});

    // Classify the image.
    const predictionsObjects = await modelObjects.detect(imgToParse);
  
    //console.log('Image Object Predictions: ');
    //console.log(predictionsObjects);
    analysisJSON['objects'] = predictionsObjects;

    //GET PERSON AND IS ANIMAL COUNTS



var objectClasses={};
var isAnimal={}
var ct = new ColorThief();
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
        //quick check that nothing will go out of bounds
        if(v.bbox[2]+v.bbox[0]>=imageBasics.width){
          v.bbox[2]=imageBasics.width-v.bbox[0];

        }
        if(v.bbox[1]+v.bbox[3]>=imageBasics.width){
          v.bbox[3]=imageBasics.height-v.bbox[1];

        }
        
        personCrop=imageBasics.crop({x:v.bbox[0],y:v.bbox[1],width:v.bbox[2],height:v.bbox[3]});
        //personCrop.save('./imagesout/body-' + Date.now() + "-" + j + '.png');

        
        var palette = ct.getPalette(personCrop.toBuffer({"format":"jpeg"}), 5);   
        analysisJSON['personsColorPalette']=palette;
        //use the NSFW for additional info      
       // analysisJSON['mediaDominantColors']=palette.map(x=>ce.rgb2hex(x));



        
  }
  j++;

  })
analysisJSON['isAnimal']=isAnimal;
analysisJSON['objectCountsbyClass']=objectClasses;
console.log(objectClasses);

        parseCallback(null, analysisJSON);
        
  }
  else {
    analysisJSON['error']="no image objects parsed.";
    parseCallback(new Error("image object not supplied to function."),analysisJSON);
  }
  return analysisJSON;
}

//NSFW
var imageNSFW = async function(imgToParse, parseCallback) {
  console.log(typeof(imgToParse));
  analysisJSON={};
  if (typeof(imgToParse)=="object") {
    
      const nsfwModel = await nsfw.load('file://./models/nsfw/',{size: 299}) // To load a local model, nsfw.load('file://./path/to/model/');
   
    // Image must be in tf.tensor3d format
    // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)
    
    //const imageNSFW =  tf.node.decodeImage(personCrop.toBuffer({"format":"jpeg"}),3);
    //const imageNSFW = convert(img);
    const nsfwPredictions = await nsfwModel.classify(imgToParse);
    analysisJSON['nsfw']=nsfwPredictions;
    //imageNSFW.dispose() // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
    console.log(nsfwPredictions)

        parseCallback(null, analysisJSON);
        
  }
  else {
    analysisJSON['error']="no NSFW content parsed.";
    parseCallback(new Error("image object not supplied to function."),analysisJSON);
  }
  return analysisJSON;
}

//POSES
var imagePosing = async function(imgToParse, parseCallback) {
  console.log(typeof(imgToParse));
  analysisJSON={};
  if (typeof(imgToParse)=="object") {
          //POSES are useful for figuring out the COMPOSITION of the image AND whether someone is laying down.
          //posenet
          //const net = await posenet.load();
           /* 
          let imgB = await Image.load(imgToParse);
          tensor = tf.cast(tf.node.decodeImage(imgB.resize({width:224,height:224}).toBuffer("jpg"),3), 'int32');
          tensor = tensor.div(255.0);
          tensor = tensor.expandDims(0);
          console.log(tensor);
         
          
          faster
          const net = await posenet.load({
  architecture: 'MobileNetV1',
  outputStride: 16,
  inputResolution: { width: 640, height: 480 },
  multiplier: 0.75
  modelUrl:localModelURL+'mobilenet/model.json'
});
          
          more accurate posenet... 
                      await posenet.load({
              architecture: 'ResNet50',
              outputStride: 32,
              inputResolution: { width: 257, height: 200 },
              quantBytes: 2
            });

            http://localhost:8080/mobilenet/
            tensorflowlocal/imagenet_mobilenet_v1_075_224_classification_1_default_1/model.json
            */
         
            //THIS IS VERY FRAGILE.  posenet moves rather quickly, it seems, so this may need to be refactored with more ironclad approaches.... the model is so specific.
          const net = await posenet.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            inputResolution: 257,
            multiplier: 0.75,
            //modelUrl: "https://storage.googleapis.com/tfjs-models/savedmodel/posenet/mobilenet/float/075/model-stride16.json"
            modelUrl:localModelURL+'tensorflowlocal/posenet/model-stride16.json'
          });
          

          

          // const net = await posenet.load({modelUrl:localModelURL+'mobilenet/model.json'});
          //const net = await posenet.load();

          const predictionPose = await net.estimateSinglePose(imgToParse, {
            flipHorizontal: false
          });
         // console.log('PosePredictions: ');
          //console.log(predictionPose);

          //compare nose vs foot for laying down etc.
            /*
          "pose": {
            "score": 0.7083604826646692,
            "keypoints": [
                {
                    "score": 0.9947373867034912,
                    "part": "nose",
                    "position": {
                        "x": 1202.435438104177,
                        "y": 143.82494369091228
                    }

                    leftAnkle
                  */

          //var index = predictionPose.keypoints.findIndex(obj => obj.part=="nose");
          var poseLabel="unknown";
          //console.log(index);

          //add checks for different body positions
          if((predictionPose.keypoints[predictionPose.keypoints.findIndex(obj => obj.part=="nose")].position.y>predictionPose.keypoints[predictionPose.keypoints.findIndex(obj => obj.part=="leftAnkle")].position.y)||(predictionPose.keypoints[predictionPose.keypoints.findIndex(obj => obj.part=="nose")].position.y>predictionPose.keypoints[predictionPose.keypoints.findIndex(obj => obj.part=="rightAnkle")].position.y)){
            poseLabel="layingdown"
          };



          console.log(poseLabel);
          analysisJSON['pose']=poseLabel;
          analysisJSON['poseLandmarks'] = predictionPose;

        parseCallback(null, analysisJSON);
        
  }
  else {
    analysisJSON['error']="no NSFW content parsed.";
    parseCallback(new Error("image object not supplied to function."),analysisJSON);
  }
  return analysisJSON;
}

//FACIAL DETECTION and EXPRESSIONS
var imageFaceDetection = async function(img, parseCallback) {
  console.log(typeof(img));
  analysisJSON={};
  if (typeof(img)=="object") {

    const imgToParse = tf.node.decodeImage(img,3);
    // const imgToParse4D = tf.node.decodeImage(img,3);

    //CONVERT IMAGE to image object for image-js... useful for many things
    let imageBasics = await Image.load(img);
 
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

          //console.log('blazeFace: ');
         // console.log(blazeFacePredictions);

          //deal with summary metrics
          
          analysisJSON['allFaces'] = blazeFacePredictions;

            //count faces up
          analysisJSON['faceCount']=blazeFacePredictions.length;

          //count persons... gotta refactor this to find bodies that may not have faces recognized... use the object recognizer or poses
          analysisJSON['personsCount']=blazeFacePredictions.length;

          //get general emotions
          // gotta change what we're doing here.
          //duplicative
         /* analysisJSON['emotionTags']=[
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
          */
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
            //console.log(imageBasics.height-end[1]);
            var faceCrop = imageBasics.crop({
              x:start[0],
              y:start[1],
              width:end[0] - start[0],
              height:end[1] - start[1]
            });

            //faceCrop.save('./imagesout/' + Date.now()+ "-" + i + '.png');

            //face emotion test
            const faceExpressionModelpredictions = await faceExpressionModel.classify(faceCrop);
            //console.log('faceExpressionModel: ');
            //console.log(faceExpressionModelpredictions);
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


        //FACE MESH FOR FINER GRAIN
        
          // Load the MediaPipe facemesh model.
          const facemeshmodel = await facemesh.load({maxFaces:3});
        
          // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
          // array of detected faces from the MediaPipe graph.
          const predictions = await facemeshmodel.estimateFaces(imgToParse);
        
          if (predictions.length > 0) {
            /*
            `predictions` is an array of objects describing each detected face, for example:
        
            [
              {
                faceInViewConfidence: 1, // The probability of a face being present.
                boundingBox: { // The bounding box surrounding the face.
                  topLeft: [232.28, 145.26],
                  bottomRight: [449.75, 308.36],
                },
                mesh: [ // The 3D coordinates of each facial landmark.
                  [92.07, 119.49, -17.54],
                  [91.97, 102.52, -30.54],
                  ...
                ],
                scaledMesh: [ // The 3D coordinates of each facial landmark, normalized.
                  [322.32, 297.58, -17.54],
                  [322.18, 263.95, -30.54]
                ],
                annotations: { // Semantic groupings of the `scaledMesh` coordinates.
                  silhouette: [
                    [326.19, 124.72, -3.82],
                    [351.06, 126.30, -3.00],
                    ...
                  ],
                  ...
                }
              }
            ]
            */


            analysisJSON["faceMesh"]={};
            for (let i = 0; i < predictions.length; i++) {
              //const keypoints = predictions[i].faceInViewConfidence;
              analysisJSON['faceMesh']={"faceinview":predictions[i].faceInViewConfidence,"boundingbox":predictions[i].boundingBox};
              // Log facial keypoints.
             // for (let i = 0; i < keypoints.length; i++) {
             //   const [x, y, z] = keypoints[i];
        //
               // console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
             // }
            }
          }


        parseCallback(null, analysisJSON);
        
  }
  else {
    analysisJSON['error']="no image faces parsed.";
    parseCallback(new Error("image object not supplied to function."),analysisJSON);
  }
  return analysisJSON;
}


//IMAGE SCENE
var imageManipulation = async function(img, parseCallback) {
  //Expects TENSOR version of image...
  console.log(typeof(img));
  analysisJSON={};
  if (typeof(img)=="object") {


          //load expression model, then use in cropped face.
          const photoManipulation = await automl.loadImageClassification('http://localhost:8080/socialPhotos/model.json');
          const photoManipulationpredictions = await photoManipulation.classify(img);
          //console.log('day or night: ');
         // console.log(timeofDayModelpredictions);
          analysisJSON['manipulations']=photoManipulationpredictions;

        parseCallback(null, analysisJSON);
  }
  else {
    analysisJSON['error']="no image scene parsed.";
    parseCallback(new Error("image object not supplied to function."),analysisJSON);
  }
  return analysisJSON;
}


//This function parses ALL OF IT
var mediaParse = async function(img, modelsToCall,request, response) {
  
  //set a time out here for the response so we limit bad requests
  response.locals.analysisComplete = false;

  response.setTimeout(10000, function(){
    // call back function is called when request timed out.
      //memory manage a bit
      imgToParse.dispose();
      response.locals.analysisComplete=true;
      response.header("Access-Control-Allow-Origin", "*");
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

//console.log(request.body);



//RESPOND BACK WITH ORIGINAL MEDIA ID
analysisJSON['originMediaID']=request.body.originMediaID;
analysisJSON['mediaID']=Date.now();


 
      // const imgToParse4D = tf.node.decodeImage(img,3);

        //CONVERT IMAGE to image object for image-js... useful for many things
        //SHRINK LARGE IMAGES

        //CONVERT ALL image manipulations to sharp... 
        let ImageBasics;
        let imgToParse;
        console.log(img.byteLength/1024);
        if(img.byteLength/1024 > 20000){
         let imgB = await Image.load(img);
         ImageBasics = imgB.resize({factor:.3});
          imgB = null;
          imgToParse = tf.node.decodeImage(ImageBasics.toBuffer("jpg"),3);
         console.log(ImageBasics.size);
        }
        else{
          imgToParse = tf.node.decodeImage(img,3);
          ImageBasics = await Image.load(img);
        }

             // CONVERT IMAGE BUFFER FOR TENSORFLOW

       



  /* *****************************************************************
  
  CALL THE MODELS.  Need to break these out.
  Im thinking just make a parameter that says ALL or which ones you want.
  TODO: gotta make model pre loaders on APP CREATION so this stuff goes much much faster

  ********************************************************************* */

  
 
console.log(typeof(modelsToCall));
console.log(modelsToCall);
if(modelsToCall=="" || modelsToCall==null){
  callModels={"imageMeta": 1,"imageSceneOut": 1,"imageObjects": 1,"imageTox": 1,"imagePose": 1,"faces": 1,"photoManipulation": 1}
}
else{
  callModels=JSON.parse(modelsToCall);
  console.log(callModels)
}

//console.log(callModels.imageMeta);
  

      //GET BASIC INFO ABOUT THE IMAGE
      if(callModels.imageMeta){
        const imageMeta = await imageMetadata(img,parseCallback);
        //console.log(imageMeta);
        analysisJSON['imageMeta']=imageMeta;
      }

      //IMAGE SCENES
      if(callModels.imageSceneOut){
        const imageSceneOut =  await imageScene(imgToParse,parseCallback);
        //console.log(imageSceneOut);
        analysisJSON['imageScene']=imageSceneOut;
      }

      //IMAGE OBJECTS
      if(callModels.imageObjects){
        const imageObjects=  await imageObjectDetection(img,parseCallback);
        //console.log(imageObjects);
        analysisJSON['imageObjects']=imageObjects;
      }

      //NSFW and Person Clothed assessment
      if(callModels.imageTox){
        const imageTox =  await imageNSFW(imgToParse,parseCallback);
        //console.log(imageTox);
        analysisJSON['personsClothed']=imageTox;
      }

      //poses
      if(callModels.imagePose){
        const imagePose =  await imagePosing(imgToParse,parseCallback);
        //console.log(imagePose);
        analysisJSON['poses']=imagePose;
      }
      //faces and recognition
      if(callModels.faces){
        const faces =  await imageFaceDetection(img,parseCallback);
        //console.log(faces);
        analysisJSON['faces']=faces;
      }

      //PHOTO FILTERS and MANIPULATIONS
      //NEED TO FINISH TRAINING ON THIS

      //was photo social media filtered?
      if(callModels.photoManipulation){
        const photoManipulation =  await imageManipulation(imgToParse,parseCallback);
        //console.log(photoManipulation);
        analysisJSON['photoManipulation']=photoManipulation;
      }

      /*
      analysisJSON['photoManipulation']=  {   "salience": 0.7,
                                              "photoFilter": [
                                              "instagram",
                                              "snapchat",
                                              "photoshop",
                                              "unrecognized"
                                            ]
                                          }
      */

      // NOW PREP THE FINAL RESPONSE
      //SEND 
        response.locals.analysisComplete = true;
        //console.log(response.locals.analysisComplete);

        //memory manage a bit
        imgToParse.dispose();
        response.header("Access-Control-Allow-Origin", "*");
        response.setHeader('Content-Type', 'application/json');
        response.json(analysisJSON);

        return true;


};


//analyzeMedia Post
app.post('/analyzeMedia',upload.single('media'),function (request, response,err) {

  //to handle included text use req.body
  // multer docs https://github.com/expressjs/multer
  //parse image and classify

    //console.log(req.file.buffer);
    //console.log(req.body);
    /*
          if (request.fileValidationError) {
            console.log("fileval")
            return res.send(req.fileValidationError);
        }
        else if (!request.file) {
            return response.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return response.send(err);
        }
        else if (err) {
            return response.send(err);
        }
    */

    //Validate the file
    //console.log(request.file.originalname);
    var modelsToCall={
      "imageMeta":1,
      "imageSceneOut":1,
      "imageObjects":1,
      "imageTox":1,
      "imagePose":1,
      "faces":1,
      "photoManipulation":1
    };

    if (request.file!=undefined){
      if(!request.file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        request.fileValidationError = 'Only image files are allowed!';
        response.send("gotta send image signal.")
        return cb(new Error('Only image files are allowed!'), false);
      }
      else{

        if(request.body.modelsToCall!=undefined && request.body.modelsToCall!="" && request.body.modelsToCall!=null){
            modelsToCall=request.body.modelsToCall;
            console.log(request.body)
        }
        else{
          modelsToCall=={"imageMeta": 1,"imageSceneOut": 1,"imageObjects": 1,"imageTox": 1,"imagePose": 1,"faces": 1,"photoManipulation": 1};
        }

        console.log(modelsToCall)
        var parsedMediaOut =  mediaParse(request.file.buffer,modelsToCall, request,response);
        //console.log(parsedMediaOut);
        cb(null, "parsing now!");
      }
      
    }
    else{
      response.send("nothing to do without any signal. which is fine.")
      return cb(new Error('no signal detected.'), false);
      
    }
 




  var dNow=Date.now();
  var yMod=13;
  var d = new Date();
  var n = d.getHours();
    


  //next();
  



});




//PARSE AND ANALYZE THE Text
//This isn't yet that interesting to require seperate functions.

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


    response.setTimeout(10000, function(){
      // call back function is called when request timed out.
        //memory manage a bit
    //imgToParse.dispose();
    response.header("Access-Control-Allow-Origin", "*");
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
response.header("Access-Control-Allow-Origin", "*");
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