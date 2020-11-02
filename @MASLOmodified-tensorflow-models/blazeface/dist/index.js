"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tfconv = require("@tensorflow/tfjs-converter");
const face_1 = require("./face");
const port = process.env.PORT || 8080;
//const BLAZEFACE_MODEL_URL = 'https://tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1';
const BLAZEFACE_MODEL_URL = `http://localhost:${port}/tensorflowlocal/blazeface_1_default_1/model.json`
async function load({ maxFaces = 10, inputWidth = 128, inputHeight = 128, iouThreshold = 0.3, scoreThreshold = 0.75 } = {}) {
    //const blazeface = await tfconv.loadGraphModel(BLAZEFACE_MODEL_URL, { fromTFHub: true });
    //console.log(BLAZEFACE_MODEL_URL);
    const blazeface = await tfconv.loadGraphModel(BLAZEFACE_MODEL_URL);
    const model = new face_1.BlazeFaceModel(blazeface, inputWidth, inputHeight, maxFaces, iouThreshold, scoreThreshold);
    return model;
}
exports.load = load;
var face_2 = require("./face");
exports.BlazeFaceModel = face_2.BlazeFaceModel;
//# sourceMappingURL=index.js.map