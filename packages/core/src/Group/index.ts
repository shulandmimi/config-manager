import platform from 'platform';
import Item from '../Item';
import { Storage } from '../Storage/index';

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

// export interface GroupOption {
//     createAt: number;
//     items: ItemOption[];
//     in: Platform;
//     name: string;
// }

// 外部恢复
export default abstract class Group<ItemInstance> {
    // createAt: number = Date.now();
    // in: Platform = fetchPlatform();
    // storage!: GroupZipStorage;

    items: ItemInstance[] = [];

    abstract storage: Storage<unknown>;

    abstract add(item: ItemInstance): Promise<unknown>;

    abstract del(item: ItemInstance): Promise<unknown>;

    abstract find(item: ItemInstance): Promise<unknown>;

    abstract remove(): Promise<unknown>;

    abstract toString(): string;
    //  {
    //     const strs = [];
    //     const sep_space = ''.padStart(4, ' ');
    //     strs.push(this.selfToString());
    //     strs.push(
    //         sep_space +
    //             this.itemsToString()
    //                 .split('\n')
    //                 .join('\n' + sep_space)
    //     );
    //     return strs.join('\n');
    // }

    // toJSON() {
    //     const { name, createAt, items } = this;
    //     return {
    //         name,
    //         createAt,
    //         in: this.in,
    //         description: this.selfToString(),
    //         items: items.reduce((result, item) => {
    //             result[item.name] = {
    //                 name: item.name,
    //                 filename: item.filename,
    //                 description: item.toString(),
    //             };
    //             return result;
    //         }, {} as { [key: string]: { name: string; filename: string; description: string } }),
    //     };
    // }

    // static async restoreFromFile(filename: string) {
    //     const buffer = await fs.promises.readFile(filename);
    //     const json = JSON.parse(buffer.toString('utf-8'));

    //     const group = new Group(json.name);

    //     const { createAt, items } = json;

    //     Object.assign(group, {
    //         createAt,
    //         items: items.map((item: any) => Item.restore(item)),
    //     });
    // }

    // static async restore(option: GroupOption) {
    //     const group = new Group(option.name);
    //     const items = option.items.map(item => new Item(item.filename, { name: item.name }));
    //     Object.assign(group, { items, createAt: option.createAt, in: option.in });
    //     return group;
    // }
}
