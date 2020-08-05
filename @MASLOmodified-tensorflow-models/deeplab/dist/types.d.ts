import * as tf from '@tensorflow/tfjs-core';
export declare type Label = number;
export declare type Color = [number, number, number];
export interface Legend {
    [name: string]: Color;
}
export declare type QuantizationBytes = 1 | 2 | 4;
export declare type ModelArchitecture = 'pascal' | 'cityscapes' | 'ade20k';
export declare type DeepLabInput = ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | tf.Tensor3D;
export interface ModelConfig {
    quantizationBytes?: QuantizationBytes;
    base?: ModelArchitecture;
    modelUrl?: string;
}
export interface PredictionConfig {
    canvas?: HTMLCanvasElement;
    colormap?: Color[];
    labels?: string[];
}
export interface SegmentationData {
    legend: Legend;
    segmentationMap: Uint8ClampedArray;
}
export interface DeepLabOutput {
    legend: Legend;
    height: number;
    width: number;
    segmentationMap: Uint8ClampedArray;
}
