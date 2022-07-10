import platform from 'platform';
import Item, { ItemOption } from './Item';
import GroupZipStorage from './Storage/GroupZipStorage';
import path from 'path';
import fs from 'fs';

export enum Platform {
    LINUX,
    WINDOWS,
    MACOS,
    Unknown,
}

const PlatformMappingList = [
    ['Mac', Platform.MACOS],
    ['Linux', Platform.LINUX],
    ['Windows', Platform.WINDOWS],
] as const;

export const fetchPlatform = () => {
    const platformText = platform.os?.toString() ?? '';

    const result = PlatformMappingList.find(([name]) => {
        return platformText.includes(name);
    });

    if (result === undefined) return Platform.Unknown;

    return result[1];
};

export interface GroupOption {
    createAt: number;
    items: ItemOption[];
    in: Platform;
    name: string;
}

// 外部恢复
export default class Group {
    createAt: number = Date.now();
    items: Item[] = [];
    in: Platform = fetchPlatform();
    // 存储压缩信息
    storage!: GroupZipStorage;

    constructor(public name: string) {
        this.storage = new GroupZipStorage(name, path.resolve(process.cwd(), name));
    }

    async appendItem(item: Item) {
        if (this.items.find(i => i.name === item.name)) return;
        item.registerResource();
        const data = await item.resource?.fetch();
        if (!data) throw new Error('该资源未注册');
        await this.storage.set(item.name || item.filename, data);
        this.items.push(item);
    }

    async remove() {
        return await this.storage.clear();
    }

    async removeItem(item: Item) {
        this.items = this.items.filter(i => item.name !== item.name);
        return await this.storage.remove(item.name);
    }

    toString() {
        const strs = [];
        const sep_space = ''.padStart(4, ' ');
        strs.push(this.selfToString());
        strs.push(
            sep_space +
                this.itemsToString()
                    .split('\n')
                    .join('\n' + sep_space)
        );
        return strs.join('\n');
    }

    itemsToString() {
        return this.items.join('\n');
    }

    selfToString() {
        return `${this.name} in ${Platform[this.in]} at ${new Date(this.createAt).toLocaleString()}`;
    }

    toJSON() {
        const { name, createAt, items } = this;
        return {
            name,
            createAt,
            in: this.in,
            description: this.selfToString(),
            items: items.reduce((result, item) => {
                result[item.name] = {
                    name: item.name,
                    filename: item.filename,
                    description: item.toString(),
                };
                return result;
            }, {} as { [key: string]: { name: string; filename: string; description: string } }),
        };
    }

    static async restoreFromFile(filename: string) {
        const buffer = await fs.promises.readFile(filename);
        const json = JSON.parse(buffer.toString('utf-8'));

        const group = new Group(json.name);

        const { createAt, items } = json;

        Object.assign(group, {
            createAt,
            items: items.map((item: any) => Item.restore(item)),
        });
    }

    static async restore(option: GroupOption) {
        const group = new Group(option.name);
        const items = option.items.map(item => new Item(item.filename, { name: item.name }));
        Object.assign(group, { items, createAt: option.createAt, in: option.in });
        return group;
    }
}
