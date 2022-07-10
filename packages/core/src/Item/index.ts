import FileResource from '../Resource/FileResource';
import { Resource } from '../Resource/index';

// export interface ItemOption {
//     name: string;
//     filename: string;
// }

export default abstract class Item<Source> {
    abstract name: string;
    resource?: Resource<Source>;
    abstract register(resource: Resource<Source>): void;
    abstract toString(): string;
}

// export default class Item {
//     resource?: Resource<string>;
//     name!: string;

//     constructor(public filename: string, options: Partial<Omit<ItemOption, 'filename'>> = {}) {
//         Object.assign(this, {
//             name: options.name,
//         });
//     }

//     registerResource() {
//         this.resource = new FileResource(this.filename);
//     }

//     toString() {
//         return `${this.name || 'Unknown'} ref "${this.filename}"`;
//     }

//     static restore(json: ItemOption): Item {
//         const item = new Item(json.filename, { name: json.name });
//         return item;
//     }
// }
