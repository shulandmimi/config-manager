// type GetProperty<T, K extends keyof T> = T[K];

export abstract class Storage<T> {
    abstract get<K extends keyof T>(key: K): Promise<T[K] | undefined>;
    abstract set<K extends keyof T>(key: K, value: T[K]): Promise<void>;
    abstract remove<K extends keyof T>(key: K): Promise<void>;
    abstract clear(): Promise<void>;
    abstract serialize(data: T): Promise<string>;
    abstract deserialize(str: string): Promise<T>;
    abstract restore(): Promise<void>;
}
