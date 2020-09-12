"use strict";

// Basic libraries for nodejs, express application
global.fetch = require("node-fetch");

// Config
const port = 8080 | process.env.PORT;
const localModelURL = `http://localhost:${port}/`;

require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');

// Tensflow trained models.
//NOTE THAT SOME OF THESE ACCESS THE INTERNET BY DEFAULT.  Change that.
const posenet = require('@tensorflow-models/posenet');

//POSES
module.exports = async function imagePosing(imgToParse, parseCallback) {

  var analysisJSON = {};
  if (typeof (imgToParse) == "object") {
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
      modelUrl: localModelURL + 'tensorflowlocal/posenet/model-stride16.json'
    });

    // const net = await posenet.load({modelUrl:localModelURL+'mobilenet/model.json'});
    // const net = await posenet.load();

    const predictionPose = await net.estimateSinglePose(imgToParse, {
      flipHorizontal: false
    });

    // console.log('PosePredictions: ');
    // console.log(predictionPose);

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
    let poseLabel = "unknown";

    //add checks for different body positions
    if ((predictionPose.keypoints[predictionPose.keypoints.findIndex(obj => obj.part == "nose")].position.y > predictionPose.keypoints[predictionPose.keypoints.findIndex(obj => obj.part == "leftAnkle")].position.y) || (predictionPose.keypoints[predictionPose.keypoints.findIndex(obj => obj.part == "nose")].position.y > predictionPose.keypoints[predictionPose.keypoints.findIndex(obj => obj.part == "rightAnkle")].position.y)) {
      poseLabel = "layingdown"
    };

    // console.log(poseLabel);
    analysisJSON['pose'] = poseLabel;
    analysisJSON['poseLandmarks'] = predictionPose;

    return parseCallback(null, analysisJSON);

  } else {
    analysisJSON['error'] = "no NSFW content parsed.";
    return parseCallback(new Error("image object not supplied to function."), analysisJSON);
  }
}
