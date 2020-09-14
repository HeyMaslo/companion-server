"use strict";
// Basic libraries for nodejs, express application
const multer = require('multer');
//const fetch = require('node-fetch');
global.fetch = require("node-fetch");
const path = require('path');

//traditional image processing and other media helpers
const { Image } = require('image-js');
const ce = require('colour-extractor');
const ColorThief = require('color-thief');
var Jimp = require('jimp');
const zlib = require('zlib');
const jpeg = require('jpeg-js');
const sharp = require('sharp');

require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');


// Basic Image Data
module.exports = async function imageMetadata(img, parseCallback) {
  console.log("imageMetaData");

  var analysisJSON = {};
  if (typeof (img) == "object") {

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

    var ct = new ColorThief();
    var palette = ct.getPalette(img, 5);

    analysisJSON['mediaDominantColors'] = palette.map(x => ce.rgb2hex(x));

    //map over all the colors to convert
    //ce.rgb2hex(colours[0][0][1])
    analysisJSON['mediaImageResolution'] = {
      "height": imageBasics.width,
      "width": imageBasics.height
    };
    analysisJSON['mediaColorComponents'] = imageBasics.components;

    //image quality assessment.
    //analysisJSON['mediaVisualFocus']=[
    // "blurry"
    //];

    //image quality assessment.
    const { entropy, sharpness } = await sharp(img).stats();
    analysisJSON['mediaVisualFocus'] = { "sharpness": sharpness, "entropy": entropy };

    var compressed = zlib.deflateSync(img).toString('base64');
    var uncompressed = zlib.inflateSync(new Buffer(compressed, 'base64')).toString();
    analysisJSON['mediaFileSize'] = imageBasics.size;//may want to use: uncompressed
    //console.log(Buffer.byteLength(compressed));
    // console.log(Buffer.byteLength(uncompressed));
    analysisJSON['mediaCompressionSize'] = Buffer.byteLength(compressed);
    analysisJSON['mediaCompressionPercentage'] = Buffer.byteLength(compressed) / Buffer.byteLength(uncompressed);

    //memory clean up
    ct = null;
    palette = null;
    imageBasics = null;
    compressed = null;
    uncompressed = null;

    return parseCallback(null, analysisJSON);
  }
  else {
    analysisJSON['error'] = "no image information parsed.";
    return parseCallback(new Error("image object not supplied to function."), analysisJSON);
  }
}
