"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var keypoints_1 = require("../keypoints");
var util_1 = require("./util");
function computeDistance(embedding, pose, minPartScore) {
    if (minPartScore === void 0) { minPartScore = 0.3; }
    var distance = 0.0;
    var numKpt = 0;
    for (var p = 0; p < embedding.length; p++) {
        if (pose.keypoints[p].score > minPartScore) {
            numKpt += 1;
            distance += Math.pow((embedding[p].x - pose.keypoints[p].position.x), 2) +
                Math.pow((embedding[p].y - pose.keypoints[p].position.y), 2);
        }
    }
    if (numKpt === 0) {
        distance = Infinity;
    }
    else {
        distance = distance / numKpt;
    }
    return distance;
}
function convertToPositionInOuput(position, _a, _b, stride) {
    var padT = _a[0], padL = _a[1];
    var scaleX = _b[0], scaleY = _b[1];
    var y = Math.round(((padT + position.y + 1.0) * scaleY - 1.0) / stride);
    var x = Math.round(((padL + position.x + 1.0) * scaleX - 1.0) / stride);
    return { x: x, y: y };
}
function getEmbedding(location, keypointIndex, convertToPosition, outputResolutionX, longOffsets, refineSteps, _a) {
    var height = _a[0], width = _a[1];
    var newLocation = convertToPosition(location);
    var nn = newLocation.y * outputResolutionX + newLocation.x;
    var dy = longOffsets[keypoints_1.NUM_KEYPOINTS * (2 * nn) + keypointIndex];
    var dx = longOffsets[keypoints_1.NUM_KEYPOINTS * (2 * nn + 1) + keypointIndex];
    var y = location.y + dy;
    var x = location.x + dx;
    for (var t = 0; t < refineSteps; t++) {
        y = Math.min(y, height - 1);
        x = Math.min(x, width - 1);
        var newPos = convertToPosition({ x: x, y: y });
        var nn_1 = newPos.y * outputResolutionX + newPos.x;
        dy = longOffsets[keypoints_1.NUM_KEYPOINTS * (2 * nn_1) + keypointIndex];
        dx = longOffsets[keypoints_1.NUM_KEYPOINTS * (2 * nn_1 + 1) + keypointIndex];
        y = y + dy;
        x = x + dx;
    }
    return { x: x, y: y };
}
function matchEmbeddingToInstance(location, longOffsets, poses, numKptForMatching, _a, _b, outputResolutionX, _c, stride, refineSteps) {
    var padT = _a[0], padL = _a[1];
    var scaleX = _b[0], scaleY = _b[1];
    var height = _c[0], width = _c[1];
    var embed = [];
    var convertToPosition = function (pair) {
        return convertToPositionInOuput(pair, [padT, padL], [scaleX, scaleY], stride);
    };
    for (var keypointsIndex = 0; keypointsIndex < numKptForMatching; keypointsIndex++) {
        var embedding = getEmbedding(location, keypointsIndex, convertToPosition, outputResolutionX, longOffsets, refineSteps, [height, width]);
        embed.push(embedding);
    }
    var kMin = -1;
    var kMinDist = Infinity;
    for (var k = 0; k < poses.length; k++) {
        var dist = computeDistance(embed, poses[k]);
        if (dist < kMinDist) {
            kMin = k;
            kMinDist = dist;
        }
    }
    return kMin;
}
function getOutputResolution(_a, stride) {
    var inputResolutionY = _a[0], inputResolutionX = _a[1];
    var outputResolutionX = Math.round((inputResolutionX - 1.0) / stride + 1.0);
    var outputResolutionY = Math.round((inputResolutionY - 1.0) / stride + 1.0);
    return [outputResolutionX, outputResolutionY];
}
function decodeMultipleMasksCPU(segmentation, longOffsets, posesAboveScore, height, width, stride, _a, padding, refineSteps, numKptForMatching) {
    var inHeight = _a[0], inWidth = _a[1];
    if (numKptForMatching === void 0) { numKptForMatching = 5; }
    var dataArrays = posesAboveScore.map(function (x) { return new Uint8Array(height * width).fill(0); });
    var padT = padding.top, padL = padding.left;
    var _b = util_1.getScale([height, width], [inHeight, inWidth], padding), scaleX = _b[0], scaleY = _b[1];
    var outputResolutionX = getOutputResolution([inHeight, inWidth], stride)[0];
    for (var i = 0; i < height; i += 1) {
        for (var j = 0; j < width; j += 1) {
            var n = i * width + j;
            var prob = segmentation[n];
            if (prob === 1) {
                var kMin = matchEmbeddingToInstance({ x: j, y: i }, longOffsets, posesAboveScore, numKptForMatching, [padT, padL], [scaleX, scaleY], outputResolutionX, [height, width], stride, refineSteps);
                if (kMin >= 0) {
                    dataArrays[kMin][n] = 1;
                }
            }
        }
    }
    return dataArrays;
}
exports.decodeMultipleMasksCPU = decodeMultipleMasksCPU;
function decodeMultiplePartMasksCPU(segmentation, longOffsets, partSegmentaion, posesAboveScore, height, width, stride, _a, padding, refineSteps, numKptForMatching) {
    var inHeight = _a[0], inWidth = _a[1];
    if (numKptForMatching === void 0) { numKptForMatching = 5; }
    var dataArrays = posesAboveScore.map(function (x) { return new Int32Array(height * width).fill(-1); });
    var padT = padding.top, padL = padding.left;
    var _b = util_1.getScale([height, width], [inHeight, inWidth], padding), scaleX = _b[0], scaleY = _b[1];
    var outputResolutionX = getOutputResolution([inHeight, inWidth], stride)[0];
    for (var i = 0; i < height; i += 1) {
        for (var j = 0; j < width; j += 1) {
            var n = i * width + j;
            var prob = segmentation[n];
            if (prob === 1) {
                var kMin = matchEmbeddingToInstance({ x: j, y: i }, longOffsets, posesAboveScore, numKptForMatching, [padT, padL], [scaleX, scaleY], outputResolutionX, [height, width], stride, refineSteps);
                if (kMin >= 0) {
                    dataArrays[kMin][n] = partSegmentaion[n];
                }
            }
        }
    }
    return dataArrays;
}
exports.decodeMultiplePartMasksCPU = decodeMultiplePartMasksCPU;
//# sourceMappingURL=decode_multiple_masks_cpu.js.map