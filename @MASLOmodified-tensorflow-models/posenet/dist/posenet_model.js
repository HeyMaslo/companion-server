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
var checkpoints_1 = require("./checkpoints");
var mobilenet_1 = require("./mobilenet");
var decode_multiple_poses_1 = require("./multi_pose/decode_multiple_poses");
var resnet_1 = require("./resnet");
var decode_single_pose_1 = require("./single_pose/decode_single_pose");
var util_1 = require("./util");
var MOBILENET_V1_CONFIG = {
    architecture: 'MobileNetV1',
    outputStride: 16,
    multiplier: 0.75,
    inputResolution: 257,
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
    if (config.inputResolution == null) {
        config.inputResolution = 257;
    }
    util_1.validateInputResolution(config.inputResolution);
    if (config.outputStride == null) {
        config.outputStride = 16;
    }
    if (VALID_STRIDE[config.architecture].indexOf(config.outputStride) < 0) {
        throw new Error("Invalid outputStride " + config.outputStride + ". " +
            ("Should be one of " + VALID_STRIDE[config.architecture] + " ") +
            ("for architecutre " + config.architecture + "."));
    }
    if (config.multiplier == null) {
        config.multiplier = 1.0;
    }
    if (VALID_MULTIPLIER[config.architecture].indexOf(config.multiplier) < 0) {
        throw new Error("Invalid multiplier " + config.multiplier + ". " +
            ("Should be one of " + VALID_MULTIPLIER[config.architecture] + " ") +
            ("for architecutre " + config.architecture + "."));
    }
    if (config.quantBytes == null) {
        config.quantBytes = 4;
    }
    if (VALID_QUANT_BYTES.indexOf(config.quantBytes) < 0) {
        throw new Error("Invalid quantBytes " + config.quantBytes + ". " +
            ("Should be one of " + VALID_QUANT_BYTES + " ") +
            ("for architecutre " + config.architecture + "."));
    }
    return config;
}
exports.SINGLE_PERSON_INFERENCE_CONFIG = {
    flipHorizontal: false
};
exports.MULTI_PERSON_INFERENCE_CONFIG = {
    flipHorizontal: false,
    maxDetections: 5,
    scoreThreshold: 0.5,
    nmsRadius: 20
};
function validateSinglePersonInferenceConfig(config) { }
function validateMultiPersonInputConfig(config) {
    var maxDetections = config.maxDetections, scoreThreshold = config.scoreThreshold, nmsRadius = config.nmsRadius;
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
var PoseNet = (function () {
    function PoseNet(net, inputResolution) {
        util_1.assertValidOutputStride(net.outputStride);
        util_1.assertValidResolution(inputResolution, net.outputStride);
        this.baseModel = net;
        this.inputResolution = inputResolution;
    }
    PoseNet.prototype.estimateMultiplePoses = function (input, config) {
        if (config === void 0) { config = exports.MULTI_PERSON_INFERENCE_CONFIG; }
        return __awaiter(this, void 0, void 0, function () {
            var configWithDefaults, outputStride, inputResolution, _a, height, width, _b, resized, padding, _c, heatmapScores, offsets, displacementFwd, displacementBwd, allTensorBuffers, scoresBuffer, offsetsBuffer, displacementsFwdBuffer, displacementsBwdBuffer, poses, resultPoses;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        configWithDefaults = __assign({}, exports.MULTI_PERSON_INFERENCE_CONFIG, config);
                        validateMultiPersonInputConfig(config);
                        outputStride = this.baseModel.outputStride;
                        inputResolution = this.inputResolution;
                        _a = util_1.getInputTensorDimensions(input), height = _a[0], width = _a[1];
                        _b = util_1.padAndResizeTo(input, inputResolution), resized = _b.resized, padding = _b.padding;
                        _c = this.baseModel.predict(resized), heatmapScores = _c.heatmapScores, offsets = _c.offsets, displacementFwd = _c.displacementFwd, displacementBwd = _c.displacementBwd;
                        return [4, util_1.toTensorBuffers3D([heatmapScores, offsets, displacementFwd, displacementBwd])];
                    case 1:
                        allTensorBuffers = _d.sent();
                        scoresBuffer = allTensorBuffers[0];
                        offsetsBuffer = allTensorBuffers[1];
                        displacementsFwdBuffer = allTensorBuffers[2];
                        displacementsBwdBuffer = allTensorBuffers[3];
                        return [4, decode_multiple_poses_1.decodeMultiplePoses(scoresBuffer, offsetsBuffer, displacementsFwdBuffer, displacementsBwdBuffer, outputStride, configWithDefaults.maxDetections, configWithDefaults.scoreThreshold, configWithDefaults.nmsRadius)];
                    case 2:
                        poses = _d.sent();
                        resultPoses = util_1.scaleAndFlipPoses(poses, [height, width], inputResolution, padding, configWithDefaults.flipHorizontal);
                        heatmapScores.dispose();
                        offsets.dispose();
                        displacementFwd.dispose();
                        displacementBwd.dispose();
                        resized.dispose();
                        return [2, resultPoses];
                }
            });
        });
    };
    PoseNet.prototype.estimateSinglePose = function (input, config) {
        if (config === void 0) { config = exports.SINGLE_PERSON_INFERENCE_CONFIG; }
        return __awaiter(this, void 0, void 0, function () {
            var configWithDefaults, outputStride, inputResolution, _a, height, width, _b, resized, padding, _c, heatmapScores, offsets, displacementFwd, displacementBwd, pose, poses, resultPoses;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        configWithDefaults = __assign({}, exports.SINGLE_PERSON_INFERENCE_CONFIG, config);
                        validateSinglePersonInferenceConfig(configWithDefaults);
                        outputStride = this.baseModel.outputStride;
                        inputResolution = this.inputResolution;
                        _a = util_1.getInputTensorDimensions(input), height = _a[0], width = _a[1];
                        _b = util_1.padAndResizeTo(input, inputResolution), resized = _b.resized, padding = _b.padding;
                        _c = this.baseModel.predict(resized), heatmapScores = _c.heatmapScores, offsets = _c.offsets, displacementFwd = _c.displacementFwd, displacementBwd = _c.displacementBwd;
                        return [4, decode_single_pose_1.decodeSinglePose(heatmapScores, offsets, outputStride)];
                    case 1:
                        pose = _d.sent();
                        poses = [pose];
                        resultPoses = util_1.scaleAndFlipPoses(poses, [height, width], inputResolution, padding, configWithDefaults.flipHorizontal);
                        heatmapScores.dispose();
                        offsets.dispose();
                        displacementFwd.dispose();
                        displacementBwd.dispose();
                        resized.dispose();
                        return [2, resultPoses[0]];
                }
            });
        });
    };
    PoseNet.prototype.estimatePoses = function (input, config) {
        return __awaiter(this, void 0, void 0, function () {
            var pose;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(config.decodingMethod === 'single-person')) return [3, 2];
                        return [4, this.estimateSinglePose(input, config)];
                    case 1:
                        pose = _a.sent();
                        return [2, [pose]];
                    case 2: return [2, this.estimateMultiplePoses(input, config)];
                }
            });
        });
    };
    PoseNet.prototype.dispose = function () {
        this.baseModel.dispose();
    };
    return PoseNet;
}());
exports.PoseNet = PoseNet;
function loadMobileNet(config) {
    return __awaiter(this, void 0, void 0, function () {
        var outputStride, quantBytes, multiplier, url, graphModel, mobilenet, validInputResolution;
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
                    url = checkpoints_1.mobileNetCheckpoint(outputStride, multiplier, quantBytes);
                    return [4, tfconv.loadGraphModel(config.modelUrl || url)];
                case 1:
                    graphModel = _a.sent();
                    mobilenet = new mobilenet_1.MobileNet(graphModel, outputStride);
                    validInputResolution = util_1.getValidInputResolutionDimensions(config.inputResolution, mobilenet.outputStride);
                    return [2, new PoseNet(mobilenet, validInputResolution)];
            }
        });
    });
}
function loadResNet(config) {
    return __awaiter(this, void 0, void 0, function () {
        var outputStride, quantBytes, url, graphModel, resnet, validInputResolution;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    outputStride = config.outputStride;
                    quantBytes = config.quantBytes;
                    if (tf == null) {
                        throw new Error("Cannot find TensorFlow.js. If you are using a <script> tag, please " +
                            "also include @tensorflow/tfjs on the page before using this\n        model.");
                    }
                    url = checkpoints_1.resNet50Checkpoint(outputStride, quantBytes);
                    return [4, tfconv.loadGraphModel(config.modelUrl || url)];
                case 1:
                    graphModel = _a.sent();
                    resnet = new resnet_1.ResNet(graphModel, outputStride);
                    validInputResolution = util_1.getValidInputResolutionDimensions(config.inputResolution, resnet.outputStride);
                    return [2, new PoseNet(resnet, validInputResolution)];
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
//# sourceMappingURL=posenet_model.js.map