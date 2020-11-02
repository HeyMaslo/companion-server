// Basic libraries for nodejs, express application
// eslint-disable-next-line import/no-extraneous-dependencies
global.fetch = require('node-fetch');

// traditional image processing and other media helpers
const { Image } = require('image-js');

// Tensorflow kernels and libraries
// const tfN = require('@tensorflow/tfjs');
const tf = require('@tensorflow/tfjs-node');
// const tfG = require('@tensorflow/tfjs-node-gpu');
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const automl = require('@tensorflow/tfjs-automl');

// Tensflow trained models.
// NOTE THAT SOME OF THESE ACCESS THE INTERNET BY DEFAULT.  Change that.
const blazeface = require('@tensorflow-models/blazeface');
const facemesh = require('@tensorflow-models/facemesh');

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

const port = process.env.PORT || 8080;

// Final Express Application constants/variables
// this is where we get the POST form parser set up

// FACIAL DETECTION and EXPRESSIONS
module.exports = async function imageFaceDetection(img, parseCallback) {
  console.info('Starting Facial Detection', 'imageFaces');
  const analysisJSON = {};
  if (typeof (img) === 'object') {
    const imgToParse = tf.node.decodeImage(img, 3);
    // const imgToParse4D = tf.node.decodeImage(img,3);

    // CONVERT IMAGE to image object for image-js... useful for many things
    const imageBasics = await Image.load(img);

    // old facemood
    // const URL = path.join(__dirname, '/models/tm-faceemotion/');
    // teachable Machines based Emotion Model
    // const emotionmodel = await tf.loadLayersModel(modelURL);
    // const emotionalTMpredictions = await emotionmodel.predict(imgToParse);

    // emotionmodel = await tmImage.load(modelURL, metadataURL);
    // const emotionalTMpredictions =await emotionmodel.predict(img);
    // console.log("emotional from test faces:" + emotionalTMpredictions);

    // blazeface
    // Load the model.
    let blazeFacePredictions;
    try {
      let bfmodel = await blazeface.load();

      // Pass in an image or video to the model. The model returns an array of
      // bounding boxes, probabilities, and landmarks, one for each detected face.
      const returnTensors = false; // Pass in `true` to get tensors back, rather than values.
      blazeFacePredictions = await bfmodel.estimateFaces(imgToParse, returnTensors);
      tf.dispose(bfmodel);
      bfmodel = null;
    } catch (error) {
      return parseCallback(new Error(error), null);
    }

    // deal with summary metrics
    analysisJSON.allFaces = blazeFacePredictions;

    // count faces up
    analysisJSON.faceCount = blazeFacePredictions.length;

    // count persons... gotta refactor this to find bodies that may not have faces recognized...
    // use the object recognizer or poses
    analysisJSON.personsCount = blazeFacePredictions.length;

    // get general emotions
    // gotta change what we're doing here.
    // duplicative
    /*
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
    */

    // TODO is detect the faces individually in an image and evaluate each face.
    // AutoML Model for Facial Expression Classification

    let primarySubjectFaceVisible = { visibility: 0 };
    if (blazeFacePredictions[0]) {
      [primarySubjectFaceVisible] = blazeFacePredictions;
    }
    analysisJSON.primarySubjectFaceVisible = primarySubjectFaceVisible;

    let secondarySubjectFaceVisible = { visibility: 0 };
    if (blazeFacePredictions[1]) {
      [, secondarySubjectFaceVisible] = blazeFacePredictions;
    }
    analysisJSON.secondarySubjectFaceVisible = secondarySubjectFaceVisible;

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

      // NOTE that BlazeFace orders by highest probability face.
      // we may want a different logic for primary face.
      analysisJSON.facialExpressions = [];
      const facialExpressions = [];
      const faceExpressionModel = await automl.loadImageClassification(`http://localhost:${port}/ferFace/model.json`);
      let genderModel = await tf.loadLayersModel('file://./models/gender/model.json');
      for (let i = 0; i < blazeFacePredictions.length; i += 1) {
        const start = blazeFacePredictions[i].topLeft;
        const end = blazeFacePredictions[i].bottomRight;

        // Render a rectangle over each detected face.
        // ctx.fillRect(start[0], start[1], size[0], size[1]);
        // useful for cropping for the detected faces
        // clean up crop size issues.
        if (imageBasics.width - end[0] < 0) {
          end[0] = imageBasics.width;
        }
        if (imageBasics.height - end[0] < 0) {
          end[1] = imageBasics.height;
        }

        const faceCrop = imageBasics.crop({
          x: start[0],
          y: start[1],
          width: end[0] - start[0],
          height: end[1] - start[1],
        });

        // faceCrop.save('./imagesout/' + Date.now()+ "-" + i + '.png');

        // console.log('faceCrop: ', faceCrop);

        // face emotion test
        console.debug('Start of Face Emotion Test');

        // load expression model, then use in cropped face.
        try {
          facialExpressions.push(faceExpressionModel.classify(faceCrop)
            .then((res) => Promise.resolve(res))
            .catch((err) => {
              console.log('faceExpressionModel classify error', err);
            }));
          // faceExpressionModelpredictions = await faceExpressionModel.classify(faceCrop)
          //   .then((res) => Promise.resolve(res))
          //   .catch((err) => {
          //     console.log('faceExpressionModel classify error', err);
          //   });
        } catch (error) {
          return parseCallback(new Error(error), null);
        }
        console.debug('End of Face Emotion Test');

        if (i === 0) {
          let tensor = tf.cast(tf.node.decodeImage(faceCrop.resize({ width: 96, height: 96 }).toBuffer(), 3), 'float32');
          tensor = tensor.div(255.0);
          tensor = tensor.expandDims(0);
          let genderresult;
          try {
            genderresult = genderModel.predict(tensor);
          } catch (error) {
            return parseCallback(new Error(error), null);
          }

          // convert the thresholds to a label.
          const confidences = Array.from(genderresult.dataSync());
          const genderTypes = ['male', 'female'];
          analysisJSON.primarySubjectGender = {
            tag: genderTypes[confidences.indexOf(Math.max(...confidences))],
            salience: genderresult.arraySync(),
          };
        }
      }
      analysisJSON.facialExpressions = await Promise.all(facialExpressions);
      tf.dispose(genderModel);
      genderModel = null;
    }

    // FACE MESH FOR FINER GRAIN
    try {
      // Load the MediaPipe facemesh model.
      let facemeshmodel = await facemesh.load({ maxFaces: 3 });
      // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
      // array of detected faces from the MediaPipe graph.
      await tf.setBackend('cpu');
      const predictions = await facemeshmodel.estimateFaces(imgToParse);
      facemeshmodel = null;

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

        analysisJSON.faceMesh = {};
        for (let i = 0; i < predictions.length; i += 1) {
          // const keypoints = predictions[i].faceInViewConfidence;
          analysisJSON.faceMesh = {
            faceinview: predictions[i].faceInViewConfidence,
            boundingbox: predictions[i].boundingBox,
          };
          // Log facial keypoints.
          // for (let i = 0; i < keypoints.length; i++) {
          //   const [x, y, z] = keypoints[i];
          //
          // console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
          // }
        }
      }
    } catch (error) {
      console.log(error);
    }

    tf.dispose(imgToParse);
    return parseCallback(null, { faces: analysisJSON });
  }

  analysisJSON.error = 'no image faces parsed.';
  return parseCallback(new Error('image object not supplied to function.'), analysisJSON);
};
