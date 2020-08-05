"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var tfconv = require("@tensorflow/tfjs-converter");
var tf = require("@tensorflow/tfjs-core");
var decode_part_map_1 = require("./decode_part_map");
var mobilenet_1 = require("./mobilenet");
var decode_instance_masks_1 = require("./multi_person/decode_instance_masks");
var decode_multiple_poses_1 = require("./multi_person/decode_multiple_poses");
var resnet_1 = require("./resnet");
var saved_models_1 = require("./saved_models");
var util_1 = require("./util");
var APPLY_SIGMOID_ACTIVATION = true;
var FLIP_POSES_AFTER_SCALING = false;
var MOBILENET_V1_CONFIG = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    quantBytes: 4,
    multiplier: 0.75,
};
var VALID_ARCHITECTURE = ['MobileNetV1', 'ResNet50'];
var VALID_STRIDE = {
    'MobileNetV1': [8, 16, 32],
    'ResNet50': [32, 16]
};
var VALID_MULTIPLIER = {
    'MobileNetV1': [0.50, 0.75, 1.0],
    'ResNet50': [1.0]
};
var VALID_QUANT_BYTES = [1, 2, 4];
function validateModelConfig(config) {
    config = config || MOBILENET_V1_CONFIG;
    if (config.architecture == null) {
        config.architecture = 'MobileNetV1';
    }
    if (VALID_ARCHITECTURE.indexOf(config.architecture) < 0) {
        throw new Error("Invalid architecture " + config.architecture + ". " +
            ("Should be one of " + VALID_ARCHITECTURE));
    }
    if (config.outputStride == null) {
        config.outputStride = 16;
    }
    if (VALID_STRIDE[config.architecture].indexOf(config.outputStride) < 0) {
        throw new Error("Invalid outputStride " + config.outputStride + ". " +
            ("Should be one of " + VALID_STRIDE[config.architecture] + " ") +
            ("for architecture " + config.architecture + "."));
    }
    if (config.multiplier == null) {
        config.multiplier = 1.0;
    }
    if (VALID_MULTIPLIER[config.architecture].indexOf(config.multiplier) < 0) {
        throw new Error("Invalid multiplier " + config.multiplier + ". " +
            ("Should be one of " + VALID_MULTIPLIER[config.architecture] + " ") +
            ("for architecture " + config.architecture + "."));
    }
    if (config.quantBytes == null) {
        config.quantBytes = 4;
    }
    if (VALID_QUANT_BYTES.indexOf(config.quantBytes) < 0) {
        throw new Error("Invalid quantBytes " + config.quantBytes + ". " +
            ("Should be one of " + VALID_QUANT_BYTES + " ") +
            ("for architecture " + config.architecture + "."));
    }
    return config;
}
exports.PERSON_INFERENCE_CONFIG = {
    flipHorizontal: false,
    internalResolution: 'medium',
    segmentationThreshold: 0.7,
    maxDetections: 10,
    scoreThreshold: 0.4,
    nmsRadius: 20,
};
exports.MULTI_PERSON_INSTANCE_INFERENCE_CONFIG = {
    flipHorizontal: false,
    internalResolution: 'medium',
    segmentationThreshold: 0.7,
    maxDetections: 10,
    scoreThreshold: 0.4,
    nmsRadius: 20,
    minKeypointScore: 0.3,
    refineSteps: 10
};
function validatePersonInferenceConfig(config) {
    var segmentationThreshold = config.segmentationThreshold, maxDetections = config.maxDetections, scoreThreshold = config.scoreThreshold, nmsRadius = config.nmsRadius;
    if (segmentationThreshold < 0.0 || segmentationThreshold > 1.0) {
        throw new Error("segmentationThreshold " + segmentationThreshold + ". " +
            "Should be in range [0.0, 1.0]");
    }
    if (maxDetections <= 0) {
        throw new Error("Invalid maxDetections " + maxDetections + ". " +
            "Should be > 0");
    }
    if (scoreThreshold < 0.0 || scoreThreshold > 1.0) {
        throw new Error("Invalid scoreThreshold " + scoreThreshold + ". " +
            "Should be in range [0.0, 1.0]");
    }
    if (nmsRadius <= 0) {
        throw new Error("Invalid nmsRadius " + nmsRadius + ".");
    }
}
function validateMultiPersonInstanceInferenceConfig(config) {
    var segmentationThreshold = config.segmentationThreshold, maxDetections = config.maxDetections, scoreThreshold = config.scoreThreshold, nmsRadius = config.nmsRadius, minKeypointScore = config.minKeypointScore, refineSteps = config.refineSteps;
    if (segmentationThreshold < 0.0 || segmentationThreshold > 1.0) {
        throw new Error("segmentationThreshold " + segmentationThreshold + ". " +
            "Should be in range [0.0, 1.0]");
    }
    if (maxDetections <= 0) {
        throw new Error("Invalid maxDetections " + maxDetections + ". " +
            "Should be > 0");
    }
    if (scoreThreshold < 0.0 || scoreThreshold > 1.0) {
        throw new Error("Invalid scoreThreshold " + scoreThreshold + ". " +
            "Should be in range [0.0, 1.0]");
    }
    if (nmsRadius <= 0) {
        throw new Error("Invalid nmsRadius " + nmsRadius + ".");
    }
    if (minKeypointScore < 0 || minKeypointScore > 1) {
        throw new Error("Invalid minKeypointScore " + minKeypointScore + "." +
            "Should be in range [0.0, 1.0]");
    }
    if (refineSteps <= 0 || refineSteps > 20) {
        throw new Error("Invalid refineSteps " + refineSteps + "." +
            "Should be in range [1, 20]");
    }
}
var BodyPix = (function () {
    function BodyPix(net) {
        this.baseModel = net;
    }
    BodyPix.prototype.predictForPersonSegmentation = function (input) {
        var _a = this.baseModel.predict(input), segmentation = _a.segmentation, heatmapScores = _a.heatmapScores, offsets = _a.offsets, displacementFwd = _a.displacementFwd, displacementBwd = _a.displacementBwd;
        return {
            segmentLogits: segmentation,
            heatmapScores: heatmapScores,
            offsets: offsets,
            displacementFwd: displacementFwd,
            displacementBwd: displacementBwd,
        };
    };
    BodyPix.prototype.predictForPersonSegmentationAndPart = function (input) {
        var _a = this.baseModel.predict(input), segmentation = _a.segmentation, partHeatmaps = _a.partHeatmaps, heatmapScores = _a.heatmapScores, offsets = _a.offsets, displacementFwd = _a.displacementFwd, displacementBwd = _a.displacementBwd;
        return {
            segmentLogits: segmentation,
            partHeatmapLogits: partHeatmaps,
            heatmapScores: heatmapScores,
            offsets: offsets,
            displacementFwd: displacementFwd,
            displacementBwd: displacementBwd,
        };
    };
    BodyPix.prototype.predictForMultiPersonInstanceSegmentationAndPart = function (input) {
        var _a = this.baseModel.predict(input), segmentation = _a.segmentation, longOffsets = _a.longOffsets, heatmapScores = _a.heatmapScores, offsets = _a.offsets, displacementFwd = _a.displacementFwd, displacementBwd = _a.displacementBwd, partHeatmaps = _a.partHeatmaps;
        return {
            segmentLogits: segmentation,
            longOffsets: longOffsets,
            heatmapScores: heatmapScores,
            offsets: offsets,
            displacementFwd: displacementFwd,
            displacementBwd: displacementBwd,
            partHeatmaps: partHeatmaps
        };
    };
    BodyPix.prototype.segmentPersonActivation = function (input, internalResolution, segmentationThreshold) {
        var _this = this;
        if (segmentationThreshold === void 0) { segmentationThreshold = 0.5; }
        var _a = util_1.getInputSize(input), height = _a[0], width = _a[1];
        var internalResolutionHeightAndWidth = util_1.toInputResolutionHeightAndWidth(internalResolution, this.baseModel.outputStride, [height, width]);
        var _b = util_1.padAndResizeTo(input, internalResolutionHeightAndWidth), resized = _b.resized, padding = _b.padding;
        var _c = tf.tidy(function () {
            var _a = _this.predictForPersonSegmentation(resized), segmentLogits = _a.segmentLogits, heatmapScores = _a.heatmapScores, offsets = _a.offsets, displacementFwd = _a.displacementFwd, displacementBwd = _a.displacementBwd;
            var _b = resized.shape, resizedHeight = _b[0], resizedWidth = _b[1];
            var scaledSegmentScores = util_1.scaleAndCropToInputTensorShape(segmentLogits, [height, width], [resizedHeight, resizedWidth], [[padding.top, padding.bottom], [padding.left, padding.right]], APPLY_SIGMOID_ACTIVATION);
            return {
                segmentation: decode_part_map_1.toMaskTensor(scaledSegmentScores.squeeze(), segmentationThreshold),
                heatmapScores: heatmapScores,
                offsets: offsets,
                displacementFwd: displacementFwd,
                displacementBwd: displacementBwd,
            };
        }), segmentation = _c.segmentation, heatmapScores = _c.heatmapScores, offsets = _c.offsets, displacementFwd = _c.displacementFwd, displacementBwd = _c.displacementBwd;
        resized.dispose();
        return {
            segmentation: segmentation,
            heatmapScores: heatmapScores,
            offsets: offsets,
            displacementFwd: displacementFwd,
            displacementBwd: displacementBwd,
            padding: padding,
            internalResolutionHeightAndWidth: internalResolutionHeightAndWidth
        };
    };
    BodyPix.prototype.segmentPerson = function (input, config) {
        if (config === void 0) { config = exports.PERSON_INFERENCE_CONFIG; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, segmentation, heatmapScores, offsets, displacementFwd, displacementBwd, padding, internalResolutionHeightAndWidth, _b, height, width, result, _c, scoresBuf, offsetsBuf, displacementsFwdBuf, displacementsBwdBuf, poses;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        config = __assign({}, exports.PERSON_INFERENCE_CONFIG, config);
                        validatePersonInferenceConfig(config);
                        _a = this.segmentPersonActivation(input, config.internalResolution, config.segmentationThreshold), segmentation = _a.segmentation, heatmapScores = _a.heatmapScores, offsets = _a.offsets, displacementFwd = _a.displacementFwd, displacementBwd = _a.displacementBwd, padding = _a.padding, internalResolutionHeightAndWidth = _a.internalResolutionHeightAndWidth;
                        _b = segmentation.shape, height = _b[0], width = _b[1];
                        return [4, segmentation.data()];
                    case 1:
                        result = _d.sent();
                        segmentation.dispose();
                        return [4, util_1.toTensorBuffers3D([heatmapScores, offsets, displacementFwd, displacementBwd])];
                    case 2:
                        _c = _d.sent(), scoresBuf = _c[0], offsetsBuf = _c[1], displacementsFwdBuf = _c[2], displacementsBwdBuf = _c[3];
                        poses = decode_multiple_poses_1.decodeMultiplePoses(scoresBuf, offsetsBuf, displacementsFwdBuf, displacementsBwdBuf, this.baseModel.outputStride, config.maxDetections, config.scoreThreshold, config.nmsRadius);
                        poses = util_1.scaleAndFlipPoses(poses, [height, width], internalResolutionHeightAndWidth, padding, FLIP_POSES_AFTER_SCALING);
                        heatmapScores.dispose();
                        offsets.dispose();
                        displacementFwd.dispose();
                        displacementBwd.dispose();
                        return [2, { height: height, width: width, data: result, allPoses: poses }];
                }
            });
        });
    };
    BodyPix.prototype.segmentMultiPerson = function (input, config) {
        if (config === void 0) { config = exports.MULTI_PERSON_INSTANCE_INFERENCE_CONFIG; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, height, width, internalResolutionHeightAndWidth, _b, resized, padding, _c, segmentation, longOffsets, heatmapScoresRaw, offsetsRaw, displacementFwdRaw, displacementBwdRaw, _d, scoresBuf, offsetsBuf, displacementsFwdBuf, displacementsBwdBuf, poses, instanceMasks;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        config = __assign({}, exports.MULTI_PERSON_INSTANCE_INFERENCE_CONFIG, config);
                        validateMultiPersonInstanceInferenceConfig(config);
                        _a = util_1.getInputSize(input), height = _a[0], width = _a[1];
                        internalResolutionHeightAndWidth = util_1.toInputResolutionHeightAndWidth(config.internalResolution, this.baseModel.outputStride, [height, width]);
                        _b = util_1.padAndResizeTo(input, internalResolutionHeightAndWidth), resized = _b.resized, padding = _b.padding;
                        _c = tf.tidy(function () {
                            var _a = _this.predictForMultiPersonInstanceSegmentationAndPart(resized), segmentLogits = _a.segmentLogits, longOffsets = _a.longOffsets, heatmapScores = _a.heatmapScores, offsets = _a.offsets, displacementFwd = _a.displacementFwd, displacementBwd = _a.displacementBwd;
                            var scaledSegmentScores = util_1.scaleAndCropToInputTensorShape(segmentLogits, [height, width], internalResolutionHeightAndWidth, [[padding.top, padding.bottom], [padding.left, padding.right]], APPLY_SIGMOID_ACTIVATION);
                            var longOffsetsResized = false;
                            var scaledLongOffsets;
                            if (longOffsetsResized) {
                                scaledLongOffsets = util_1.scaleAndCropToInputTensorShape(longOffsets, [height, width], internalResolutionHeightAndWidth, [[padding.top, padding.bottom], [padding.left, padding.right]], APPLY_SIGMOID_ACTIVATION);
                            }
                            else {
                                scaledLongOffsets = longOffsets;
                            }
                            var segmentation = decode_part_map_1.toMaskTensor(scaledSegmentScores.squeeze(), config.segmentationThreshold);
                            return {
                                segmentation: segmentation,
                                longOffsets: scaledLongOffsets,
                                heatmapScoresRaw: heatmapScores,
                                offsetsRaw: offsets,
                                displacementFwdRaw: displacementFwd,
                                displacementBwdRaw: displacementBwd,
                            };
                        }), segmentation = _c.segmentation, longOffsets = _c.longOffsets, heatmapScoresRaw = _c.heatmapScoresRaw, offsetsRaw = _c.offsetsRaw, displacementFwdRaw = _c.displacementFwdRaw, displacementBwdRaw = _c.displacementBwdRaw;
                        return [4, util_1.toTensorBuffers3D([
                                heatmapScoresRaw, offsetsRaw, displacementFwdRaw, displacementBwdRaw
                            ])];
                    case 1:
                        _d = _e.sent(), scoresBuf = _d[0], offsetsBuf = _d[1], displacementsFwdBuf = _d[2], displacementsBwdBuf = _d[3];
                        poses = decode_multiple_poses_1.decodeMultiplePoses(scoresBuf, offsetsBuf, displacementsFwdBuf, displacementsBwdBuf, this.baseModel.outputStride, config.maxDetections, config.scoreThreshold, config.nmsRadius);
                        poses = util_1.scaleAndFlipPoses(poses, [height, width], internalResolutionHeightAndWidth, padding, FLIP_POSES_AFTER_SCALING);
                        return [4, decode_instance_masks_1.decodePersonInstanceMasks(segmentation, longOffsets, poses, height, width, this.baseModel.outputStride, internalResolutionHeightAndWidth, padding, config.scoreThreshold, config.refineSteps, config.minKeypointScore, config.maxDetections)];
                    case 2:
                        instanceMasks = _e.sent();
                        resized.dispose();
                        segmentation.dispose();
                        longOffsets.dispose();
                        heatmapScoresRaw.dispose();
                        offsetsRaw.dispose();
                        displacementFwdRaw.dispose();
                        displacementBwdRaw.dispose();
                        return [2, instanceMasks];
                }
            });
        });
    };
    BodyPix.prototype.segmentPersonPartsActivation = function (input, internalResolution, segmentationThreshold) {
        var _this = this;
        if (segmentationThreshold === void 0) { segmentationThreshold = 0.5; }
        var _a = util_1.getInputSize(input), height = _a[0], width = _a[1];
        var internalResolutionHeightAndWidth = util_1.toInputResolutionHeightAndWidth(internalResolution, this.baseModel.outputStride, [height, width]);
        var _b = util_1.padAndResizeTo(input, internalResolutionHeightAndWidth), resized = _b.resized, padding = _b.padding;
        var _c = tf.tidy(function () {
            var _a = _this.predictForPersonSegmentationAndPart(resized), segmentLogits = _a.segmentLogits, partHeatmapLogits = _a.partHeatmapLogits, heatmapScores = _a.heatmapScores, offsets = _a.offsets, displacementFwd = _a.displacementFwd, displacementBwd = _a.displacementBwd;
            var _b = resized.shape, resizedHeight = _b[0], resizedWidth = _b[1];
            var scaledSegmentScores = util_1.scaleAndCropToInputTensorShape(segmentLogits, [height, width], [resizedHeight, resizedWidth], [[padding.top, padding.bottom], [padding.left, padding.right]], APPLY_SIGMOID_ACTIVATION);
            var scaledPartHeatmapScore = util_1.scaleAndCropToInputTensorShape(partHeatmapLogits, [height, width], [resizedHeight, resizedWidth], [[padding.top, padding.bottom], [padding.left, padding.right]], APPLY_SIGMOID_ACTIVATION);
            var segmentation = decode_part_map_1.toMaskTensor(scaledSegmentScores.squeeze(), segmentationThreshold);
            return {
                partSegmentation: decode_part_map_1.decodePartSegmentation(segmentation, scaledPartHeatmapScore),
                heatmapScores: heatmapScores,
                offsets: offsets,
                displacementFwd: displacementFwd,
                displacementBwd: displacementBwd,
            };
        }), partSegmentation = _c.partSegmentation, heatmapScores = _c.heatmapScores, offsets = _c.offsets, displacementFwd = _c.displacementFwd, displacementBwd = _c.displacementBwd;
        resized.dispose();
        return {
            partSegmentation: partSegmentation,
            heatmapScores: heatmapScores,
            offsets: offsets,
            displacementFwd: displacementFwd,
            displacementBwd: displacementBwd,
            padding: padding,
            internalResolutionHeightAndWidth: internalResolutionHeightAndWidth
        };
    };
    BodyPix.prototype.segmentPersonParts = function (input, config) {
        if (config === void 0) { config = exports.PERSON_INFERENCE_CONFIG; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, partSegmentation, heatmapScores, offsets, displacementFwd, displacementBwd, padding, internalResolutionHeightAndWidth, _b, height, width, data, _c, scoresBuf, offsetsBuf, displacementsFwdBuf, displacementsBwdBuf, poses;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        config = __assign({}, exports.PERSON_INFERENCE_CONFIG, config);
                        validatePersonInferenceConfig(config);
                        _a = this.segmentPersonPartsActivation(input, config.internalResolution, config.segmentationThreshold), partSegmentation = _a.partSegmentation, heatmapScores = _a.heatmapScores, offsets = _a.offsets, displacementFwd = _a.displacementFwd, displacementBwd = _a.displacementBwd, padding = _a.padding, internalResolutionHeightAndWidth = _a.internalResolutionHeightAndWidth;
                        _b = partSegmentation.shape, height = _b[0], width = _b[1];
                        return [4, partSegmentation.data()];
                    case 1:
                        data = _d.sent();
                        partSegmentation.dispose();
                        return [4, util_1.toTensorBuffers3D([heatmapScores, offsets, displacementFwd, displacementBwd])];
                    case 2:
                        _c = _d.sent(), scoresBuf = _c[0], offsetsBuf = _c[1], displacementsFwdBuf = _c[2], displacementsBwdBuf = _c[3];
                        poses = decode_multiple_poses_1.decodeMultiplePoses(scoresBuf, offsetsBuf, displacementsFwdBuf, displacementsBwdBuf, this.baseModel.outputStride, config.maxDetections, config.scoreThreshold, config.nmsRadius);
                        poses = util_1.scaleAndFlipPoses(poses, [height, width], internalResolutionHeightAndWidth, padding, FLIP_POSES_AFTER_SCALING);
                        heatmapScores.dispose();
                        offsets.dispose();
                        displacementFwd.dispose();
                        displacementBwd.dispose();
                        return [2, { height: height, width: width, data: data, allPoses: poses }];
                }
            });
        });
    };
    BodyPix.prototype.segmentMultiPersonParts = function (input, config) {
        if (config === void 0) { config = exports.MULTI_PERSON_INSTANCE_INFERENCE_CONFIG; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, height, width, internalResolutionHeightAndWidth, _b, resized, padding, _c, segmentation, longOffsets, heatmapScoresRaw, offsetsRaw, displacementFwdRaw, displacementBwdRaw, partSegmentation, _d, scoresBuf, offsetsBuf, displacementsFwdBuf, displacementsBwdBuf, poses, instanceMasks;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        config = __assign({}, exports.MULTI_PERSON_INSTANCE_INFERENCE_CONFIG, config);
                        validateMultiPersonInstanceInferenceConfig(config);
                        _a = util_1.getInputSize(input), height = _a[0], width = _a[1];
                        internalResolutionHeightAndWidth = util_1.toInputResolutionHeightAndWidth(config.internalResolution, this.baseModel.outputStride, [height, width]);
                        _b = util_1.padAndResizeTo(input, internalResolutionHeightAndWidth), resized = _b.resized, padding = _b.padding;
                        _c = tf.tidy(function () {
                            var _a = _this.predictForMultiPersonInstanceSegmentationAndPart(resized), segmentLogits = _a.segmentLogits, longOffsets = _a.longOffsets, heatmapScores = _a.heatmapScores, offsets = _a.offsets, displacementFwd = _a.displacementFwd, displacementBwd = _a.displacementBwd, partHeatmaps = _a.partHeatmaps;
                            var scaledSegmentScores = util_1.scaleAndCropToInputTensorShape(segmentLogits, [height, width], internalResolutionHeightAndWidth, [[padding.top, padding.bottom], [padding.left, padding.right]], APPLY_SIGMOID_ACTIVATION);
                            var scaledPartSegmentationScores = util_1.scaleAndCropToInputTensorShape(partHeatmaps, [height, width], internalResolutionHeightAndWidth, [[padding.top, padding.bottom], [padding.left, padding.right]], APPLY_SIGMOID_ACTIVATION);
                            var scaledLongOffsets = longOffsets;
                            var segmentation = decode_part_map_1.toMaskTensor(scaledSegmentScores.squeeze(), config.segmentationThreshold);
                            var partSegmentation = decode_part_map_1.decodeOnlyPartSegmentation(scaledPartSegmentationScores);
                            return {
                                segmentation: segmentation,
                                longOffsets: scaledLongOffsets,
                                heatmapScoresRaw: heatmapScores,
                                offsetsRaw: offsets,
                                displacementFwdRaw: displacementFwd,
                                displacementBwdRaw: displacementBwd,
                                partSegmentation: partSegmentation
                            };
                        }), segmentation = _c.segmentation, longOffsets = _c.longOffsets, heatmapScoresRaw = _c.heatmapScoresRaw, offsetsRaw = _c.offsetsRaw, displacementFwdRaw = _c.displacementFwdRaw, displacementBwdRaw = _c.displacementBwdRaw, partSegmentation = _c.partSegmentation;
                        return [4, util_1.toTensorBuffers3D([
                                heatmapScoresRaw, offsetsRaw, displacementFwdRaw, displacementBwdRaw
                            ])];
                    case 1:
                        _d = _e.sent(), scoresBuf = _d[0], offsetsBuf = _d[1], displacementsFwdBuf = _d[2], displacementsBwdBuf = _d[3];
                        poses = decode_multiple_poses_1.decodeMultiplePoses(scoresBuf, offsetsBuf, displacementsFwdBuf, displacementsBwdBuf, this.baseModel.outputStride, config.maxDetections, config.scoreThreshold, config.nmsRadius);
                        poses = util_1.scaleAndFlipPoses(poses, [height, width], internalResolutionHeightAndWidth, padding, FLIP_POSES_AFTER_SCALING);
                        return [4, decode_instance_masks_1.decodePersonInstancePartMasks(segmentation, longOffsets, partSegmentation, poses, height, width, this.baseModel.outputStride, internalResolutionHeightAndWidth, padding, config.scoreThreshold, config.refineSteps, config.minKeypointScore, config.maxDetections)];
                    case 2:
                        instanceMasks = _e.sent();
                        resized.dispose();
                        segmentation.dispose();
                        longOffsets.dispose();
                        heatmapScoresRaw.dispose();
                        offsetsRaw.dispose();
                        displacementFwdRaw.dispose();
                        displacementBwdRaw.dispose();
                        partSegmentation.dispose();
                        return [2, instanceMasks];
                }
            });
        });
    };
    BodyPix.prototype.dispose = function () {
        this.baseModel.dispose();
    };
    return BodyPix;
}());
exports.BodyPix = BodyPix;
function loadMobileNet(config) {
    return __awaiter(this, void 0, void 0, function () {
        var outputStride, quantBytes, multiplier, url, graphModel, mobilenet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    outputStride = config.outputStride;
                    quantBytes = config.quantBytes;
                    multiplier = config.multiplier;
                    if (tf == null) {
                        throw new Error("Cannot find TensorFlow.js. If you are using a <script> tag, please " +
                            "also include @tensorflow/tfjs on the page before using this\n        model.");
                    }
                    url = saved_models_1.mobileNetSavedModel(outputStride, multiplier, quantBytes);
                    return [4, tfconv.loadGraphModel(config.modelUrl || url)];
                case 1:
                    graphModel = _a.sent();
                    mobilenet = new mobilenet_1.MobileNet(graphModel, outputStride);
                    return [2, new BodyPix(mobilenet)];
            }
        });
    });
}
function loadResNet(config) {
    return __awaiter(this, void 0, void 0, function () {
        var outputStride, quantBytes, url, graphModel, resnet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    outputStride = config.outputStride;
                    quantBytes = config.quantBytes;
                    if (tf == null) {
                        throw new Error("Cannot find TensorFlow.js. If you are using a <script> tag, please " +
                            "also include @tensorflow/tfjs on the page before using this\n        model.");
                    }
                    url = saved_models_1.resNet50SavedModel(outputStride, quantBytes);
                    return [4, tfconv.loadGraphModel(config.modelUrl || url)];
                case 1:
                    graphModel = _a.sent();
                    resnet = new resnet_1.ResNet(graphModel, outputStride);
                    return [2, new BodyPix(resnet)];
            }
        });
    });
}
function load(config) {
    if (config === void 0) { config = MOBILENET_V1_CONFIG; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            config = validateModelConfig(config);
            if (config.architecture === 'ResNet50') {
                return [2, loadResNet(config)];
            }
            else if (config.architecture === 'MobileNetV1') {
                return [2, loadMobileNet(config)];
            }
            else {
                return [2, null];
            }
            return [2];
        });
    });
}
exports.load = load;
//# sourceMappingURL=body_pix_model.js.map