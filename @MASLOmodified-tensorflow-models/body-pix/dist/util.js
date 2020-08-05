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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var tf = require("@tensorflow/tfjs-core");
function getSizeFromImageLikeElement(input) {
    if (input.offsetHeight !== 0 && input.offsetWidth !== 0) {
        return [input.offsetHeight, input.offsetWidth];
    }
    else if (input.height != null && input.width != null) {
        return [input.height, input.width];
    }
    else {
        throw new Error("HTMLImageElement must have height and width attributes set.");
    }
}
function getSizeFromVideoElement(input) {
    if (input.height != null && input.width != null) {
        return [input.height, input.width];
    }
    else {
        return [input.videoHeight, input.videoWidth];
    }
}
function getInputSize(input) {
    if ((typeof (HTMLCanvasElement) !== 'undefined' &&
        input instanceof HTMLCanvasElement) ||
        (typeof (HTMLImageElement) !== 'undefined' &&
            input instanceof HTMLImageElement)) {
        return getSizeFromImageLikeElement(input);
    }
    else if (typeof (ImageData) !== 'undefined' && input instanceof ImageData) {
        return [input.height, input.width];
    }
    else if (typeof (HTMLVideoElement) !== 'undefined' &&
        input instanceof HTMLVideoElement) {
        return getSizeFromVideoElement(input);
    }
    else if (input instanceof tf.Tensor) {
        return [input.shape[0], input.shape[1]];
    }
    else {
        throw new Error("error: Unknown input type: " + input + ".");
    }
}
exports.getInputSize = getInputSize;
function isValidInputResolution(resolution, outputStride) {
    return (resolution - 1) % outputStride === 0;
}
function toValidInputResolution(inputResolution, outputStride) {
    if (isValidInputResolution(inputResolution, outputStride)) {
        return inputResolution;
    }
    return Math.floor(inputResolution / outputStride) * outputStride + 1;
}
exports.toValidInputResolution = toValidInputResolution;
var INTERNAL_RESOLUTION_STRING_OPTIONS = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    full: 'full'
};
var INTERNAL_RESOLUTION_PERCENTAGES = (_a = {},
    _a[INTERNAL_RESOLUTION_STRING_OPTIONS.low] = 0.25,
    _a[INTERNAL_RESOLUTION_STRING_OPTIONS.medium] = 0.5,
    _a[INTERNAL_RESOLUTION_STRING_OPTIONS.high] = 0.75,
    _a[INTERNAL_RESOLUTION_STRING_OPTIONS.full] = 1.0,
    _a);
var MIN_INTERNAL_RESOLUTION = 0.1;
var MAX_INTERNAL_RESOLUTION = 2.0;
function toInternalResolutionPercentage(internalResolution) {
    if (typeof internalResolution === 'string') {
        var result = INTERNAL_RESOLUTION_PERCENTAGES[internalResolution];
        tf.util.assert(typeof result === 'number', function () { return "string value of inputResolution must be one of " + Object.values(INTERNAL_RESOLUTION_STRING_OPTIONS)
            .join(',') + " but was " + internalResolution + "."; });
        return result;
    }
    else {
        tf.util.assert(typeof internalResolution === 'number' &&
            internalResolution <= MAX_INTERNAL_RESOLUTION &&
            internalResolution >= MIN_INTERNAL_RESOLUTION, function () {
            return "inputResolution must be a string or number between " + MIN_INTERNAL_RESOLUTION + " and " + MAX_INTERNAL_RESOLUTION + ", but " +
                ("was " + internalResolution);
        });
        return internalResolution;
    }
}
function toInputResolutionHeightAndWidth(internalResolution, outputStride, _a) {
    var inputHeight = _a[0], inputWidth = _a[1];
    var internalResolutionPercentage = toInternalResolutionPercentage(internalResolution);
    return [
        toValidInputResolution(inputHeight * internalResolutionPercentage, outputStride),
        toValidInputResolution(inputWidth * internalResolutionPercentage, outputStride)
    ];
}
exports.toInputResolutionHeightAndWidth = toInputResolutionHeightAndWidth;
function toInputTensor(input) {
    return input instanceof tf.Tensor ? input : tf.browser.fromPixels(input);
}
exports.toInputTensor = toInputTensor;
function resizeAndPadTo(imageTensor, _a, flipHorizontal) {
    var targetH = _a[0], targetW = _a[1];
    if (flipHorizontal === void 0) { flipHorizontal = false; }
    var _b = imageTensor.shape, height = _b[0], width = _b[1];
    var targetAspect = targetW / targetH;
    var aspect = width / height;
    var resizeW;
    var resizeH;
    var padL;
    var padR;
    var padT;
    var padB;
    if (aspect > targetAspect) {
        resizeW = targetW;
        resizeH = Math.ceil(resizeW / aspect);
        var padHeight = targetH - resizeH;
        padL = 0;
        padR = 0;
        padT = Math.floor(padHeight / 2);
        padB = targetH - (resizeH + padT);
    }
    else {
        resizeH = targetH;
        resizeW = Math.ceil(targetH * aspect);
        var padWidth = targetW - resizeW;
        padL = Math.floor(padWidth / 2);
        padR = targetW - (resizeW + padL);
        padT = 0;
        padB = 0;
    }
    var resizedAndPadded = tf.tidy(function () {
        var resized;
        if (flipHorizontal) {
            resized = imageTensor.reverse(1).resizeBilinear([resizeH, resizeW]);
        }
        else {
            resized = imageTensor.resizeBilinear([resizeH, resizeW]);
        }
        var padded = tf.pad3d(resized, [[padT, padB], [padL, padR], [0, 0]]);
        return padded;
    });
    return { resizedAndPadded: resizedAndPadded, paddedBy: [[padT, padB], [padL, padR]] };
}
exports.resizeAndPadTo = resizeAndPadTo;
function scaleAndCropToInputTensorShape(tensor, _a, _b, _c, applySigmoidActivation) {
    var inputTensorHeight = _a[0], inputTensorWidth = _a[1];
    var resizedAndPaddedHeight = _b[0], resizedAndPaddedWidth = _b[1];
    var _d = _c[0], padT = _d[0], padB = _d[1], _e = _c[1], padL = _e[0], padR = _e[1];
    if (applySigmoidActivation === void 0) { applySigmoidActivation = false; }
    return tf.tidy(function () {
        var inResizedAndPadded = tensor.resizeBilinear([resizedAndPaddedHeight, resizedAndPaddedWidth], true);
        if (applySigmoidActivation) {
            inResizedAndPadded = inResizedAndPadded.sigmoid();
        }
        return removePaddingAndResizeBack(inResizedAndPadded, [inputTensorHeight, inputTensorWidth], [[padT, padB], [padL, padR]]);
    });
}
exports.scaleAndCropToInputTensorShape = scaleAndCropToInputTensorShape;
function removePaddingAndResizeBack(resizedAndPadded, _a, _b) {
    var originalHeight = _a[0], originalWidth = _a[1];
    var _c = _b[0], padT = _c[0], padB = _c[1], _d = _b[1], padL = _d[0], padR = _d[1];
    return tf.tidy(function () {
        return tf.image
            .cropAndResize(resizedAndPadded.expandDims(), [[
                padT / (originalHeight + padT + padB - 1.0),
                padL / (originalWidth + padL + padR - 1.0),
                (padT + originalHeight - 1.0) /
                    (originalHeight + padT + padB - 1.0),
                (padL + originalWidth - 1.0) / (originalWidth + padL + padR - 1.0)
            ]], [0], [originalHeight, originalWidth])
            .squeeze([0]);
    });
}
exports.removePaddingAndResizeBack = removePaddingAndResizeBack;
function resize2d(tensor, resolution, nearestNeighbor) {
    return tf.tidy(function () {
        return tensor.expandDims(2)
            .resizeBilinear(resolution, nearestNeighbor)
            .squeeze();
    });
}
exports.resize2d = resize2d;
function padAndResizeTo(input, _a) {
    var targetH = _a[0], targetW = _a[1];
    var _b = getInputSize(input), height = _b[0], width = _b[1];
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