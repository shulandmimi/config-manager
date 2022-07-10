import { deleteProperty, getProperty, setProperty } from 'dot-prop';
import fs from 'fs';
import path from 'path';
import { Storage } from '.';

const existsAndCreate = (filename: string) => {
    if (fs.existsSync(filename)) return;

    fs.mkdirSync(path.parse(filename).dir, { recursive: true });

    fs.writeFileSync(filename, '', { flag: 'a+' });
};

export default class JSONStorage<T> extends Storage<T> {
    static defaultOptions = {};
    options: {
        filename: string;
    } = {
        filename: '',
    };
    constructor(filename: string) {
        super();
        Object.assign(this.options, JSONStorage.defaultOptions, {
            filename: filename,
        });
    }

    async get<K extends keyof T>(key: K): Promise<T[K] | undefined> {
        try {
            const buffer = fs.readFileSync(this.options.filename, 'utf8');
            const obj = await this.deserialize(buffer);
            return getProperty(obj, key as any) as T[K];
        } catch (error) {
            return undefined;
        }
    }

    async set<K extends keyof T>(key: K, value: T[K]) {
        let buffer;
        if (fs.existsSync(this.options.filename)) {
            buffer = fs.readFileSync(this.options.filename, 'utf8');
        }
        const obj = typeof buffer !== 'undefined' ? await this.deserialize(buffer) : ({} as T);

        setProperty(obj as any, key as any, value);

        existsAndCreate(this.options.filename);

        fs.writeFileSync(this.options.filename, await this.serialize(obj));
        return Promise.resolve();
    }

    async remove<K extends keyof T>(key: K) {
        let buffer;
        try {
            buffer = fs.readFileSync(this.options.filename, 'utf8');
        } catch (error) {}
        if (!buffer) return Promise.resolve();
        const obj = await this.deserialize(buffer);

        deleteProperty(obj as any, key as any);

        fs.writeFileSync(this.options.filename, await this.serialize(obj));
        return Promise.resolve();
    }

    clear() {
        if (fs.existsSync(this.options.filename)) fs.unlinkSync(this.options.filename);
        return Promise.resolve();
    }

    serialize(data: T) {
        return Promise.resolve(JSON.stringify(data, null, 0));
    }

    deserialize(str: string): Promise<T> {
        return Promise.resolve(JSON.parse(str));
    }

    restore(): Promise<void> {
        return Promise.resolve();
    }

    // restore() {
    //     return Promise.resolve(this.deserialize('{}'));
    // }
}
