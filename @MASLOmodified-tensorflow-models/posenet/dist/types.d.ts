import * as tf from '@tensorflow/tfjs-core';
export declare type PoseNetOutputStride = 32 | 16 | 8;
export declare type PoseNetArchitecture = 'ResNet50' | 'MobileNetV1';
export declare type PoseNetDecodingMethod = 'single-person' | 'multi-person';
export declare type PoseNetQuantBytes = 1 | 2 | 4;
export declare type MobileNetMultiplier = 0.50 | 0.75 | 1.0;
export declare type Vector2D = {
    y: number;
    x: number;
};
export declare type Part = {
    heatmapX: number;
    heatmapY: number;
    id: number;
};
export declare type PartWithScore = {
    score: number;
    part: Part;
};
export declare type Keypoint = {
    score: number;
    position: Vector2D;
    part: string;
};
export declare type Pose = {
    keypoints: Keypoint[];
    score: number;
};
export declare type PosenetInput = ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | tf.Tensor3D;
export declare type TensorBuffer3D = tf.TensorBuffer<tf.Rank.R3>;
export declare interface Padding {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
export declare type InputResolution = number | {
    width: number;
    height: number;
};
