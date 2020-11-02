// Basic libraries for nodejs, express application
global.fetch = require('node-fetch');

// Config
const port = process.env.PORT || 8080;
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

// IMAGE SCENE
module.exports = async function imageManipulation(img, parseCallback) {
  console.log('imageFiltersManipulation');
  const analysisJSON = {};
  if (typeof (img) === 'object') {
    // load expression model, then use in cropped face.
    let photoManipulationpredictions;
    try {
      const photoManipulation = await automl.loadImageClassification(`${localModelURL}/socialPhotos/model.json`);
      photoManipulationpredictions = await photoManipulation.classify(img);
      tf.dispose(photoManipulation);
    } catch (error) {
      return parseCallback(new Error(error), null);
    }

    analysisJSON.manipulations = photoManipulationpredictions;

    return parseCallback(null, { photoManipulation: analysisJSON });
  }
  analysisJSON.error = 'no image scene parsed.';
  return parseCallback(new Error('image object not supplied to function.'), analysisJSON);
};
