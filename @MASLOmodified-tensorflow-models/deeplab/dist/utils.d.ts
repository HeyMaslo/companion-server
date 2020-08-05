import * as tf from '@tensorflow/tfjs-core';
import { Color, DeepLabInput, ModelArchitecture, QuantizationBytes, SegmentationData } from './types';
export declare function createPascalColormap(): Color[];
export declare function getURL(base: ModelArchitecture, quantizationBytes: QuantizationBytes): string;
export declare function getColormap(base: ModelArchitecture): Color[];
export declare function getLabels(base: ModelArchitecture): string[];
export declare function toInputTensor(input: DeepLabInput): tf.Tensor<tf.Rank>;
export declare function toSegmentationImage(colormap: Color[], labelNames: string[], rawSegmentationMap: tf.Tensor2D, canvas?: HTMLCanvasElement): Promise<SegmentationData>;
