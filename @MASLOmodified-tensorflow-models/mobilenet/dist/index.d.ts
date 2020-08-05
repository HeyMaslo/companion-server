import * as tf from '@tensorflow/tfjs-core';
export declare type MobileNetVersion = 1 | 2;
export declare type MobileNetAlpha = 0.25 | 0.50 | 0.75 | 1.0;
export interface ModelConfig {
    version: MobileNetVersion;
    alpha?: MobileNetAlpha;
    modelUrl?: string | tf.io.IOHandler;
    inputRange?: [number, number];
}
export interface MobileNetInfo {
    url: string;
    inputRange: [number, number];
}
export declare function load(modelConfig?: ModelConfig): Promise<MobileNet>;
export interface MobileNet {
    load(): Promise<void>;
    infer(img: tf.Tensor | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, embedding?: boolean): tf.Tensor;
    classify(img: tf.Tensor3D | ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, topk?: number): Promise<Array<{
        className: string;
        probability: number;
    }>>;
}
