import Item from '.';
import FileResource from '../../dist/Resource/FileResource';

export default class FileItem extends Item<string> {
    name: string;
    resource?: FileResource;
    private options = {
        filename: '',
    };

    constructor(name: string, filename: string) {
        super();
        this.name = name;
        Object.assign(this.options, {
            filename: filename,
        });
    }

    register(resource: FileResource): void {
        this.resource = resource;
    }

    toString(): string {
        return Object.toString();
    }
}
