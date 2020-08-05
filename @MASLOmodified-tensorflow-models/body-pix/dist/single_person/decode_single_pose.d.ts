import * as tf from '@tensorflow/tfjs-core';
import { BodyPixOutputStride } from '../types';
import { Pose } from '../types';
export declare function decodeSinglePose(heatmapScores: tf.Tensor3D, offsets: tf.Tensor3D, outputStride: BodyPixOutputStride): Promise<Pose>;
