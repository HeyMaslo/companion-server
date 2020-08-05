import * as tf from '@tensorflow/tfjs-core';
import { Padding, Pose } from '../types';
export declare function decodeMultipleMasksWebGl(segmentation: tf.Tensor2D, longOffsets: tf.Tensor3D, posesAboveScore: Pose[], height: number, width: number, stride: number, [inHeight, inWidth]: [number, number], padding: Padding, refineSteps: number, minKptScore: number, maxNumPeople: number): tf.Tensor2D;
