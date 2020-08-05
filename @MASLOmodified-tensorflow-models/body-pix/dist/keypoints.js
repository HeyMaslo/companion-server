"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PART_NAMES = [
    'nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar', 'leftShoulder',
    'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist',
    'leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'
];
exports.NUM_KEYPOINTS = exports.PART_NAMES.length;
exports.PART_IDS = exports.PART_NAMES.reduce(function (result, jointName, i) {
    result[jointName] = i;
    return result;
}, {});
var CONNECTED_PART_NAMES = [
    ['leftHip', 'leftShoulder'], ['leftElbow', 'leftShoulder'],
    ['leftElbow', 'leftWrist'], ['leftHip', 'leftKnee'],
    ['leftKnee', 'leftAnkle'], ['rightHip', 'rightShoulder'],
    ['rightElbow', 'rightShoulder'], ['rightElbow', 'rightWrist'],
    ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle'],
    ['leftShoulder', 'rightShoulder'], ['leftHip', 'rightHip']
];
exports.POSE_CHAIN = [
    ['nose', 'leftEye'], ['leftEye', 'leftEar'], ['nose', 'rightEye'],
    ['rightEye', 'rightEar'], ['nose', 'leftShoulder'],
    ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
    ['leftShoulder', 'leftHip'], ['leftHip', 'leftKnee'],
    ['leftKnee', 'leftAnkle'], ['nose', 'rightShoulder'],
    ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
    ['rightShoulder', 'rightHip'], ['rightHip', 'rightKnee'],
    ['rightKnee', 'rightAnkle']
];
exports.CONNECTED_PART_INDICES = CONNECTED_PART_NAMES.map(function (_a) {
    var jointNameA = _a[0], jointNameB = _a[1];
    return ([exports.PART_IDS[jointNameA], exports.PART_IDS[jointNameB]]);
});
//# sourceMappingURL=keypoints.js.map