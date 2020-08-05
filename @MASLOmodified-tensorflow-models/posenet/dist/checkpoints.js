"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MOBILENET_BASE_URL = 'https://storage.googleapis.com/tfjs-models/savedmodel/posenet/mobilenet/';
var RESNET50_BASE_URL = 'https://storage.googleapis.com/tfjs-models/savedmodel/posenet/resnet50/';
function resNet50Checkpoint(stride, quantBytes) {
    var graphJson = "model-stride" + stride + ".json";
    if (quantBytes === 4) {
        return RESNET50_BASE_URL + "float/" + graphJson;
    }
    else {
        return RESNET50_BASE_URL + ("quant" + quantBytes + "/") + graphJson;
    }
}
exports.resNet50Checkpoint = resNet50Checkpoint;
function mobileNetCheckpoint(stride, multiplier, quantBytes) {
    var toStr = { 1.0: '100', 0.75: '075', 0.50: '050' };
    var graphJson = "model-stride" + stride + ".json";
    if (quantBytes === 4) {
        return MOBILENET_BASE_URL + ("float/" + toStr[multiplier] + "/") + graphJson;
    }
    else {
        return MOBILENET_BASE_URL + ("quant" + quantBytes + "/" + toStr[multiplier] + "/") +
            graphJson;
    }
}
exports.mobileNetCheckpoint = mobileNetCheckpoint;
//# sourceMappingURL=checkpoints.js.map