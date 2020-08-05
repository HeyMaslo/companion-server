"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var base_model_1 = require("./base_model");
var imageNetMean = [-123.15, -115.90, -103.06];
var ResNet = (function (_super) {
    __extends(ResNet, _super);
    function ResNet() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ResNet.prototype.preprocessInput = function (input) {
        return input.add(imageNetMean);
    };
    ResNet.prototype.nameOutputResults = function (results) {
        var displacementBwd = results[0], displacementFwd = results[1], heatmap = results[2], longOffsets = results[3], offsets = results[4], partHeatmaps = results[5], segmentation = results[6], partOffsets = results[7];
        return {
            offsets: offsets,
            segmentation: segmentation,
            partHeatmaps: partHeatmaps,
            longOffsets: longOffsets,
            heatmap: heatmap,
            displacementFwd: displacementFwd,
            displacementBwd: displacementBwd,
            partOffsets: partOffsets
        };
    };
    return ResNet;
}(base_model_1.BaseModel));
exports.ResNet = ResNet;
//# sourceMappingURL=resnet.js.map