import { ZipGroup as Group, GroupZipStorage, Platform, fetchPlatform, FileResource } from '@config-mode/core';
import FileItem, { ItemOption } from '../Item/FileItem';

export interface GroupOption {
    name: string;
    createAt: number;
    in: Platform;
    filename: string;
    items: {
        [key: string]: ItemOption;
    };
}

export default class ZipGroup extends Group<FileItem> {
    storage!: GroupZipStorage;

    options = {
        filename: '',
        createAt: Date.now(),
        in: fetchPlatform(),
    };

    constructor(public name: string, filename: string) {
        super();

        Object.assign(this.options, { filename });

        this.storage = new GroupZipStorage(name, filename);
    }

    async add(item: FileItem): Promise<void> {
        if (!item.resource) item.register(new FileResource(item.options.filename));
        await super.add(item);
    }

    async fetchFiles() {
        return (
            await Promise.all(
                this.items.map(async item => ({
                    name: item.name,
                    content: await this.storage.get(item.name),
                }))
            )
        ).reduce((result, item) => {
            result[item.name] = item;
            return result;
        }, {} as { [name: string]: { name: string; content?: string } });
    }

    static restore(option: GroupOption) {
        const group = new ZipGroup(option.name, option.filename);
        const items = Object.values(option.items).map(item => FileItem.restore(item));

        group.items = items;

        return group;
    }

    toString() {
        const outs = [];

        const sep_space = ''.padStart(4, ' ');
        outs.push(`${this.name} in ${this.options.in} at ${new Date(this.options.createAt).toLocaleString()}`);
        outs.push(sep_space + this.items.join('\n' + sep_space));

        return outs.join('\n');
    }

    toJSON(): GroupOption {
        const { name, items, options } = this;

        return {
            name,
            createAt: options.createAt,
            in: options.in,
            filename: options.filename,
            items: items.reduce((result, item) => {
                return {
                    ...result,
                    [item.name]: item.toJSON(),
                };
            }, {}),
        };
    }
}
