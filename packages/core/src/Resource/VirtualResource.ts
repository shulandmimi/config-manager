import { Resource } from './index';

export default class VirtualResource extends Resource<string | null> {
    constructor(public cache: string | null = null) {
        super();
    }

    fetch() {
        return Promise.resolve(this.cache);
    }
}
