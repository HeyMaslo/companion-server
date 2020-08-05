"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tf = require("@tensorflow/tfjs-core");
var keypoints_1 = require("../keypoints");
var util_1 = require("./util");
function decodeMultipleMasksWebGl(segmentation, longOffsets, posesAboveScore, height, width, stride, _a, padding, refineSteps, minKptScore, maxNumPeople) {
    var inHeight = _a[0], inWidth = _a[1];
    var _b = segmentation.shape, origHeight = _b[0], origWidth = _b[1];
    var _c = longOffsets.shape.slice(0, 2), outHeight = _c[0], outWidth = _c[1];
    var shapedLongOffsets = longOffsets.reshape([outHeight, outWidth, 2, keypoints_1.NUM_KEYPOINTS]);
    var poseVals = new Float32Array(maxNumPeople * keypoints_1.NUM_KEYPOINTS * 3).fill(0.0);
    for (var i = 0; i < posesAboveScore.length; i++) {
        var poseOffset = i * keypoints_1.NUM_KEYPOINTS * 3;
        var pose = posesAboveScore[i];
        for (var kp = 0; kp < keypoints_1.NUM_KEYPOINTS; kp++) {
            var keypoint = pose.keypoints[kp];
            var offset = poseOffset + kp * 3;
            poseVals[offset] = keypoint.score;
            poseVals[offset + 1] = keypoint.position.y;
            poseVals[offset + 2] = keypoint.position.x;
        }
    }
    var _d = util_1.getScale([height, width], [inHeight, inWidth], padding), scaleX = _d[0], scaleY = _d[1];
    var posesTensor = tf.tensor(poseVals, [maxNumPeople, keypoints_1.NUM_KEYPOINTS, 3]);
    var padT = padding.top, padL = padding.left;
    var program = {
        variableNames: ['segmentation', 'longOffsets', 'poses'],
        outputShape: [origHeight, origWidth],
        userCode: "\n    int convertToPositionInOutput(int pos, int pad, float scale, int stride) {\n      return round(((float(pos + pad) + 1.0) * scale - 1.0) / float(stride));\n    }\n\n    float convertToPositionInOutputFloat(\n        int pos, int pad, float scale, int stride) {\n      return ((float(pos + pad) + 1.0) * scale - 1.0) / float(stride);\n    }\n\n    float dist(float x1, float y1, float x2, float y2) {\n      return pow(x1 - x2, 2.0) + pow(y1 - y2, 2.0);\n    }\n\n    float sampleLongOffsets(float h, float w, int d, int k) {\n      float fh = fract(h);\n      float fw = fract(w);\n      int clH = int(ceil(h));\n      int clW = int(ceil(w));\n      int flH = int(floor(h));\n      int flW = int(floor(w));\n      float o11 = getLongOffsets(flH, flW, d, k);\n      float o12 = getLongOffsets(flH, clW, d, k);\n      float o21 = getLongOffsets(clH, flW, d, k);\n      float o22 = getLongOffsets(clH, clW, d, k);\n      float o1 = mix(o11, o12, fw);\n      float o2 = mix(o21, o22, fw);\n      return mix(o1, o2, fh);\n    }\n\n    int findNearestPose(int h, int w) {\n      float prob = getSegmentation(h, w);\n      if (prob < 1.0) {\n        return -1;\n      }\n\n      // Done(Tyler): convert from output space h/w to strided space.\n      float stridedH = convertToPositionInOutputFloat(\n        h, " + padT + ", " + scaleY + ", " + stride + ");\n      float stridedW = convertToPositionInOutputFloat(\n        w, " + padL + ", " + scaleX + ", " + stride + ");\n\n      float minDist = 1000000.0;\n      int iMin = -1;\n      for (int i = 0; i < " + maxNumPeople + "; i++) {\n        float curDistSum = 0.0;\n        int numKpt = 0;\n        for (int k = 0; k < " + keypoints_1.NUM_KEYPOINTS + "; k++) {\n          float dy = sampleLongOffsets(stridedH, stridedW, 0, k);\n          float dx = sampleLongOffsets(stridedH, stridedW, 1, k);\n\n          float y = float(h) + dy;\n          float x = float(w) + dx;\n\n          for (int s = 0; s < " + refineSteps + "; s++) {\n            int yRounded = round(min(y, float(" + (height - 1.0) + ")));\n            int xRounded = round(min(x, float(" + (width - 1.0) + ")));\n\n            float yStrided = convertToPositionInOutputFloat(\n              yRounded, " + padT + ", " + scaleY + ", " + stride + ");\n            float xStrided = convertToPositionInOutputFloat(\n              xRounded, " + padL + ", " + scaleX + ", " + stride + ");\n\n            float dy = sampleLongOffsets(yStrided, xStrided, 0, k);\n            float dx = sampleLongOffsets(yStrided, xStrided, 1, k);\n\n            y = y + dy;\n            x = x + dx;\n          }\n\n          float poseScore = getPoses(i, k, 0);\n          float poseY = getPoses(i, k, 1);\n          float poseX = getPoses(i, k, 2);\n          if (poseScore > " + minKptScore + ") {\n            numKpt = numKpt + 1;\n            curDistSum = curDistSum + dist(x, y, poseX, poseY);\n          }\n        }\n        if (numKpt > 0 && curDistSum / float(numKpt) < minDist) {\n          minDist = curDistSum / float(numKpt);\n          iMin = i;\n        }\n      }\n      return iMin;\n    }\n\n    void main() {\n        ivec2 coords = getOutputCoords();\n        int nearestPose = findNearestPose(coords[0], coords[1]);\n        setOutput(float(nearestPose));\n      }\n  "
    };
    var webglBackend = tf.backend();
    return webglBackend.compileAndRun(program, [segmentation, shapedLongOffsets, posesTensor]);
}
exports.decodeMultipleMasksWebGl = decodeMultipleMasksWebGl;
//# sourceMappingURL=decode_multiple_masks_webgl.js.map