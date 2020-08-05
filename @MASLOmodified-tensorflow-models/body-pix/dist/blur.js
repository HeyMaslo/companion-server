"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function cpuBlur(canvas, image, blur) {
    var ctx = canvas.getContext('2d');
    var sum = 0;
    var delta = 5;
    var alphaLeft = 1 / (2 * Math.PI * delta * delta);
    var step = blur < 3 ? 1 : 2;
    for (var y = -blur; y <= blur; y += step) {
        for (var x = -blur; x <= blur; x += step) {
            var weight = alphaLeft * Math.exp(-(x * x + y * y) / (2 * delta * delta));
            sum += weight;
        }
    }
    for (var y = -blur; y <= blur; y += step) {
        for (var x = -blur; x <= blur; x += step) {
            ctx.globalAlpha = alphaLeft *
                Math.exp(-(x * x + y * y) / (2 * delta * delta)) / sum * blur;
            ctx.drawImage(image, x, y);
        }
    }
    ctx.globalAlpha = 1;
}
exports.cpuBlur = cpuBlur;
//# sourceMappingURL=blur.js.map