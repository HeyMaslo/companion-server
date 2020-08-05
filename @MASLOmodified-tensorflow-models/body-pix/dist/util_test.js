"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jasmine_util_1 = require("@tensorflow/tfjs-core/dist/jasmine_util");
var util_1 = require("./util");
jasmine_util_1.describeWithFlags('util.toValidInputResolution', jasmine_util_1.ALL_ENVS, function () {
    it('returns an odd value', function () {
        expect(util_1.toValidInputResolution(1920, 8) % 2).toEqual(1);
        expect(util_1.toValidInputResolution(1280, 16) % 2).toEqual(1);
        expect(util_1.toValidInputResolution(719, 16) % 2).toEqual(1);
        expect(util_1.toValidInputResolution(545, 16) % 2).toEqual(1);
        expect(util_1.toValidInputResolution(225, 8) % 2).toEqual(1);
        expect(util_1.toValidInputResolution(240, 8) % 2).toEqual(1);
    });
    it('returns the original value when already a valid resolution', function () {
        var outputStride = 16;
        var validResolution = util_1.toValidInputResolution(1000, outputStride);
        var resolution = util_1.toValidInputResolution(validResolution, outputStride);
        expect(resolution).toEqual(validResolution);
    });
    it('succeeds when 1-resolution is divisible by the output stride', function () {
        var outputStride = 8;
        var inputResolution = 562;
        var resolution = util_1.toValidInputResolution(inputResolution, outputStride);
        expect((resolution - 1) % outputStride).toEqual(0);
    });
});
jasmine_util_1.describeWithFlags('util.toInputResolutionHeightAndWidth', jasmine_util_1.ALL_ENVS, function () {
    function getExpectedResolution(inputShape, outputStride, expectedScalePercentage) {
        return inputShape.map(function (size) { return util_1.toValidInputResolution(size * expectedScalePercentage, outputStride); });
    }
    it("returns the full image size as a valid input resolution when " +
        "internalResolution is 'full'", function () {
        var inputShape = [1920, 1080];
        var outputStride = 16;
        var internalResolution = 'full';
        var expectedScalePercentage = 1.0;
        var expectedResult = getExpectedResolution(inputShape, outputStride, expectedScalePercentage);
        var result = util_1.toInputResolutionHeightAndWidth(internalResolution, outputStride, inputShape);
        expect(result).toEqual(expectedResult);
    });
    it("returns 75% of the image size as a valid input resolution when " +
        "internalResolution is 'high'", function () {
        var inputShape = [400, 900];
        var outputStride = 16;
        var internalResolution = 'high';
        var expectedScalePercentage = 0.75;
        var expectedResult = getExpectedResolution(inputShape, outputStride, expectedScalePercentage);
        var result = util_1.toInputResolutionHeightAndWidth(internalResolution, outputStride, inputShape);
        expect(result).toEqual(expectedResult);
    });
    it("returns 50% of the image size as a valid input resolution when " +
        "internalResolution is 'medium'", function () {
        var inputShape = [694, 309];
        var outputStride = 32;
        var internalResolution = 'medium';
        var expectedScalePercentage = 0.50;
        var expectedResult = getExpectedResolution(inputShape, outputStride, expectedScalePercentage);
        var result = util_1.toInputResolutionHeightAndWidth(internalResolution, outputStride, inputShape);
        expect(result).toEqual(expectedResult);
    });
    it("returns 25% of the image size as a valid input resolution when " +
        "internalResolution is 'low'", function () {
        var inputShape = [930, 1001];
        var outputStride = 8;
        var internalResolution = 'low';
        var expectedScalePercentage = 0.25;
        var expectedResult = getExpectedResolution(inputShape, outputStride, expectedScalePercentage);
        var result = util_1.toInputResolutionHeightAndWidth(internalResolution, outputStride, inputShape);
        expect(result).toEqual(expectedResult);
    });
    it("returns the {internalResolution}% of the image size as a valid input " +
        "resolution when internalResolution is a number", function () {
        var inputShape = [1450, 789];
        var outputStride = 16;
        var internalResolution = 0.675;
        var expectedResult = getExpectedResolution(inputShape, outputStride, internalResolution);
        var result = util_1.toInputResolutionHeightAndWidth(internalResolution, outputStride, inputShape);
        expect(result).toEqual(expectedResult);
    });
    it('does not raise an error when internalResolution is 2', function () {
        expect(function () {
            util_1.toInputResolutionHeightAndWidth(2.00, 16, [640, 480]);
        }).not.toThrow();
    });
    it('raises an error when internalResolution is larger than 2', function () {
        expect(function () {
            util_1.toInputResolutionHeightAndWidth(2.01, 16, [640, 480]);
        }).toThrow();
    });
    it('does not raise an error when internalResolution is 0.1', function () {
        expect(function () {
            util_1.toInputResolutionHeightAndWidth(0.1, 16, [640, 480]);
        }).not.toThrow();
    });
    it('raises an error when internalResolution is less than 0.1', function () {
        expect(function () {
            util_1.toInputResolutionHeightAndWidth(0.09, 16, [640, 480]);
        }).toThrow();
    });
});
//# sourceMappingURL=util_test.js.map