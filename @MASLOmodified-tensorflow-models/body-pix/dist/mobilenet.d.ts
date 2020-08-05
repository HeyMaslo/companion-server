import * as tf from '@tensorflow/tfjs-core';
import { BaseModel } from './base_model';
export declare class MobileNet extends BaseModel {
    preprocessInput(input: tf.Tensor3D): tf.Tensor3D;
    nameOutputResults(results: tf.Tensor3D[]): {
        offsets: tf.Tensor<tf.Rank.R3>;
        segmentation: tf.Tensor<tf.Rank.R3>;
        partHeatmaps: tf.Tensor<tf.Rank.R3>;
        longOffsets: tf.Tensor<tf.Rank.R3>;
        heatmap: tf.Tensor<tf.Rank.R3>;
        displacementFwd: tf.Tensor<tf.Rank.R3>;
        displacementBwd: tf.Tensor<tf.Rank.R3>;
        partOffsets: tf.Tensor<tf.Rank.R3>;
    };
}
