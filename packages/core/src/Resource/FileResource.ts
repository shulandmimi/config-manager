import { Resource } from './index';
import fs from 'fs';

export default class FileResource extends Resource<string> {
    constructor(public filename: string) {
        super();
    }

    async fetch(): Promise<string> {
        const result = await fs.promises.readFile(this.filename);
        return result.toString();
    }
}
