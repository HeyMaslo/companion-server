"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jasmine_util_1 = require("@tensorflow/tfjs-core/dist/jasmine_util");
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
jasmine_util_1.setTestEnvs([
    {
        name: 'test-webgl',
        backendName: 'webgl',
        flags: {
            'WEBGL_VERSION': 2,
            'WEBGL_CPU_FORWARD': false,
            'WEBGL_SIZE_UPLOAD_UNIFORM': 0
        },
        isDataSync: true
    },
]);
//# sourceMappingURL=setup_test.js.map