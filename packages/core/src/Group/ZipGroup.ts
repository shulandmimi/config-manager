import Group from './index';
import GroupZipStorage from 'src/Storage/GroupZipStorage';
import FileItem from '../Item/FileItem';

export default class ZipGroup extends Group<FileItem> {
    storage!: GroupZipStorage;

    async add(item: FileItem) {
        this.items.push(item);
        const data = await item.resource?.fetch();
        if (!data) return;
        this.storage.set(item.name, data);
    }

    async del(item: FileItem) {
        this.items = this.items.filter(i => item.name !== i.name);
        this.storage.remove(item.name);
    }

    async find(item: FileItem) {
        return this.items.find(i => i.name === item.name);
    }

    async remove() {
        await this.storage.clear();
    }

    toString(): string {
        return '';
    }
}
