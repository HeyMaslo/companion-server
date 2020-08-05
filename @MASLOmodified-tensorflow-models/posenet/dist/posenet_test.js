"use strict";
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tfconv = require("@tensorflow/tfjs-converter");
var tf = require("@tensorflow/tfjs-core");
var jasmine_util_1 = require("@tensorflow/tfjs-core/dist/jasmine_util");
var mobilenet = require("./mobilenet");
var posenetModel = require("./posenet_model");
var resnet = require("./resnet");
var util_1 = require("./util");
jasmine_util_1.describeWithFlags('PoseNet', jasmine_util_1.NODE_ENVS, function () {
    var mobileNet;
    var resNet;
    var inputResolution = 513;
    var outputStride = 32;
    var multiplier = 1.0;
    var quantBytes = 4;
    var outputResolution = (inputResolution - 1) / outputStride + 1;
    var numKeypoints = 17;
    beforeAll(function () { return __awaiter(_this, void 0, void 0, function () {
        var resNetConfig, mobileNetConfig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    resNetConfig = { architecture: 'ResNet50', outputStride: outputStride, inputResolution: inputResolution, quantBytes: quantBytes };
                    mobileNetConfig = {
                        architecture: 'MobileNetV1',
                        outputStride: outputStride,
                        inputResolution: inputResolution,
                        multiplier: multiplier,
                        quantBytes: quantBytes
                    };
                    spyOn(tfconv, 'loadGraphModel').and.callFake(function () {
                        return null;
                    });
                    spyOn(resnet, 'ResNet').and.callFake(function () {
                        return {
                            outputStride: outputStride,
                            predict: function (input) {
                                return {
                                    inputResolution: inputResolution,
                                    heatmapScores: tf.zeros([outputResolution, outputResolution, numKeypoints]),
                                    offsets: tf.zeros([outputResolution, outputResolution, 2 * numKeypoints]),
                                    displacementFwd: tf.zeros([outputResolution, outputResolution, 2 * (numKeypoints - 1)]),
                                    displacementBwd: tf.zeros([outputResolution, outputResolution, 2 * (numKeypoints - 1)])
                                };
                            },
                            dipose: function () { }
                        };
                    });
                    spyOn(mobilenet, 'MobileNet').and.callFake(function () {
                        return {
                            outputStride: outputStride,
                            predict: function (input) {
                                return {
                                    inputResolution: inputResolution,
                                    heatmapScores: tf.zeros([outputResolution, outputResolution, numKeypoints]),
                                    offsets: tf.zeros([outputResolution, outputResolution, 2 * numKeypoints]),
                                    displacementFwd: tf.zeros([outputResolution, outputResolution, 2 * (numKeypoints - 1)]),
                                    displacementBwd: tf.zeros([outputResolution, outputResolution, 2 * (numKeypoints - 1)])
                                };
                            },
                            dipose: function () { }
                        };
                    });
                    return [4, posenetModel.load(resNetConfig)];
                case 1:
                    resNet = _a.sent();
                    return [4, posenetModel.load(mobileNetConfig)];
                case 2:
                    mobileNet = _a.sent();
                    return [2];
            }
        });
    }); });
    it('estimateSinglePose does not leak memory', function () { return __awaiter(_this, void 0, void 0, function () {
        var input, beforeTensors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    input = tf.zeros([inputResolution, inputResolution, 3]);
                    beforeTensors = tf.memory().numTensors;
                    return [4, resNet.estimateSinglePose(input, { flipHorizontal: false })];
                case 1:
                    _a.sent();
                    return [4, mobileNet.estimateSinglePose(input, { flipHorizontal: false })];
                case 2:
                    _a.sent();
                    expect(tf.memory().numTensors).toEqual(beforeTensors);
                    return [2];
            }
        });
    }); });
    it('estimateMultiplePoses does not leak memory', function () { return __awaiter(_this, void 0, void 0, function () {
        var input, beforeTensors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    input = tf.zeros([inputResolution, inputResolution, 3]);
                    beforeTensors = tf.memory().numTensors;
                    return [4, resNet.estimateMultiplePoses(input, {
                            flipHorizontal: false,
                            maxDetections: 5,
                            scoreThreshold: 0.5,
                            nmsRadius: 20
                        })];
                case 1:
                    _a.sent();
                    return [4, mobileNet.estimateMultiplePoses(input, {
                            flipHorizontal: false,
                            maxDetections: 5,
                            scoreThreshold: 0.5,
                            nmsRadius: 20
                        })];
                case 2:
                    _a.sent();
                    expect(tf.memory().numTensors).toEqual(beforeTensors);
                    return [2];
            }
        });
    }); });
    it('mobilenet load with resolution numbers passes through ', function () { return __awaiter(_this, void 0, void 0, function () {
        var inputResolution, validInputResolution, expectedResolution, model;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inputResolution = 500;
                    validInputResolution = util_1.toValidInputResolution(inputResolution, outputStride);
                    expectedResolution = [validInputResolution, validInputResolution];
                    return [4, posenetModel.load({ architecture: 'MobileNetV1', outputStride: outputStride, inputResolution: inputResolution })];
                case 1:
                    model = _a.sent();
                    expect(model.inputResolution).toEqual(expectedResolution);
                    return [2];
            }
        });
    }); });
    it('resnet load with resolution numbers passes through', function () { return __awaiter(_this, void 0, void 0, function () {
        var inputResolution, validInputResolution, expectedResolution, model;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inputResolution = 350;
                    validInputResolution = util_1.toValidInputResolution(inputResolution, outputStride);
                    expectedResolution = [validInputResolution, validInputResolution];
                    return [4, posenetModel.load({ architecture: 'ResNet50', outputStride: outputStride, inputResolution: inputResolution })];
                case 1:
                    model = _a.sent();
                    expect(model.inputResolution).toEqual(expectedResolution);
                    return [2];
            }
        });
    }); });
    it('mobilenet load with resolution object passes through', function () { return __awaiter(_this, void 0, void 0, function () {
        var inputResolution, expectedResolution, model;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inputResolution = { width: 600, height: 400 };
                    expectedResolution = [
                        util_1.toValidInputResolution(inputResolution.height, outputStride),
                        util_1.toValidInputResolution(inputResolution.width, outputStride)
                    ];
                    return [4, posenetModel.load({ architecture: 'MobileNetV1', outputStride: outputStride, inputResolution: inputResolution })];
                case 1:
                    model = _a.sent();
                    expect(model.inputResolution).toEqual(expectedResolution);
                    return [2];
            }
        });
    }); });
    it('resnet load with resolution object passes through', function () { return __awaiter(_this, void 0, void 0, function () {
        var inputResolution, expectedResolution, model;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    inputResolution = { width: 700, height: 500 };
                    expectedResolution = [
                        util_1.toValidInputResolution(inputResolution.height, outputStride),
                        util_1.toValidInputResolution(inputResolution.width, outputStride)
                    ];
                    return [4, posenetModel.load({ architecture: 'ResNet50', outputStride: outputStride, inputResolution: inputResolution })];
                case 1:
                    model = _a.sent();
                    expect(model.inputResolution).toEqual(expectedResolution);
                    return [2];
            }
        });
    }); });
});
//# sourceMappingURL=posenet_test.js.map