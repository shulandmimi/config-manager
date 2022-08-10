import JSZip, { JSZipFileOptions } from 'jszip';
import { Storage } from '.';
import fs from 'fs';
import WaitFor from '../util/WaitFor';
import { resolve } from 'path';

interface GroupZipStorageFile {
    [key: string]: string;
}

export default class GroupZipStorage<T extends GroupZipStorageFile = GroupZipStorageFile> extends Storage<GroupZipStorageFile> {
    static defaultOption = {};
    options = {
        name: '',
        filename: '',
    };

    zip!: JSZip;
    waitForZipLoad = new WaitFor();

    constructor(name: string, filename: string) {
        super();

        Object.assign(this.options, GroupZipStorage.defaultOption, {
            name: name,
            filename,
        });
        this.restore();
    }

    async get<K extends keyof T>(key: K) {
        await this.waitForZipLoad.wait();
        const file = this.zip.file(key as string);

        if (!file) return undefined;

        return await file.async('string');
    }

    async set<K extends keyof T>(key: K, value: T[K]): Promise<void> {
        await this.waitForZipLoad.wait();
        this.zip.file(key as string, value);
        await this.async_to_storage();
    }

    async remove<K extends keyof T>(key: K): Promise<void> {
        await this.waitForZipLoad.wait();
        this.zip.remove(key as string);
        await this.async_to_storage();
    }

    async clear(): Promise<void> {
        console.log('clear');
    }

    async serialize(data: T): Promise<string> {
        return JSON.stringify(data);
    }

    async deserialize(str: string): Promise<T> {
        return JSON.parse(str);
    }

    async async_to_storage() {
        await this.zip.generateAsync({ type: 'nodebuffer' }).then(res => {
            fs.promises.writeFile(this.options.filename + '.zip', res);
        });
    }

    async restore() {
        await this.waitForZipLoad.register(
            JSZip.loadAsync(fs.promises.readFile(this.options.filename + '.zip'))
                .then(res => {
                    this.zip = res;
                })
                .catch(() => {
                    this.zip = new JSZip();
                })
        );
    }
}
