import { BaseModel } from './base_model';
import { InputResolution, MobileNetMultiplier, Pose, PoseNetArchitecture, PosenetInput, PoseNetOutputStride, PoseNetQuantBytes } from './types';
export interface ModelConfig {
    architecture: PoseNetArchitecture;
    outputStride: PoseNetOutputStride;
    inputResolution: InputResolution;
    multiplier?: MobileNetMultiplier;
    modelUrl?: string;
    quantBytes?: PoseNetQuantBytes;
}
export interface InferenceConfig {
    flipHorizontal: boolean;
}
export interface SinglePersonInterfaceConfig extends InferenceConfig {
}
export interface MultiPersonInferenceConfig extends InferenceConfig {
    maxDetections?: number;
    scoreThreshold?: number;
    nmsRadius?: number;
}
export interface LegacyMultiPersonInferenceConfig extends MultiPersonInferenceConfig {
    decodingMethod: 'multi-person';
}
export interface LegacySinglePersonInferenceConfig extends SinglePersonInterfaceConfig {
    decodingMethod: 'single-person';
}
export declare const SINGLE_PERSON_INFERENCE_CONFIG: SinglePersonInterfaceConfig;
export declare const MULTI_PERSON_INFERENCE_CONFIG: MultiPersonInferenceConfig;
export declare class PoseNet {
    readonly baseModel: BaseModel;
    readonly inputResolution: [number, number];
    constructor(net: BaseModel, inputResolution: [number, number]);
    estimateMultiplePoses(input: PosenetInput, config?: MultiPersonInferenceConfig): Promise<Pose[]>;
    estimateSinglePose(input: PosenetInput, config?: SinglePersonInterfaceConfig): Promise<Pose>;
    estimatePoses(input: PosenetInput, config: LegacySinglePersonInferenceConfig | LegacyMultiPersonInferenceConfig): Promise<Pose[]>;
    dispose(): void;
}
export declare function load(config?: ModelConfig): Promise<PoseNet>;
