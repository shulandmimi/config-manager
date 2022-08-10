import Group from './index';
import FileItem from '../Item/FileItem';
import { Storage } from '../Storage/index';

export default class ZipGroup<T extends FileItem = FileItem> extends Group<T> {
    storage!: Storage<{ [key: string]: unknown }>;

    async add(item: T) {
        this.items.push(item);
        const data = await item.resource?.fetch();
        console.log(data);
        if (!data) return;
        await this.storage.set(item.name, data);
    }

    async del(item: T) {
        this.items = this.items.filter(i => item.name !== i.name);
        await this.storage.remove(item.name);
    }

    async find(item: T) {
        return this.items.find(i => i.name === item.name);
    }

    async remove() {
        await this.storage.clear();
    }

    toString(): string {
        return '';
    }
}
