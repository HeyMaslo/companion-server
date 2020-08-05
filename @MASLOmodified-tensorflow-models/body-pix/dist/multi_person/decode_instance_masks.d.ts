import * as tf from '@tensorflow/tfjs-core';
import { Padding, PartSegmentation, PersonSegmentation, Pose } from '../types';
export declare function toPersonKSegmentation(segmentation: tf.Tensor2D, k: number): tf.Tensor2D;
export declare function toPersonKPartSegmentation(segmentation: tf.Tensor2D, bodyParts: tf.Tensor2D, k: number): tf.Tensor2D;
export declare function decodePersonInstanceMasks(segmentation: tf.Tensor2D, longOffsets: tf.Tensor3D, poses: Pose[], height: number, width: number, stride: number, [inHeight, inWidth]: [number, number], padding: Padding, minPoseScore?: number, refineSteps?: number, minKeypointScore?: number, maxNumPeople?: number): Promise<PersonSegmentation[]>;
export declare function decodePersonInstancePartMasks(segmentation: tf.Tensor2D, longOffsets: tf.Tensor3D, partSegmentation: tf.Tensor2D, poses: Pose[], height: number, width: number, stride: number, [inHeight, inWidth]: [number, number], padding: Padding, minPoseScore?: number, refineSteps?: number, minKeypointScore?: number, maxNumPeople?: number): Promise<PartSegmentation[]>;
