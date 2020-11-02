/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */
// traditional image processing and other media helpers
const { Image } = require('image-js');
const ColorThief = require('color-thief');
const cocoSsd = require('@tensorflow-models/coco-ssd');

// Config
const port = process.env.PORT || 8080;
const localModelURL = `http://localhost:${port}/`;

// Tensorflow kernels and libraries
// const tfN = require('@tensorflow/tfjs');
// const tf = require('@tensorflow/tfjs-node');
// const tfG = require('@tensorflow/tfjs-node-gpu');
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');

// OBJECT DETECTION
module.exports = async function imageObjectDetection(img, parseCallback) {
  const analysisJSON = {};
  if (typeof (img) === 'object') {
    const imgToParse = require('@tensorflow/tfjs-node').node.decodeImage(img, 3);
    // const imgToParse4D = tf.node.decodeImage(img,3);

    // CONVERT IMAGE to image object for image-js... useful for many things
    let imageBasics = await Image.load(img);
    // Object Detection

    let predictionsObjects;
    try {
      const modelObjects = await cocoSsd.load({ base: 'mobilenet_v2', modelUrl: `${localModelURL}tensorflowlocal/ssd_mobilenet_v2_1_default_1/model.json?tfjs-format=file` });

      // Classify the image.
      predictionsObjects = await modelObjects.detect(imgToParse);
    } catch (error) {
      return parseCallback(new Error(error), null);
    }

    // console.log('Image Object Predictions: ');
    // console.log(predictionsObjects);
    analysisJSON.objects = predictionsObjects;

    // GET PERSON AND IS ANIMAL COUNTS

    const objectClasses = {};
    let isAnimal = {};
    const ct = new ColorThief();
    predictionsObjects.forEach((v) => {
      objectClasses[v.class] = (objectClasses[v.class] || 0) + 1;

      // we may want to put some thresholding in here.  like above 90%...
      if (v.class === 'cat' || v.class === 'dog' || v.class === 'horse') {
        isAnimal = v;
      }

      if (v.class === 'person') {
        // build this up from Dominant Colors and percentages from overall
        // image and the crop of pose, face...
        // analysisJSON['personsClothed']=0.8;

        // GOTTA DO THE CROP ROUTINE and EXTRACT BOUNDING BOX
        // bbox: [x, y, width, height]
        // quick check that nothing will go out of bounds
        // set any negatives to ZERO
        if (v.bbox[0] < 0) {
          v.bbox[0] = 0;
        }
        if (v.bbox[1] < 0) {
          v.bbox[1] = 0;
        }
        if (v.bbox[2] < 0) {
          v.bbox[2] = 0;
        }
        if (v.bbox[3] < 0) {
          v.bbox[3] = 0;
        }

        if (v.bbox[2] + v.bbox[0] >= imageBasics.width) {
          v.bbox[2] = imageBasics.width - v.bbox[0];
        }
        if (v.bbox[1] + v.bbox[3] >= imageBasics.width) {
          v.bbox[3] = imageBasics.height - v.bbox[1];
        }

        const personCrop = imageBasics.crop({
          x: v.bbox[0],
          y: v.bbox[1],
          width: v.bbox[2],
          height: v.bbox[3],
        });

        // personCrop.save('./imagesout/body-' + Date.now() + "-" + j + '.png');

        const palette = ct.getPalette(personCrop.toBuffer({ format: 'jpeg' }), 5);
        analysisJSON.personsColorPalette = palette;
        // use the NSFW for additional info
        // analysisJSON['mediaDominantColors']=palette.map(x=>ce.rgb2hex(x));
      }
    });
    analysisJSON.isAnimal = isAnimal;
    analysisJSON.objectCountsbyClass = objectClasses;
    // console.log(objectClasses);

    // memory management
    imgToParse.dispose();
    imageBasics = null;

    return parseCallback(null, { imageObjects: analysisJSON });
  }
  analysisJSON.error = 'no image objects parsed.';
  return parseCallback(new Error('image object not supplied to function.'), analysisJSON);

  // return analysisJSON;
};
