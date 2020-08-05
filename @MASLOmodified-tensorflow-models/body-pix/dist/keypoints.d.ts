export declare type Tuple<T> = [T, T];
export declare type StringTuple = Tuple<string>;
export declare type NumberTuple = Tuple<number>;
export declare const PART_NAMES: string[];
export declare const NUM_KEYPOINTS: number;
export interface NumberDict {
    [jointName: string]: number;
}
export declare const PART_IDS: NumberDict;
export declare const POSE_CHAIN: StringTuple[];
export declare const CONNECTED_PART_INDICES: number[][];
