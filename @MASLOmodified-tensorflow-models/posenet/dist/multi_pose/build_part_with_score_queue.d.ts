import { PartWithScore, TensorBuffer3D } from '../types';
import { MaxHeap } from './max_heap';
export declare function buildPartWithScoreQueue(scoreThreshold: number, localMaximumRadius: number, scores: TensorBuffer3D): MaxHeap<PartWithScore>;
