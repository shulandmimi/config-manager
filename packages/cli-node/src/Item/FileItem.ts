import { FileItem as Item, FileResource } from '@config-mode/core';

export interface ItemOption {
    name: string;
    filename: string;
    path: {
        absolute: string;
        relative: string;
    };
}

export default class FileItem extends Item {
    toJSON(): ItemOption {
        const { name, options } = this;
        return {
            name,
            filename: options.filename,
            path: {
                absolute: options.filename,
                relative: options.filename,
            },
        };
    }

    toString(): string {
        return `${this.name} ref ${this.options.filename}`;
    }

    static restore(option: ItemOption) {
        const item = new FileItem(option.name, option.filename);
        item.register(new FileResource(option.filename));
        return item;
    }
}
