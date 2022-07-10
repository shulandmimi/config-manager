export abstract class Resource<T> {
    abstract fetch(): Promise<T>;
}
