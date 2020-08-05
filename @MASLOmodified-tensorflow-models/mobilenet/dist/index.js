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
Object.defineProperty(exports, "__esModule", { value: true });
var tfconv = require("@tensorflow/tfjs-converter");
var tf = require("@tensorflow/tfjs-core");
var imagenet_classes_1 = require("./imagenet_classes");
var IMAGE_SIZE = 224;
var EMBEDDING_NODES = {
    '1.00': 'module_apply_default/MobilenetV1/Logits/global_pool',
    '2.00': 'module_apply_default/MobilenetV2/Logits/AvgPool'
};
var MODEL_INFO = {
    '1.00': {
        '0.25': {
            url: 'https://tfhub.dev/google/imagenet/mobilenet_v1_025_224/classification/1',
            inputRange: [0, 1]
        },
        '0.50': {
            url: 'https://tfhub.dev/google/imagenet/mobilenet_v1_050_224/classification/1',
            inputRange: [0, 1]
        },
        '0.75': {
            url: 'https://tfhub.dev/google/imagenet/mobilenet_v1_075_224/classification/1',
            inputRange: [0, 1]
        },
        '1.00': {
            url: 'https://tfhub.dev/google/imagenet/mobilenet_v1_100_224/classification/1',
            inputRange: [0, 1]
        }
    },
    '2.00': {
        '0.50': {
            url: 'https://tfhub.dev/google/imagenet/mobilenet_v2_050_224/classification/2',
            inputRange: [0, 1]
        },
        '0.75': {
            url: 'https://tfhub.dev/google/imagenet/mobilenet_v2_075_224/classification/2',
            inputRange: [0, 1]
        },
        '1.00': {
            url: 'https://tfhub.dev/google/imagenet/mobilenet_v2_100_224/classification/2',
            inputRange: [0, 1]
        }
    }
};
function load(modelConfig) {
    if (modelConfig === void 0) { modelConfig = {
        version: 1,
        alpha: 1.0
    }; }
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, versionStr, alphaStr, inputMin, inputMax, mobilenet;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (tf == null) {
                        throw new Error("Cannot find TensorFlow.js. If you are using a <script> tag, please " +
                            "also include @tensorflow/tfjs on the page before using this model.");
                    }
                    versionStr = modelConfig.version.toFixed(2);
                    alphaStr = modelConfig.alpha ? modelConfig.alpha.toFixed(2) : '';
                    inputMin = -1;
                    inputMax = 1;
                    if (modelConfig.modelUrl == null) {
                        if (!(versionStr in MODEL_INFO)) {
                            throw new Error("Invalid version of MobileNet. Valid versions are: " +
                                ("" + Object.keys(MODEL_INFO)));
                        }
                        if (!(alphaStr in MODEL_INFO[versionStr])) {
                            throw new Error("MobileNet constructed with invalid alpha " + modelConfig.alpha + ". Valid " +
                                "multipliers for this version are: " +
                                (Object.keys(MODEL_INFO[versionStr]) + "."));
                        }
                        _a = MODEL_INFO[versionStr][alphaStr].inputRange, inputMin = _a[0], inputMax = _a[1];
                    }
                    if (modelConfig.inputRange != null) {
                        _b = modelConfig.inputRange, inputMin = _b[0], inputMax = _b[1];
                    }
                    mobilenet = new MobileNetImpl(versionStr, alphaStr, modelConfig.modelUrl, inputMin, inputMax);
                    return [4, mobilenet.load()];
                case 1:
                    _c.sent();
                    return [2, mobilenet];
            }
        });
    });
}
exports.load = load;
var MobileNetImpl = (function () {
    function MobileNetImpl(version, alpha, modelUrl, inputMin, inputMax) {
        if (inputMin === void 0) { inputMin = -1; }
        if (inputMax === void 0) { inputMax = 1; }
        this.version = version;
        this.alpha = alpha;
        this.modelUrl = modelUrl;
        this.inputMin = inputMin;
        this.inputMax = inputMax;
        this.normalizationConstant = (inputMax - inputMin) / 255.0;
    }
    MobileNetImpl.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, url, _b, result;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.modelUrl) return [3, 2];
                        _a = this;
                        return [4, tfconv.loadGraphModel(this.modelUrl)];
                    case 1:
                        _a.model = _c.sent();
                        return [3, 4];
                    case 2:
                        url = MODEL_INFO[this.version][this.alpha].url;
                        _b = this;
                        return [4, tfconv.loadGraphModel(url, { fromTFHub: true })];
                    case 3:
                        _b.model = _c.sent();
                        _c.label = 4;
                    case 4:
                        result = tf.tidy(function () { return _this.model.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])); });
                        return [4, result.data()];
                    case 5:
                        _c.sent();
                        result.dispose();
                        return [2];
                }
            });
        });
    };
    MobileNetImpl.prototype.infer = function (img, embedding) {
        var _this = this;
        if (embedding === void 0) { embedding = false; }
        return tf.tidy(function () {
            if (!(img instanceof tf.Tensor)) {
                img = tf.browser.fromPixels(img);
            }
            var normalized = img.toFloat().mul(_this.normalizationConstant).add(_this.inputMin);
            var resized = normalized;
            if (img.shape[0] !== IMAGE_SIZE || img.shape[1] !== IMAGE_SIZE) {
                var alignCorners = true;
                resized = tf.image.resizeBilinear(normalized, [IMAGE_SIZE, IMAGE_SIZE], alignCorners);
            }
            var batched = resized.reshape([-1, IMAGE_SIZE, IMAGE_SIZE, 3]);
            var result;
            if (embedding) {
                var embeddingName = EMBEDDING_NODES[_this.version];
                var internal = _this.model.execute(batched, embeddingName);
                result = internal.squeeze([1, 2]);
            }
            else {
                var logits1001 = _this.model.predict(batched);
                result = logits1001.slice([0, 1], [-1, 1000]);
            }
            return result;
        });
    };
    MobileNetImpl.prototype.classify = function (img, topk) {
        if (topk === void 0) { topk = 3; }
        return __awaiter(this, void 0, void 0, function () {
            var logits, classes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logits = this.infer(img);
                        return [4, getTopKClasses(logits, topk)];
                    case 1:
                        classes = _a.sent();
                        logits.dispose();
                        return [2, classes];
                }
            });
        });
    };
    return MobileNetImpl;
}());
function getTopKClasses(logits, topK) {
    return __awaiter(this, void 0, void 0, function () {
        var softmax, values, valuesAndIndices, i, topkValues, topkIndices, i, topClassesAndProbs, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    softmax = logits.softmax();
                    return [4, softmax.data()];
                case 1:
                    values = _a.sent();
                    softmax.dispose();
                    valuesAndIndices = [];
                    for (i = 0; i < values.length; i++) {
                        valuesAndIndices.push({ value: values[i], index: i });
                    }
                    valuesAndIndices.sort(function (a, b) {
                        return b.value - a.value;
                    });
                    topkValues = new Float32Array(topK);
                    topkIndices = new Int32Array(topK);
                    for (i = 0; i < topK; i++) {
                        topkValues[i] = valuesAndIndices[i].value;
                        topkIndices[i] = valuesAndIndices[i].index;
                    }
                    topClassesAndProbs = [];
                    for (i = 0; i < topkIndices.length; i++) {
                        topClassesAndProbs.push({
                            className: imagenet_classes_1.IMAGENET_CLASSES[topkIndices[i]],
                            probability: topkValues[i]
                        });
                    }
                    return [2, topClassesAndProbs];
            }
        });
    });
}
//# sourceMappingURL=index.js.map