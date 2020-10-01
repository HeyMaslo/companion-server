// Basic libraries for nodejs, express application
// const fetch = require('node-fetch');
global.fetch = require('node-fetch');

// traditional image processing and other media helpers
const { Image } = require('image-js');

// Config
const port = 8080 || process.env.PORT;
const localModelURL = `http://localhost:${port}/`;

// TENSORFLOW JS makes it easy to do cheap things with small things
// https://www.npmjs.com/package/@tensorflow/tfjs-node
// get almost any kind of model you want here: https://tfhub.dev/
// the harder work, of course, is in the choices of integration and synthesis.

// Tensorflow kernels and libraries
// const tfN = require('@tensorflow/tfjs');
const tf = require('@tensorflow/tfjs-node');
// const tfG = require('@tensorflow/tfjs-node-gpu');
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const automl = require('@tensorflow/tfjs-automl');

// non-Tensorflow ML libraries
// const onnxjs = require('onnxjs');
// require("onnxjs-node");
//

// Tensflow trained models.
// NOTE THAT SOME OF THESE ACCESS THE INTERNET BY DEFAULT.  Change that.
const mobilenet = require('@tensorflow-models/mobilenet');

// we need to get all the models loaded up on BOOT, not run time.
// the models dont change request to request.
//  (though there is a case to be made to not boot a giant set of things into memory)
const deeplab = require('@tensorflow-models/deeplab');

const loadModelDeepLab = async () => {
  const modelName = 'pascal'; // set to your preferred model, either `pascal`, `cityscapes` or `ade20k`
  const quantizationBytes = 2; // either 1, 2 or 4
  // const url = 'https://tfhub.dev/tensorflow/tfjs-model/deeplab/pascal/1/default/1/model.json?tfjs-format=file';
  // locally need to get the right model for each of these settings
  const url = `${localModelURL}tensorflowlocal/deeplab/deeplab_pascal_1_default_1/model.json?tfjs-format=file`;
  // return await deeplab.load({base: modelName, quantizationBytes});
  const deeplabModel = await deeplab.load({ modelUrl: url, base: modelName, quantizationBytes });
  return deeplabModel;
};
// load Deeplab - may wanna remove this
// loadModelDeepLab().then(() => console.log(`Loaded the DeepLab successfully!`));
const imageSegmentation = async (imageParse) => {
// console.log(loadModelDeepLab);
// x = tf.tensor4d([1, 2, 3, 4],[1,1,1,1])
// for now we are just passing back the segments and "colors",
// but we should pass back the map itself.
  const legendResult = await loadModelDeepLab()
    .then((model) => model.segment(tf.cast(imageParse, 'int32')))
    .then(
      ({ legend }) => legend,
    ).catch((error) => {
      console.log(error);
    });
  return legendResult;
};
// IMAGE SEGMENTATION this is how we can swap out for LOCAL models, not internet ones.
// so download them and bring them in locally
/*
    if we want to return the segmentation map
    return await loadModelDeepLab()
      .then((model) => model.segment(imageParse))
        .then(
      (segmentationMap) =>
        // console.log(`The predicted classes are ${JSON.stringify(legend)}`);
        segmentationMap
      );
  */
// return await loadModelDeepLab.model.segment(imageParse);

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement, additionally an implementation
// of ImageData is required, in case you want to use the MTCNN

// FACE API is a useful face algo, but it doesn't play nice with TF 2.0
// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
const canvas = require('canvas');
const faceapi = require('face-api.js');

const { Canvas, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
faceapi.env.monkeyPatch({ fetch });
// tmImage.env.monkeyPatch({ Canvas });

// IMAGE SCENE
module.exports = async function imageScene(img, parseCallback) {
  console.log('imageScene');
  // console.log(process.memoryUsage());
  // Expects TENSOR version of image...
  // console.log(typeof (img));
  const analysisJSON = {};
  if (typeof (img) === 'object') {
    // TIME OF DAY - use the image segmentation data. https://github.com/tensorflow/tfjs-models/tree/master/deeplab
    // analysisJSON['timeOfDay']={
    //  "tag": "morning",
    //   "salience": 0.88
    // };

    // load expression model, then use in cropped face.
    const timeofDayModel = await automl.loadImageClassification('http://localhost:8080/dayandnight/model.json');
    const timeofDayModelpredictions = await timeofDayModel.classify(img);
    // console.log('day or night: ');
    // console.log(timeofDayModelpredictions);
    analysisJSON.timeOfDay = timeofDayModelpredictions;

    // estimated year of photo
    // DROP THIS MODEL IN
    analysisJSON.mediaEstimatedCreationDate = 2018;

    // IMAGE SEGMENTATION is useful for Composition Assessments.
    // had to force something in the deeplap tensorflow library... so watch out.
    analysisJSON.composition = await imageSegmentation(img, parseCallback);

    // Image/Scene Classifications
    // Load the model.

    // const mn = mobilenet;
    // mn.modelURL = `file://./models/mobilenet/model.json`
    // const model= await mn.load({"modelUrl":"http://localhost:8080/mobilenet/model.json"})
    // const model = await mobilenet.load('file://./models/mobilenet/model.json');

    // const model = await tf.loadGraphModel('file://./models/mobilenet/model.json',{size:224})

    // had to get these to be local mobilenet pick ups...
    const model = await mobilenet.load({
      version: 1,
      alpha: 1.0,
      modelUrl: `${localModelURL}mobilenet/model.json?tfjs-format=file`,
    });

    // Classify the image.
    const predictions = await model.classify(img);

    // console.log('Image Scene Predictions: ');
    // console.log(predictions);
    analysisJSON.scenes = predictions;

    return parseCallback(null, { imageScene: analysisJSON });
  }

  analysisJSON.error = 'no image scene parsed.';
  return parseCallback(new Error('image object not supplied to function.'), analysisJSON);

  // return analysisJSON;
};
