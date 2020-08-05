"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var build_part_with_score_queue_1 = require("./build_part_with_score_queue");
var decode_pose_1 = require("./decode_pose");
var util_1 = require("./util");
function withinNmsRadiusOfCorrespondingPoint(poses, squaredNmsRadius, _a, keypointId) {
    var x = _a.x, y = _a.y;
    return poses.some(function (_a) {
        var keypoints = _a.keypoints;
        var correspondingKeypoint = keypoints[keypointId].position;
        return util_1.squaredDistance(y, x, correspondingKeypoint.y, correspondingKeypoint.x) <=
            squaredNmsRadius;
    });
}
function getInstanceScore(existingPoses, squaredNmsRadius, instanceKeypoints) {
    var notOverlappedKeypointScores = instanceKeypoints.reduce(function (result, _a, keypointId) {
        var position = _a.position, score = _a.score;
        if (!withinNmsRadiusOfCorrespondingPoint(existingPoses, squaredNmsRadius, position, keypointId)) {
            result += score;
        }
        return result;
    }, 0.0);
    return notOverlappedKeypointScores /= instanceKeypoints.length;
}
var kLocalMaximumRadius = 1;
function decodeMultiplePoses(scoresBuffer, offsetsBuffer, displacementsFwdBuffer, displacementsBwdBuffer, outputStride, maxPoseDetections, scoreThreshold, nmsRadius) {
    if (scoreThreshold === void 0) { scoreThreshold = 0.5; }
    if (nmsRadius === void 0) { nmsRadius = 20; }
    var poses = [];
    var queue = build_part_with_score_queue_1.buildPartWithScoreQueue(scoreThreshold, kLocalMaximumRadius, scoresBuffer);
    var squaredNmsRadius = nmsRadius * nmsRadius;
    while (poses.length < maxPoseDetections && !queue.empty()) {
        var root = queue.dequeue();
        var rootImageCoords = util_1.getImageCoords(root.part, outputStride, offsetsBuffer);
        if (withinNmsRadiusOfCorrespondingPoint(poses, squaredNmsRadius, rootImageCoords, root.part.id)) {
            continue;
        }
        var keypoints = decode_pose_1.decodePose(root, scoresBuffer, offsetsBuffer, outputStride, displacementsFwdBuffer, displacementsBwdBuffer);
        var score = getInstanceScore(poses, squaredNmsRadius, keypoints);
        poses.push({ keypoints: keypoints, score: score });
    }
    return poses;
}
exports.decodeMultiplePoses = decodeMultiplePoses;
//# sourceMappingURL=decode_multiple_poses.js.map