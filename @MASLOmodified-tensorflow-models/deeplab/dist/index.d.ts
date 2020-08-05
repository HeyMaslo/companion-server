import * as tfconv from '@tensorflow/tfjs-converter';
import * as tf from '@tensorflow/tfjs-core';
import { DeepLabInput, DeepLabOutput, ModelArchitecture, ModelConfig, PredictionConfig } from './types';
import { getColormap, getLabels, getURL, toSegmentationImage } from './utils';
export { version } from './version';
export { getColormap, getLabels, getURL, toSegmentationImage };
export declare function load(modelConfig?: ModelConfig): Promise<SemanticSegmentation>;
export declare class SemanticSegmentation {
    readonly model: tfconv.GraphModel;
    readonly base: ModelArchitecture;
    constructor(graphModel: tfconv.GraphModel, base?: ModelArchitecture);
    predict(input: DeepLabInput): tf.Tensor2D;
    segment(input: DeepLabInput, config?: PredictionConfig): Promise<DeepLabOutput>;
    dispose(): Promise<void>;
}
