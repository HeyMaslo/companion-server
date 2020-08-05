import * as tf from '@tensorflow/tfjs-core';
import { BaseModel } from './base_model';
import { BodyPixArchitecture, BodyPixInput, BodyPixInternalResolution, BodyPixMultiplier, BodyPixOutputStride, BodyPixQuantBytes, Padding } from './types';
import { PartSegmentation, PersonSegmentation, SemanticPartSegmentation, SemanticPersonSegmentation } from './types';
export interface ModelConfig {
    architecture: BodyPixArchitecture;
    outputStride: BodyPixOutputStride;
    multiplier?: BodyPixMultiplier;
    modelUrl?: string;
    quantBytes?: BodyPixQuantBytes;
}
export interface InferenceConfig {
    flipHorizontal?: boolean;
    internalResolution?: BodyPixInternalResolution;
    segmentationThreshold?: number;
}
export interface PersonInferenceConfig extends InferenceConfig {
    maxDetections?: number;
    scoreThreshold?: number;
    nmsRadius?: number;
}
export interface MultiPersonInstanceInferenceConfig extends InferenceConfig {
    maxDetections?: number;
    scoreThreshold?: number;
    nmsRadius?: number;
    minKeypointScore?: number;
    refineSteps?: number;
}
export declare const PERSON_INFERENCE_CONFIG: PersonInferenceConfig;
export declare const MULTI_PERSON_INSTANCE_INFERENCE_CONFIG: MultiPersonInstanceInferenceConfig;
export declare class BodyPix {
    baseModel: BaseModel;
    constructor(net: BaseModel);
    private predictForPersonSegmentation;
    private predictForPersonSegmentationAndPart;
    private predictForMultiPersonInstanceSegmentationAndPart;
    segmentPersonActivation(input: BodyPixInput, internalResolution: BodyPixInternalResolution, segmentationThreshold?: number): {
        segmentation: tf.Tensor2D;
        heatmapScores: tf.Tensor3D;
        offsets: tf.Tensor3D;
        displacementFwd: tf.Tensor3D;
        displacementBwd: tf.Tensor3D;
        padding: Padding;
        internalResolutionHeightAndWidth: [number, number];
    };
    segmentPerson(input: BodyPixInput, config?: PersonInferenceConfig): Promise<SemanticPersonSegmentation>;
    segmentMultiPerson(input: BodyPixInput, config?: MultiPersonInstanceInferenceConfig): Promise<PersonSegmentation[]>;
    segmentPersonPartsActivation(input: BodyPixInput, internalResolution: BodyPixInternalResolution, segmentationThreshold?: number): {
        partSegmentation: tf.Tensor2D;
        heatmapScores: tf.Tensor3D;
        offsets: tf.Tensor3D;
        displacementFwd: tf.Tensor3D;
        displacementBwd: tf.Tensor3D;
        padding: Padding;
        internalResolutionHeightAndWidth: [number, number];
    };
    segmentPersonParts(input: BodyPixInput, config?: PersonInferenceConfig): Promise<SemanticPartSegmentation>;
    segmentMultiPersonParts(input: BodyPixInput, config?: MultiPersonInstanceInferenceConfig): Promise<PartSegmentation[]>;
    dispose(): void;
}
export declare function load(config?: ModelConfig): Promise<BodyPix>;
