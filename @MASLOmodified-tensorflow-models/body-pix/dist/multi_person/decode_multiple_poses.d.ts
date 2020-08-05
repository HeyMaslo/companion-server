import { Pose, TensorBuffer3D } from '../types';
export declare function decodeMultiplePoses(scoresBuffer: TensorBuffer3D, offsetsBuffer: TensorBuffer3D, displacementsFwdBuffer: TensorBuffer3D, displacementsBwdBuffer: TensorBuffer3D, outputStride: number, maxPoseDetections: number, scoreThreshold?: number, nmsRadius?: number): Pose[];
