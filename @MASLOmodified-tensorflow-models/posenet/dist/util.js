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
var tf = require("@tensorflow/tfjs-core");
var keypoints_1 = require("./keypoints");
function eitherPointDoesntMeetConfidence(a, b, minConfidence) {
    return (a < minConfidence || b < minConfidence);
}
function getAdjacentKeyPoints(keypoints, minConfidence) {
    return keypoints_1.connectedPartIndices.reduce(function (result, _a) {
        var leftJoint = _a[0], rightJoint = _a[1];
        if (eitherPointDoesntMeetConfidence(keypoints[leftJoint].score, keypoints[rightJoint].score, minConfidence)) {
            return result;
        }
        result.push([keypoints[leftJoint], keypoints[rightJoint]]);
        return result;
    }, []);
}
exports.getAdjacentKeyPoints = getAdjacentKeyPoints;
var NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY, POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
function getBoundingBox(keypoints) {
    return keypoints.reduce(function (_a, _b) {
        var maxX = _a.maxX, maxY = _a.maxY, minX = _a.minX, minY = _a.minY;
        var _c = _b.position, x = _c.x, y = _c.y;
        return {
            maxX: Math.max(maxX, x),
            maxY: Math.max(maxY, y),
            minX: Math.min(minX, x),
            minY: Math.min(minY, y)
        };
    }, {
        maxX: NEGATIVE_INFINITY,
        maxY: NEGATIVE_INFINITY,
        minX: POSITIVE_INFINITY,
        minY: POSITIVE_INFINITY
    });
}
exports.getBoundingBox = getBoundingBox;
function getBoundingBoxPoints(keypoints) {
    var _a = getBoundingBox(keypoints), minX = _a.minX, minY = _a.minY, maxX = _a.maxX, maxY = _a.maxY;
    return [
        { x: minX, y: minY }, { x: maxX, y: minY }, { x: maxX, y: maxY },
        { x: minX, y: maxY }
    ];
}
exports.getBoundingBoxPoints = getBoundingBoxPoints;
function toTensorBuffers3D(tensors) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2, Promise.all(tensors.map(function (tensor) { return tensor.buffer(); }))];
        });
    });
}
exports.toTensorBuffers3D = toTensorBuffers3D;
function scalePose(pose, scaleY, scaleX, offsetY, offsetX) {
    if (offsetY === void 0) { offsetY = 0; }
    if (offsetX === void 0) { offsetX = 0; }
    return {
        score: pose.score,
        keypoints: pose.keypoints.map(function (_a) {
            var score = _a.score, part = _a.part, position = _a.position;
            return ({
                score: score,
                part: part,
                position: {
                    x: position.x * scaleX + offsetX,
                    y: position.y * scaleY + offsetY
                }
            });
        })
    };
}
exports.scalePose = scalePose;
function scalePoses(poses, scaleY, scaleX, offsetY, offsetX) {
    if (offsetY === void 0) { offsetY = 0; }
    if (offsetX === void 0) { offsetX = 0; }
    if (scaleX === 1 && scaleY === 1 && offsetY === 0 && offsetX === 0) {
        return poses;
    }
    return poses.map(function (pose) { return scalePose(pose, scaleY, scaleX, offsetY, offsetX); });
}
exports.scalePoses = scalePoses;
function flipPoseHorizontal(pose, imageWidth) {
    return {
        score: pose.score,
        keypoints: pose.keypoints.map(function (_a) {
            var score = _a.score, part = _a.part, position = _a.position;
            return ({
                score: score,
                part: part,
                position: { x: imageWidth - 1 - position.x, y: position.y }
            });
        })
    };
}
exports.flipPoseHorizontal = flipPoseHorizontal;
function flipPosesHorizontal(poses, imageWidth) {
    if (imageWidth <= 0) {
        return poses;
    }
    return poses.map(function (pose) { return flipPoseHorizontal(pose, imageWidth); });
}
exports.flipPosesHorizontal = flipPosesHorizontal;
function toValidInputResolution(inputResolution, outputStride) {
    if (isValidInputResolution(inputResolution, outputStride)) {
        return inputResolution;
    }
    return Math.floor(inputResolution / outputStride) * outputStride + 1;
}
exports.toValidInputResolution = toValidInputResolution;
function validateInputResolution(inputResolution) {
    tf.util.assert(typeof inputResolution === 'number' ||
        typeof inputResolution === 'object', function () { return "Invalid inputResolution " + inputResolution + ". " +
        "Should be a number or an object with width and height"; });
    if (typeof inputResolution === 'object') {
        tf.util.assert(typeof inputResolution.width === 'number', function () { return "inputResolution.width has a value of " + inputResolution.width + " which is invalid; it must be a number"; });
        tf.util.assert(typeof inputResolution.height === 'number', function () { return "inputResolution.height has a value of " + inputResolution.height + " which is invalid; it must be a number"; });
    }
}
exports.validateInputResolution = validateInputResolution;
function getValidInputResolutionDimensions(inputResolution, outputStride) {
    validateInputResolution(inputResolution);
    if (typeof inputResolution === 'object') {
        return [
            toValidInputResolution(inputResolution.height, outputStride),
            toValidInputResolution(inputResolution.width, outputStride),
        ];
    }
    else {
        return [
            toValidInputResolution(inputResolution, outputStride),
            toValidInputResolution(inputResolution, outputStride),
        ];
    }
}
exports.getValidInputResolutionDimensions = getValidInputResolutionDimensions;
var VALID_OUTPUT_STRIDES = [8, 16, 32];
function assertValidOutputStride(outputStride) {
    tf.util.assert(typeof outputStride === 'number', function () { return 'outputStride is not a number'; });
    tf.util.assert(VALID_OUTPUT_STRIDES.indexOf(outputStride) >= 0, function () { return "outputStride of " + outputStride + " is invalid. " +
        "It must be either 8, 16, or 32"; });
}
exports.assertValidOutputStride = assertValidOutputStride;
function isValidInputResolution(resolution, outputStride) {
    return (resolution - 1) % outputStride === 0;
}
function assertValidResolution(resolution, outputStride) {
    tf.util.assert(typeof resolution[0] === 'number' && typeof resolution[1] === 'number', function () { return "both resolution values must be a number but had values " + resolution; });
    tf.util.assert(isValidInputResolution(resolution[0], outputStride), function () { return "height of " + resolution[0] + " is invalid for output stride " +
        (outputStride + "."); });
    tf.util.assert(isValidInputResolution(resolution[1], outputStride), function () { return "width of " + resolution[1] + " is invalid for output stride " +
        (outputStride + "."); });
}
exports.assertValidResolution = assertValidResolution;
function getInputTensorDimensions(input) {
    return input instanceof tf.Tensor ? [input.shape[0], input.shape[1]] :
        [input.height, input.width];
}
exports.getInputTensorDimensions = getInputTensorDimensions;
function toInputTensor(input) {
    return input instanceof tf.Tensor ? input : tf.browser.fromPixels(input);
}
exports.toInputTensor = toInputTensor;
function toResizedInputTensor(input, resizeHeight, resizeWidth, flipHorizontal) {
    return tf.tidy(function () {
        var imageTensor = toInputTensor(input);
        if (flipHorizontal) {
            return imageTensor.reverse(1).resizeBilinear([resizeHeight, resizeWidth]);
        }
        else {
            return imageTensor.resizeBilinear([resizeHeight, resizeWidth]);
        }
    });
}
exports.toResizedInputTensor = toResizedInputTensor;
function padAndResizeTo(input, _a) {
    var targetH = _a[0], targetW = _a[1];
    var _b = getInputTensorDimensions(input), height = _b[0], width = _b[1];
    var targetAspect = targetW / targetH;
    var aspect = width / height;
    var _c = [0, 0, 0, 0], padT = _c[0], padB = _c[1], padL = _c[2], padR = _c[3];
    if (aspect < targetAspect) {
        padT = 0;
        padB = 0;
        padL = Math.round(0.5 * (targetAspect * height - width));
        padR = Math.round(0.5 * (targetAspect * height - width));
    }
    else {
        padT = Math.round(0.5 * ((1.0 / targetAspect) * width - height));
        padB = Math.round(0.5 * ((1.0 / targetAspect) * width - height));
        padL = 0;
        padR = 0;
    }
    var resized = tf.tidy(function () {
        var imageTensor = toInputTensor(input);
        imageTensor = tf.pad3d(imageTensor, [[padT, padB], [padL, padR], [0, 0]]);
        return imageTensor.resizeBilinear([targetH, targetW]);
    });
    return { resized: resized, padding: { top: padT, left: padL, right: padR, bottom: padB } };
}
exports.padAndResizeTo = padAndResizeTo;
function scaleAndFlipPoses(poses, _a, _b, padding, flipHorizontal) {
    var height = _a[0], width = _a[1];
    var inputResolutionHeight = _b[0], inputResolutionWidth = _b[1];
    var scaleY = (height + padding.top + padding.bottom) / (inputResolutionHeight);
    var scaleX = (width + padding.left + padding.right) / (inputResolutionWidth);
    var scaledPoses = scalePoses(poses, scaleY, scaleX, -padding.top, -padding.left);
    if (flipHorizontal) {
        return flipPosesHorizontal(scaledPoses, width);
    }
    else {
        return scaledPoses;
    }
}
exports.scaleAndFlipPoses = scaleAndFlipPoses;
//# sourceMappingURL=util.js.map