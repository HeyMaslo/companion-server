/* eslint-disable no-console */
// traditional image processing and other media helpers
const { Image } = require('image-js');

// TENSORFLOW JS makes it easy to do cheap things with small things
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
//     values[i * numChannels + c] = image.data[i * 4 + c]

//   return tf.tensor3d(values, [image.height, image.width, numChannels], 'int32')
// }

// general cb error handler
const cb = async function cb(error, retval) {
  if (error) {
    console.log(error);
  }
  console.log(retval);
  return retval;
};

// General Parser/Model Error Handler and Response parser
const parseCallback = async function parseCallback(error, retval) {
  if (error) {
    console.log(error);
  }
  return retval;
};

// Basic Image Data
const imageMetadata = require('./libs/imageMetadata');
// IMAGE SCENE
const imageScene = require('./libs/imageScene');
// OBJECT DETECTION
const imageObjectDetection = require('./libs/imageObjectDetection');
// NSFW
const imageNSFW = require('./libs/imageNSFW');
// POSES
const imagePosing = require('./libs/imagePosing');
// FACIAL DETECTION and EXPRESSIONS
const imageFaceDetection = require('./libs/imageFaceDetection');
// IMAGE SCENE
const imageManipulation = require('./libs/imageManipulation');

// This function parses ALL OF IT
const mediaParse = async function mediaParse(originMediaID, img, modelsToCall) {
  const analysisJSON = {};
  let ImageBasics;
  let imgToParse;

  // RESPOND BACK WITH ORIGINAL MEDIA ID
  analysisJSON.originMediaID = originMediaID;
  analysisJSON.mediaID = Date.now();

  // CONVERT IMAGE to image object for image-js... useful for many things
  // SHRINK LARGE IMAGES
  // CONVERT ALL image manipulations to sharp...

  console.log('Image bytes / 1024: ', img.byteLength / 1024);
  try {
    if (img.byteLength / 1024 > 20000) {
      let imgB = await Image.load(img);
      ImageBasics = imgB.resize({ factor: 0.3 });
      imgB = null;
      console.log(':: BEFORRE DECODE IMAGE:: ', process.memoryUsage());
      imgToParse = tf.node.decodeImage(ImageBasics.toBuffer('jpg'), 3);
      console.log(':: AFTER DECODE IMAGE:: ', process.memoryUsage());
      console.log('Image Size: ', ImageBasics.size);
    } else {
      await tf.setBackend('tensorflow');
      console.log(':: BEFORRE DECODE IMAGE:: ', process.memoryUsage());
      imgToParse = tf.node.decodeImage(img, 3);
      console.log(':: AFTER DECODE IMAGE:: ', process.memoryUsage());
      ImageBasics = await Image.load(img);
    }
  } catch (error) {
    return {
      error: true,
      message: error,
      statusCode: 500,
      data: null,
    };
  }

  /*
    *****************************************************************
    CALL THE MODELS.  Need to break these out.
    Im thinking just make a parameter that says ALL or which ones you want.
    TODO: gotta make model pre loaders on APP CREATION so this stuff goes much much faster
    *********************************************************************
  */

  const callModels = JSON.parse(modelsToCall);
  const promises = [];

  // GET BASIC INFO ABOUT THE IMAGE
  if (callModels.imageMeta) {
    promises.push(imageMetadata(img, parseCallback));
  }

  // IMAGE SCENES
  if (callModels.imageSceneOut) {
    promises.push(imageScene(imgToParse, parseCallback));
  }

  // IMAGE OBJECTS
  if (callModels.imageObjects) {
    promises.push(imageObjectDetection(img, parseCallback));
  }

  // NSFW and Person Clothed assessment
  if (callModels.imageTox) {
    promises.push(imageNSFW(imgToParse, parseCallback));
  }

  // poses
  if (callModels.imagePose) {
    promises.push(imagePosing(imgToParse, parseCallback));
  }

  // faces and recognition
  if (callModels.faces) {
    promises.push(imageFaceDetection(img, parseCallback));
  }

  // PHOTO FILTERS and MANIPULATIONS
  // NEED TO FINISH TRAINING ON THIS
  // was photo social media filtered?
  if (callModels.photoManipulation) {
    promises.push(imageManipulation(imgToParse, parseCallback));
  }

  tf.engine().startScope();
  const result = await Promise.all(promises).then((results) => {
    tf.dispose(imgToParse);
    tf.disposeVariables();
    tf.dispose(img);
    imgToParse = null;
    ImageBasics = null;
    return results.reduce((acc, val) => Object.assign(acc, val), analysisJSON);
  }).catch((error) => {
    parseCallback(new Error(error), null);
  });
  tf.engine().endScope();

  return {
    error: false,
    message: '',
    statusCode: 200,
    data: result,
  };
};

/**
 *
 * Used by POST  /analyzeMedia
 *
 */
module.exports = async function analyzeMedia(request, response) {
  let modelsToCall = {
    imageMeta: 1,
    imageSceneOut: 1,
    imageObjects: 1,
    imageTox: 1,
    imagePose: 1,
    faces: 1,
    photoManipulation: 1,
  };

  if (request.file === undefined) {
    response.send('nothing to do without any signal. which is fine.');
    return cb(new Error('no signal detected.'), false);
  }

  if (!request.file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
    request.fileValidationError = 'Only image files are allowed!';
    response.send('gotta send image signal.');
    return cb(new Error('Only image files are allowed!'), false);
  }
  if (request.body.modelsToCall !== undefined && request.body.modelsToCall !== '' && request.body.modelsToCall != null) {
    modelsToCall = request.body.modelsToCall;
  }
  const { timeOut } = request.body;
  let tO = 100000;
  if (timeOut != null && timeOut !== '') {
    tO = parseInt(timeOut, 10);
  } else {
    tO = 100000;
  }

  let isTimeOut = false;
  // TODO: Improve timeout logic
  // as it continues executing any async work already schedule in the loop
  response.setTimeout(tO, () => {
    response.sendStatus(408);
    response.end();
    isTimeOut = true;
  });

  response.header('Access-Control-Allow-Origin', '*');

  let parsedMediaOut;
  try {
    const { originMediaID } = request.body;
    let fileBuffer = request.file.buffer;
    parsedMediaOut = await mediaParse(originMediaID, fileBuffer, modelsToCall);
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
    response.end();
    return cb(null, 'Completed');
  }
  return cb(new Error('The request timed out'), null);
};
