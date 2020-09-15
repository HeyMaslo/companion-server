"use strict";

// Tensorflow kernels and libraries
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');

// Tensflow trained models.
const nsfw = require('nsfwjs');


//NSFW
module.exports = async function imageNSFW (imgToParse, parseCallback) {
  console.log("imageNSFW");
  // console.log(process.memoryUsage());

  // console.log(typeof (imgToParse));
  var analysisJSON = {};
  if (typeof (imgToParse) == "object") {
    let nsfwPredictions;
    try {
      const nsfwModel = await nsfw.load('file://models/nsfw/', { size: 299 }) // To load a local model, nsfw.load('file://./path/to/model/');
      nsfwPredictions = await nsfwModel.classify(imgToParse);
    } catch (error) { 
      return parseCallback(new Error(error), null);
    } 

    // Image must be in tf.tensor3d format
    // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)

    //const imageNSFW =  tf.node.decodeImage(personCrop.toBuffer({"format":"jpeg"}),3);
    //const imageNSFW = convert(img);

    analysisJSON['nsfw'] = nsfwPredictions;
    //imageNSFW.dispose() // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
    // console.log(nsfwPredictions)

    return parseCallback(null, { 'personsClothed' : analysisJSON } );

  }
  else {
    analysisJSON['error'] = "no NSFW content parsed.";
    return parseCallback(new Error("image object not supplied to function."), analysisJSON);
  }
  //return analysisJSON;
}
