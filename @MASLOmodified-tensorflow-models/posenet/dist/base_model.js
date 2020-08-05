"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tf = require("@tensorflow/tfjs-core");
var BaseModel = (function () {
    function BaseModel(model, outputStride) {
        this.model = model;
        this.outputStride = outputStride;
        var inputShape = this.model.inputs[0].shape;
        tf.util.assert((inputShape[1] === -1) && (inputShape[2] === -1), function () { return "Input shape [" + inputShape[1] + ", " + inputShape[2] + "] " +
            "must both be equal to or -1"; });
    }
    BaseModel.prototype.predict = function (input) {
        var _this = this;
        return tf.tidy(function () {
            var asFloat = _this.preprocessInput(input.toFloat());
            var asBatch = asFloat.expandDims(0);
            var results = _this.model.predict(asBatch);
            var results3d = results.map(function (y) { return y.squeeze([0]); });
            var namedResults = _this.nameOutputResults(results3d);
            return {
                heatmapScores: namedResults.heatmap.sigmoid(),
                offsets: namedResults.offsets,
                displacementFwd: namedResults.displacementFwd,
                displacementBwd: namedResults.displacementBwd
            };
        });
    };
    BaseModel.prototype.dispose = function () {
        this.model.dispose();
    };
    return BaseModel;
}());
exports.BaseModel = BaseModel;
//# sourceMappingURL=base_model.js.map