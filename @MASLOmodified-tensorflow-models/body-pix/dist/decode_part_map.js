"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tf = require("@tensorflow/tfjs-core");
function toFlattenedOneHotPartMap(partHeatmapScores) {
    var numParts = partHeatmapScores.shape[2];
    var partMapLocations = partHeatmapScores.argMax(2);
    var partMapFlattened = partMapLocations.reshape([-1]);
    return tf.oneHot(partMapFlattened, numParts);
}
function clipByMask2d(image, mask) {
    return image.mul(mask);
}
function toMaskTensor(segmentScores, threshold) {
    return tf.tidy(function () {
        return segmentScores.greater(tf.scalar(threshold)).toInt();
    });
}
exports.toMaskTensor = toMaskTensor;
function decodePartSegmentation(segmentationMask, partHeatmapScores) {
    var _a = partHeatmapScores.shape, partMapHeight = _a[0], partMapWidth = _a[1], numParts = _a[2];
    return tf.tidy(function () {
        var flattenedMap = toFlattenedOneHotPartMap(partHeatmapScores);
        var partNumbers = tf.range(0, numParts, 1, 'int32').expandDims(1);
        var partMapFlattened = flattenedMap.matMul(partNumbers).toInt();
        var partMap = partMapFlattened.reshape([partMapHeight, partMapWidth]);
        var partMapShiftedUpForClipping = partMap.add(tf.scalar(1, 'int32'));
        return clipByMask2d(partMapShiftedUpForClipping, segmentationMask)
            .sub(tf.scalar(1, 'int32'));
    });
}
exports.decodePartSegmentation = decodePartSegmentation;
function decodeOnlyPartSegmentation(partHeatmapScores) {
    var _a = partHeatmapScores.shape, partMapHeight = _a[0], partMapWidth = _a[1], numParts = _a[2];
    return tf.tidy(function () {
        var flattenedMap = toFlattenedOneHotPartMap(partHeatmapScores);
        var partNumbers = tf.range(0, numParts, 1, 'int32').expandDims(1);
        var partMapFlattened = flattenedMap.matMul(partNumbers).toInt();
        return partMapFlattened.reshape([partMapHeight, partMapWidth]);
    });
}
exports.decodeOnlyPartSegmentation = decodeOnlyPartSegmentation;
//# sourceMappingURL=decode_part_map.js.map