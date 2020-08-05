/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as tfconv from '@tensorflow/tfjs-converter';
import * as tf from '@tensorflow/tfjs-core';
import { CLASSES } from './classes';
const BASE_PATH = 'https://storage.googleapis.com/tfjs-models/savedmodel/';
export { version } from './version';
export async function load(config = {}) {
    if (tf == null) {
        throw new Error(`Cannot find TensorFlow.js. If you are using a <script> tag, please ` +
            `also include @tensorflow/tfjs on the page before using this model.`);
    }
    const base = config.base || 'lite_mobilenet_v2';
    const modelUrl = config.modelUrl;
    if (['mobilenet_v1', 'mobilenet_v2', 'lite_mobilenet_v2'].indexOf(base) ===
        -1) {
        throw new Error(`ObjectDetection constructed with invalid base model ` +
            `${base}. Valid names are 'mobilenet_v1',` +
            ` 'mobilenet_v2' and 'lite_mobilenet_v2'.`);
    }
    const objectDetection = new ObjectDetection(base, modelUrl);
    await objectDetection.load();
    return objectDetection;
}
export class ObjectDetection {
    constructor(base, modelUrl) {
        this.modelPath =
            modelUrl || `${BASE_PATH}${this.getPrefix(base)}/model.json`;
    }
    getPrefix(base) {
        return base === 'lite_mobilenet_v2' ? `ssd${base}` : `ssd_${base}`;
    }
    async load() {
        this.model = await tfconv.loadGraphModel(this.modelPath);
        const zeroTensor = tf.zeros([1, 300, 300, 3], 'int32');
        // Warmup the model.
        const result = await this.model.executeAsync(zeroTensor);
        await Promise.all(result.map(t => t.data()));
        result.map(t => t.dispose());
        zeroTensor.dispose();
    }
    /**
     * Infers through the model.
     *
     * @param img The image to classify. Can be a tensor or a DOM element image,
     * video, or canvas.
     * @param maxNumBoxes The maximum number of bounding boxes of detected
     * objects. There can be multiple objects of the same class, but at different
     * locations. Defaults to 20.
     * @param minScore The minimum score of the returned bounding boxes
     * of detected objects. Value between 0 and 1. Defaults to 0.5.
     */
    async infer(img, maxNumBoxes, minScore) {
        const batched = tf.tidy(() => {
            if (!(img instanceof tf.Tensor)) {
                img = tf.browser.fromPixels(img);
            }
            // Reshape to a single-element batch so we can pass it to executeAsync.
            return img.expandDims(0);
        });
        const height = batched.shape[1];
        const width = batched.shape[2];
        // model returns two tensors:
        // 1. box classification score with shape of [1, 1917, 90]
        // 2. box location with shape of [1, 1917, 1, 4]
        // where 1917 is the number of box detectors, 90 is the number of classes.
        // and 4 is the four coordinates of the box.
        const result = await this.model.executeAsync(batched);
        const scores = result[0].dataSync();
        const boxes = result[1].dataSync();
        // clean the webgl tensors
        batched.dispose();
        tf.dispose(result);
        const [maxScores, classes] = this.calculateMaxScores(scores, result[0].shape[1], result[0].shape[2]);
        const prevBackend = tf.getBackend();
        // run post process in cpu
        tf.setBackend('cpu');
        const indexTensor = tf.tidy(() => {
            const boxes2 = tf.tensor2d(boxes, [result[1].shape[1], result[1].shape[3]]);
            return tf.image.nonMaxSuppression(boxes2, maxScores, maxNumBoxes, minScore, minScore);
        });
        const indexes = indexTensor.dataSync();
        indexTensor.dispose();
        // restore previous backend
        tf.setBackend(prevBackend);
        return this.buildDetectedObjects(width, height, boxes, maxScores, indexes, classes);
    }
    buildDetectedObjects(width, height, boxes, scores, indexes, classes) {
        const count = indexes.length;
        const objects = [];
        for (let i = 0; i < count; i++) {
            const bbox = [];
            for (let j = 0; j < 4; j++) {
                bbox[j] = boxes[indexes[i] * 4 + j];
            }
            const minY = bbox[0] * height;
            const minX = bbox[1] * width;
            const maxY = bbox[2] * height;
            const maxX = bbox[3] * width;
            bbox[0] = minX;
            bbox[1] = minY;
            bbox[2] = maxX - minX;
            bbox[3] = maxY - minY;
            objects.push({
                bbox: bbox,
                class: CLASSES[classes[indexes[i]] + 1].displayName,
                score: scores[indexes[i]]
            });
        }
        return objects;
    }
    calculateMaxScores(scores, numBoxes, numClasses) {
        const maxes = [];
        const classes = [];
        for (let i = 0; i < numBoxes; i++) {
            let max = Number.MIN_VALUE;
            let index = -1;
            for (let j = 0; j < numClasses; j++) {
                if (scores[i * numClasses + j] > max) {
                    max = scores[i * numClasses + j];
                    index = j;
                }
            }
            maxes[i] = max;
            classes[i] = index;
        }
        return [maxes, classes];
    }
    /**
     * Detect objects for an image returning a list of bounding boxes with
     * assocated class and score.
     *
     * @param img The image to detect objects from. Can be a tensor or a DOM
     *     element image, video, or canvas.
     * @param maxNumBoxes The maximum number of bounding boxes of detected
     * objects. There can be multiple objects of the same class, but at different
     * locations. Defaults to 20.
     * @param minScore The minimum score of the returned bounding boxes
     * of detected objects. Value between 0 and 1. Defaults to 0.5.
     */
    async detect(img, maxNumBoxes = 20, minScore = 0.5) {
        return this.infer(img, maxNumBoxes, minScore);
    }
    /**
     * Dispose the tensors allocated by the model. You should call this when you
     * are done with the model.
     */
    dispose() {
        if (this.model != null) {
            this.model.dispose();
        }
    }
}
//# sourceMappingURL=index.js.map