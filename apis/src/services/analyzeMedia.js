"use strict";

//traditional image processing and other media helpers
const { Image } = require('image-js');

//TENSORFLOW JS makes it easy to do cheap things with small things
// https://www.npmjs.com/package/@tensorflow/tfjs-node
// get almost any kind of model you want here: https://tfhub.dev/
// the harder work, of course, is in the choices of integration and synthesis.

// Tensorflow kernels and libraries
const tf = require('@tensorflow/tfjs-node');
require('@tensorflow/tfjs-node');
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');


// const jpeg = require('jpeg-js');
// const convert = async (img) => {
//   // Decoded image in UInt8 Byte array
//   const image = await jpeg.decode(img, true)

//   const numChannels = 3
//   const numPixels = image.width * image.height
//   const values = new Int32Array(numPixels * numChannels)

//   for (let i = 0; i < numPixels; i++)
//     for (let c = 0; c < numChannels; ++c)
//       values[i * numChannels + c] = image.data[i * 4 + c]

//   return tf.tensor3d(values, [image.height, image.width, numChannels], 'int32')
// }


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
  // console.log(retval);
  return retval;
}

// Basic Image Data
var imageMetadata = require('./libs/imageMetadata');
// IMAGE SCENE
var imageScene = require('./libs/imageScene');
// OBJECT DETECTION
var imageObjectDetection = require('./libs/imageObjectDetection');
// NSFW
var imageNSFW = require('./libs/imageNSFW');
// POSES
var imagePosing = require('./libs/imagePosing');
// FACIAL DETECTION and EXPRESSIONS
var imageFaceDetection = require('./libs/imageFaceDetection');
// IMAGE SCENE
var imageManipulation = require('./libs/imageManipulation');



//This function parses ALL OF IT
var mediaParse = async function (originMediaID, img, modelsToCall) {

  let analysisComplete = false;
  let analysisJSON = {};
  let ImageBasics;
  let imgToParse;

  //RESPOND BACK WITH ORIGINAL MEDIA ID
  analysisJSON['originMediaID'] = originMediaID;
  analysisJSON['mediaID'] = Date.now();

  //CONVERT IMAGE to image object for image-js... useful for many things
  //SHRINK LARGE IMAGES
  //CONVERT ALL image manipulations to sharp... 

  console.log("Image bytes / 1024: ", img.byteLength / 1024);
  try {
    if (img.byteLength / 1024 > 20000) {
      let imgB = await Image.load(img);
      ImageBasics = imgB.resize({ factor: .3 });
      imgB = null;
      console.log(':: BEFORRE DECODE IMAGE:: ',process.memoryUsage());
      imgToParse = tf.node.decodeImage(ImageBasics.toBuffer("jpg"), 3);
      console.log(':: AFTER DECODE IMAGE:: ',process.memoryUsage());
      console.log("Image Size: ", ImageBasics.size);
    }
    else {
      await tf.setBackend('tensorflow');
      console.log(':: BEFORRE DECODE IMAGE:: ',process.memoryUsage());
      imgToParse = tf.node.decodeImage(img, 3);
      console.log(':: AFTER DECODE IMAGE:: ',process.memoryUsage());
      ImageBasics = await Image.load(img);
    }
  } catch (error) {
    return {
      error: true,
      message: error,
      statusCode: 500,
      data: null
    }
  }

  /*
    *****************************************************************  
    CALL THE MODELS.  Need to break these out.
    Im thinking just make a parameter that says ALL or which ones you want.
    TODO: gotta make model pre loaders on APP CREATION so this stuff goes much much faster
    *********************************************************************
  */
  // console.log(typeof (modelsToCall));
  // console.log("Models to call: ", modelsToCall);

  let callModels = JSON.parse(modelsToCall);
  
  let promises = []

  //GET BASIC INFO ABOUT THE IMAGE
  if (callModels.imageMeta) {
    // promises.push(imageMetadata(img, parseCallback));
    // var imageMeta = await imageMetadata(img, parseCallback);
    //console.log(imageMeta);
    // analysisJSON['imageMeta'] = imageMeta;
    // imageMeta = null;
  }

  //IMAGE SCENES
  if (callModels.imageSceneOut) {
    // promises.push(imageScene(imgToParse, parseCallback));
    // var imageSceneOut = await imageScene(imgToParse, parseCallback);
    // //console.log(imageSceneOut);
    // analysisJSON['imageScene'] = imageSceneOut;
    // imageSceneOut = null;
  }

  //IMAGE OBJECTS
  if (callModels.imageObjects) {
    // promises.push(imageObjectDetection(img, parseCallback));
    // var imageObjects = await imageObjectDetection(img, parseCallback);
    // //console.log(imageObjects);
    // analysisJSON['imageObjects'] = imageObjects;
    // imageObjects = null;
  }

  //NSFW and Person Clothed assessment
  if (callModels.imageTox) {
    // promises.push(imageNSFW(imgToParse, parseCallback));
    // var imageTox = await imageNSFW(imgToParse, parseCallback);
    // //console.log(imageTox);
    // analysisJSON['personsClothed'] = imageTox;
    // imageTox = null;
  }

  //poses
  if (callModels.imagePose) {
    // promises.push(imagePosing(imgToParse, parseCallback));
    // var imagePose = await imagePosing(imgToParse, parseCallback);
    // //console.log(imagePose);
    // analysisJSON['poses'] = imagePose;
    // imagePose = null;
  }

  //faces and recognition
  if (callModels.faces) {    
    // promises.push(imageFaceDetection(img, parseCallback));
    // try {      
    //   var faces = await imageFaceDetection(img, parseCallback);
    // } catch (error) {
    //   console.error(error);
    // }
    // //console.log(faces);
    // analysisJSON['faces'] = faces;
    // faces = null;
  }

  //PHOTO FILTERS and MANIPULATIONS
  //NEED TO FINISH TRAINING ON THIS

  //was photo social media filtered?
  if (callModels.photoManipulation) {
    // promises.push(imageManipulation(imgToParse, parseCallback));
    // var photoManipulation = await imageManipulation(imgToParse, parseCallback);
    // //console.log(photoManipulation);
    // analysisJSON['photoManipulation'] = photoManipulation;
    // photoManipulation = null;
  }
  
  let result;

  result = await Promise.all(promises).then((results) => {
    // console.log(results.flat());
    // NOW PREP THE FINAL RESPONSE
    //SEND 
    analysisComplete = true;
    //memory manage a bit
    //imgToParse.dispose();
    imgToParse = null;
    ImageBasics = null;
    return results.reduce((acc,val) => { return Object.assign(acc, val); }, analysisJSON);
  }).catch((error) => {
    parseCallback(new Error(error), null);
  });

  return {
    error: false,
    message: '',
    statusCode: 200,
    data: result
  }
};


/**
 * 
 * Used by POST  /analyzeMedia
 * 
 */
module.exports = async function analyzeMedia(request, response, next) {

  //memory review
  // console.log("Memory Usage: ", process.memoryUsage());

  var modelsToCall = {
    "imageMeta": 1,
    "imageSceneOut": 1,
    "imageObjects": 1,
    "imageTox": 1,
    "imagePose": 1,
    "faces": 1,
    "photoManipulation": 1
  };

  if (request.file != undefined) {
    if (!request.file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      request.fileValidationError = 'Only image files are allowed!';
      response.send("gotta send image signal.")
      return cb(new Error('Only image files are allowed!'), false);
    }
    else {
      if (request.body.modelsToCall != undefined && request.body.modelsToCall != "" && request.body.modelsToCall != null) {
        modelsToCall = request.body.modelsToCall;
      }
      var timeOut = request.body.timeOut;
      var tO = 100000;
      if (timeOut != null && timeOut != "") {
        tO = parseInt(timeOut, 10);
      }
      else {
        tO = 100000;
      }

      let isTimeOut = false;
      // TODO: Improve timeout logic as it continues executing any async work already schedule in the loop
      response.setTimeout(tO, () => {
        response.sendStatus(408);
        response.end();
        isTimeOut = true;
        return;
      })

      response.header("Access-Control-Allow-Origin", "*");

      // console.log("Models to Call: ", modelsToCall)
      try {
        var originMediaID = request.body.originMediaID;
        var fileBuffer = request.file.buffer;
        var parsedMediaOut = await mediaParse(originMediaID, fileBuffer, modelsToCall);
        fileBuffer = null;  
        request.file.buffer = null;
        if (parsedMediaOut.error) {
          response.sendStatus(parsedMediaOut.statusCode);
          cb(new Error(parsedMediaOut.message), null);
        }
      } catch (error) {
        response.sendStatus(500);
        console.error(error);
      }
      if (!isTimeOut) {
        response.setHeader('Content-Type', 'application/json');
        response.status(parsedMediaOut.statusCode);
        response.send(parsedMediaOut.data);
        response.removeAllListeners();
      } else {
        cb(new Error('The request timed out'), null);
      }
      // return cb(null, "parsing now!");
    }
  }
  else {
    response.send("nothing to do without any signal. which is fine.")
    return cb(new Error('no signal detected.'), false);
  }
}