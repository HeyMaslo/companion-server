/* eslint-disable no-buffer-constructor */
// Basic libraries for nodejs, express application
// const fetch = require('node-fetch');
global.fetch = require('node-fetch');

// traditional image processing and other media helpers
const { Image } = require('image-js');
const ce = require('colour-extractor');
const ColorThief = require('color-thief');
const zlib = require('zlib');
const sharp = require('sharp');

require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');

// Basic Image Data
module.exports = async function imageMetadata(img, parseCallback) {
  console.log('imageMetaData');

  const analysisJSON = {};
  if (typeof (img) === 'object') {
    // first the basics of image processing
    // https://image-js.github.io/image-js/#imagecomponents

    let imageBasics = await Image.load(img);

    /* This is too slow
      //TESTING JS FEAT

      //context2d.drawImage(video, 0, 0, width, height);
      //var image_data = context2d.getImageData(0, 0, width, height);
      var image_data = imageBasics;
      var gray_img = new jsfeat.matrix_t(
        imageBasics.width, imageBasics.height, jsfeat.U8_t | jsfeat.C1_t);
      var code = jsfeat.COLOR_RGBA2GRAY;
      var jsFeatOut={}
      jsFeatOut=await jsfeat.imgproc.grayscale(
        image_data, imageBasics.width, imageBasics.height, gray_img, code);
      analysisJSON['imageLines']=jsFeatOut;
      var matrix = new jsfeat.matrix_t(2,2, jsfeat.U8_t | jsfeat.C1_t);
      matrix.data[1] = 4;
      console.log(matrix.data[1]);
      console.log("jsfeat: " + jsFeatOut);
    */

    let ct = new ColorThief();
    let palette = ct.getPalette(img, 5);

    analysisJSON.mediaDominantColors = palette.map((x) => ce.rgb2hex(x));

    // map over all the colors to convert
    // ce.rgb2hex(colours[0][0][1])
    analysisJSON.mediaImageResolution = {
      height: imageBasics.width,
      width: imageBasics.height,
    };
    analysisJSON.mediaColorComponents = imageBasics.components;

    // image quality assessment.
    // analysisJSON['mediaVisualFocus']=[
    // "blurry"
    // ];

    // image quality assessment.
    const { entropy, sharpness } = await sharp(img).stats();
    analysisJSON.mediaVisualFocus = { sharpness, entropy };

    let compressed = zlib.deflateSync(img).toString('base64');
    let uncompressed = zlib.inflateSync(new Buffer(compressed, 'base64')).toString();
    analysisJSON.mediaFileSize = imageBasics.size;// may want to use: uncompressed
    // console.log(Buffer.byteLength(compressed));
    // console.log(Buffer.byteLength(uncompressed));
    const compressedSize = Buffer.byteLength(compressed);
    const uncompressedSize = Buffer.byteLength(uncompressed);
    const compressedPercentage = compressedSize / uncompressedSize;
    analysisJSON.mediaCompressionSize = compressedSize;
    analysisJSON.mediaCompressionPercentage = compressedPercentage;

    // memory clean up
    ct = null;
    palette = null;
    imageBasics = null;
    compressed = null;
    uncompressed = null;

    return parseCallback(null, { imageMeta: analysisJSON });
  }

  analysisJSON.error = 'no image information parsed.';
  return parseCallback(new Error('image object not supplied to function.'), analysisJSON);
};
