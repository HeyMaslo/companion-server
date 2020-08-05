import * as tf from '@tensorflow/tfjs-core';
export declare class ModelWeights {
    private variables;
    constructor(variables: {
        [varName: string]: tf.Tensor;
    });
    weights(layerName: string): tf.Tensor<tf.Rank.R4>;
    depthwiseBias(layerName: string): tf.Tensor<tf.Rank.R1>;
    convBias(layerName: string): tf.Tensor<tf.Rank.R1>;
    depthwiseWeights(layerName: string): tf.Tensor<tf.Rank.R4>;
    dispose(): void;
}
