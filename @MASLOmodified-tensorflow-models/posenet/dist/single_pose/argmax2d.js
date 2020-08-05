"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tf = require("@tensorflow/tfjs-core");
function mod(a, b) {
    return tf.tidy(function () {
        var floored = a.div(tf.scalar(b, 'int32'));
        return a.sub(floored.mul(tf.scalar(b, 'int32')));
    });
}
function argmax2d(inputs) {
    var _a = inputs.shape, height = _a[0], width = _a[1], depth = _a[2];
    return tf.tidy(function () {
        var reshaped = inputs.reshape([height * width, depth]);
        var coords = reshaped.argMax(0);
        var yCoords = coords.div(tf.scalar(width, 'int32')).expandDims(1);
        var xCoords = mod(coords, width).expandDims(1);
        return tf.concat([yCoords, xCoords], 1);
    });
}
exports.argmax2d = argmax2d;
//# sourceMappingURL=argmax2d.js.map