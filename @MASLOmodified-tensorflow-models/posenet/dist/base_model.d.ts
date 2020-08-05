import * as tfconv from '@tensorflow/tfjs-converter';
import * as tf from '@tensorflow/tfjs-core';
import { PoseNetOutputStride } from './types';
export declare abstract class BaseModel {
    protected readonly model: tfconv.GraphModel;
    readonly outputStride: PoseNetOutputStride;
    constructor(model: tfconv.GraphModel, outputStride: PoseNetOutputStride);
    abstract preprocessInput(input: tf.Tensor3D): tf.Tensor3D;
    predict(input: tf.Tensor3D): {
        heatmapScores: tf.Tensor3D;
        offsets: tf.Tensor3D;
        displacementFwd: tf.Tensor3D;
        displacementBwd: tf.Tensor3D;
    };
    abstract nameOutputResults(results: tf.Tensor3D[]): {
        heatmap: tf.Tensor3D;
        offsets: tf.Tensor3D;
        displacementFwd: tf.Tensor3D;
        displacementBwd: tf.Tensor3D;
    };
    dispose(): void;
}
