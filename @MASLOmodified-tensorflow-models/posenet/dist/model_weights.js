"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ModelWeights = (function () {
    function ModelWeights(variables) {
        this.variables = variables;
    }
    ModelWeights.prototype.weights = function (layerName) {
        return this.variables["MobilenetV1/" + layerName + "/weights"];
    };
    ModelWeights.prototype.depthwiseBias = function (layerName) {
        return this.variables["MobilenetV1/" + layerName + "/biases"];
    };
    ModelWeights.prototype.convBias = function (layerName) {
        return this.depthwiseBias(layerName);
    };
    ModelWeights.prototype.depthwiseWeights = function (layerName) {
        return this.variables["MobilenetV1/" + layerName + "/depthwise_weights"];
    };
    ModelWeights.prototype.dispose = function () {
        for (var varName in this.variables) {
            this.variables[varName].dispose();
        }
    };
    return ModelWeights;
}());
exports.ModelWeights = ModelWeights;
//# sourceMappingURL=model_weights.js.map