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
import * as tf from '@tensorflow/tfjs-core';
export { version } from './version';
export declare type ObjectDetectionBaseModel = 'mobilenet_v1' | 'mobilenet_v2' | 'lite_mobilenet_v2';
export interface DetectedObject {
    bbox: [number, number, number, number];
    class: string;
    score: number;
}
/**
 * Coco-ssd model loading is configurable using the following config dictionary.
 *
 * `base`: ObjectDetectionBaseModel. It determines wich PoseNet architecture
 * to load. The supported architectures are: 'mobilenet_v1', 'mobilenet_v2' and
 * 'lite_mobilenet_v2'. It is default to 'lite_mobilenet_v2'.
 *
 * `modelUrl`: An optional string that specifies custom url of the model. This
 * is useful for area/countries that don't have access to the model hosted on
 * GCP.
 */
export interface ModelConfig {
    base?: ObjectDetectionBaseModel;
    modelUrl?: string;
}
export declare function load(config?: ModelConfig): Promise<ObjectDetection>;
export declare class ObjectDetection {
    private modelPath;
    private model;
    constructor(base: ObjectDetectionBaseModel, modelUrl?: string);
    private getPrefix;
    load(): Promise<void>;
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
    private infer;
    private buildDetectedObjects;
    private calculateMaxScores;
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
    detect(img: tf.Tensor3D | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, maxNumBoxes?: number, minScore?: number): Promise<DetectedObject[]>;
    /**
     * Dispose the tensors allocated by the model. You should call this when you
     * are done with the model.
     */
    dispose(): void;
}
