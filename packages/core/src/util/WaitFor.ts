export default class WaitFor {
    promise: Promise<any> | null = null;
    register(promise: Promise<any>) {
        return (this.promise = promise);
    }
    async wait() {
        return await this.promise;
    }
}
