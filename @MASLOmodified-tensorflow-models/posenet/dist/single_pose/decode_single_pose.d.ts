import * as tf from '@tensorflow/tfjs-core';
import { Pose, PoseNetOutputStride } from '../types';
export declare function decodeSinglePose(heatmapScores: tf.Tensor3D, offsets: tf.Tensor3D, outputStride: PoseNetOutputStride): Promise<Pose>;
