export declare class MaxHeap<T> {
    private priorityQueue;
    private numberOfElements;
    private getElementValue;
    constructor(maxSize: number, getElementValue: (element: T) => number);
    enqueue(x: T): void;
    dequeue(): T;
    empty(): boolean;
    size(): number;
    all(): T[];
    max(): T;
    private swim;
    private sink;
    private getValueAt;
    private less;
    private exchange;
}
