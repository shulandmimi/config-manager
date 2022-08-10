import { fetchPlatform, Platform, FileResource, JSONStorage } from '@config-mode/core';
import path from 'path';
import { program, Command } from 'commander';
import ZipGroup, { GroupOption } from './Group/ZipGroup';
import { ItemOption } from './Item/FileItem';
import FileItem from './Item/FileItem';
import fs from 'fs';

// const group = new Group();

// const item1 = new Item(path.join(process.cwd(), './tmp/foo.txt'));

// const item2 = new Item(path.join(process.cwd(), './tmp/bar.txt'));

// item1.resource = new FileResource(item1.filename);
// item2.resource = new FileResource(item2.filename);

// // group 继续封装为可压缩为 gzip 模式
// // in group gzip
// item1.resource.fetch().then(res => {
//     console.log(`foo content is: ${res}`);
// });
// item2.resource.fetch().then(res => {
//     console.log(`bar content is: ${res}`);
// });

// Object.assign(group, {
//     in: fetchPlatform(),
//     items: [item1, item2],
//     name: 'test-print',
// });

// console.log(group.toString());

interface CliMainfestOption {
    version: string;

    groups: {
        [key: string]: GroupOptionMap;
    };
}

interface GroupOptionMap extends Omit<GroupOption, 'items'> {
    name: string;
    createAt: number;
    in: Platform;
    items: {
        [key: string]: ItemOption;
    };
}

class CliMainfest extends JSONStorage<CliMainfestOption> {}

const resolveRoot = (filename: string) => path.join(process.cwd(), filename);
const cliOption = new CliMainfest(resolveRoot('./config-mode.json'));

const validGroupInGroups = (groups: CliMainfestOption['groups'], group: GroupOption['name']) => group in groups;
const validItemInItems = (items: GroupOption['items'], item: ItemOption['name']) => item in items;

// async function main() {
//     console.log(await cliOption.get('groups'));
//     const result = (await cliOption.get('groups')) || ({} as CliMainfestOption['groups']);
//     for (const operation of [appendOptions, deleteOptions, updateOptions, viewOptions]) {
//         const { group, name, command, file } = operation;
//         switch (command) {
//             case 'append':
//                 const item = new Item(path.isAbsolute(file) ? file : resolveRoot(file), { name });
//                 const groupOption = result[group];
//                 const groupInstance = Group.restore({ ...groupOption, items: Object.values(groupOption.items) });

//                 (await groupInstance).appendItem(item);
//                 cliOption.set('groups', {
//                     ...(await cliOption.get('groups')),
//                     [groupOption.name]: {
//                         ...groupOption,
//                         items: {
//                             ...groupOption.items,
//                             [item.name]: {
//                                 filename: item.filename,
//                                 name: item.name,
//                                 path: {
//                                     absolute: item.filename,
//                                     relative: item.filename,
//                                 },
//                             },
//                         },
//                     },
//                 });
//                 // cliOption.get('group')
//                 break;
//             case 'delete':
//                 if (validGroupInGroups(result, group)) {
//                 }

//             case 'update':
//             case 'view':
//         }
//     }
// }

// // [appendOptions, deleteOptions, updateOptions, viewOptions].map(async operation => {});
// // main();
// try {
const command = program.name('config-mode').description('配置文件在不同的文件之中').version('0.0.1');

command.commands.push(
    new Command('group')
        .description('操作 group')
        .argument('<action>', 'add | delete | view')
        .requiredOption('-n | --name <name>', '')
        .option('-f | --filename <path>', '')
        .action((action, option) => {
            new Main({ type: 'group', action, ...option });
        })
);

command.commands.push(
    new Command('item')
        .description('操作 item')
        .argument('<action>', 'add | delete | view')
        .requiredOption('-g | --group <name>', '组 名称')
        .requiredOption('-n | --name <name>', 'Item 名称')
        .option('-f | --filename <path>', '文件位置')
        .action((action, option) => {
            new Main({ type: 'item', action, ...option });
        })
);

// } catch (error) {
//     console.log(error);
// }

async function addGroup(group: ZipGroup) {
    await store(group);
}

async function addItem(group: ZipGroup, item: FileItem) {
    group.add(item);
    store(group);
}

async function store(group: ZipGroup) {
    await cliOption.set('groups', {
        ...(await cliOption.get('groups')),
        [group.name]: group.toJSON(),
    });
}

interface RestoreOption {
    origin?: boolean;
    flat?: boolean;
    dirname?: string;
}

async function existsOrMkdir(dirname: string) {
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname);
    }
}

async function restoreFiles(group: ZipGroup, options: RestoreOption) {
    const files = await group.fetchFiles();

    if (options.origin) {
    } else if (options.flat) {
        const { dirname } = options;
        const groups = await cliOption.get('groups');
        if (!groups) return;
        const groupsList = groups[group.name];
        const itemsList = groupsList.items;
        existsOrMkdir(dirname!);
        for (const filename in itemsList) {
            const {
                path: { absolute },
            } = itemsList[filename];
            const fileNameObject = path.parse(absolute);
            fs.writeFileSync(path.join(dirname!, `${fileNameObject.name}.${fileNameObject.ext}`), files[filename].content!);
        }
    }
}

// async function main() {
//     const group = new ZipGroup('foo', resolveRoot('tmp/foo'));
//     await addGroup(group);
//     const item = new FileItem('bar', resolveRoot('./package.json'));
//     await addItem(group, item);
//     console.log(group.toString());

//     restoreFiles(group, {
//         flat: true,
//         dirname: resolveRoot('./tmp/dir'),
//     });
// }

// main();

class GroupAction {
    constructor(public options: GroupActionOption) {}
    async add() {
        if (!this.options.filename) {
            return console.log('--filename Unknown');
        }
        const group = new ZipGroup(this.options.name, resolveRoot(this.options.filename));
        await store(group);
    }
    async del() {
        const name = this.options.name;
        const groups = (await cliOption.get('groups')) || {};

        if (!(name in groups)) {
            console.log(`"${name}" 不存在`);
            return;
        }

        delete groups[name];

        cliOption.set('groups', groups);
    }
    async view() {
        const name = this.options.name;
        const groupOption = await GroupAction.find(name);

        if (!groupOption) {
            console.log(`"${name}" 不存在`);
            return;
        }

        const group = ZipGroup.restore(groupOption);

        console.log(group.toString());
    }

    async mod(name: string, option: Partial<GroupOption>) {
        const groupOption = await GroupAction.find(name);
        if (!groupOption) {
            console.log(`"${name}" 不存在`);
            return;
        }
        const group = ZipGroup.restore(groupOption);

        Object.assign(group, groupOption);
    }

    static async find(name: string) {
        const groups = (await cliOption.get('groups'))!;
        if (!(name in groups)) {
            return;
        }
        return groups[name];
    }
}
class ItemAction {
    constructor(public options: ItemActionOption) {}

    async add() {
        const { options } = this;
        const groupOption = await GroupAction.find(options.group);

        if (!groupOption) {
            return console.log(`${options.group} 不存在`);
        }

        if (!options.filename) {
            return console.log(`--filename unknown`);
        }

        const item = new FileItem(options.name, resolveRoot(options.filename));
        const group = ZipGroup.restore(groupOption);
        await group.add(item);
        await store(group);
    }
    async del() {
        const { options } = this;
        const groupOption = await GroupAction.find(options.group);

        if (!groupOption) {
            return console.log(`${options.group} 不存在`);
        }
        const group = ZipGroup.restore(groupOption);
        const item = await ItemAction.find(groupOption, options.name);
        if (!item) return;
        await group.del(FileItem.restore(item));
        await store(group);
    }

    async view() {
        const { options } = this;

        const groupOption = await GroupAction.find(options.group);

        if (!groupOption) {
            return console.log(`${options.group} 不存在`);
        }

        const itemOption = await ItemAction.find(groupOption, options.name);
        if (!itemOption) return;
        const item = FileItem.restore(itemOption);
        console.log(item.toString());
    }

    async mod(groupOption: GroupOption, name: string) {}

    static async find(group: GroupOption, name: string) {
        if (!(name in group.items)) {
            return;
        }

        const itemOption = group.items[name];

        return itemOption;
    }
}

interface CLIOption {
    type: 'group' | 'item';
    action: 'add' | 'del' | 'view';
}

interface GroupActionOption extends CLIOption {
    type: 'group';
    name: string;
    filename?: string;
}

interface ItemActionOption extends CLIOption {
    type: 'item';
    name: string;
    filename?: string;
    group: string;
}

type CLIOptionObj = GroupActionOption | ItemActionOption;

class Main {
    runner!: ItemAction | GroupAction;
    constructor(public options: CLIOptionObj) {
        console.log(options);
        switch (options.type) {
            case 'group':
                this.runner = new GroupAction(options);
                break;
            case 'item':
                this.runner = new ItemAction(options);
                break;
        }
        switch (options.action) {
            case 'add':
                this.add();
                break;
            case 'del':
                this.del();
                break;
            case 'view':
                this.view();
                break;
        }
    }

    async add() {
        await this.runner.add();
    }
    async del() {
        await this.runner.del();
    }
    async view() {
        await this.runner.view();
    }
}

command.parse();
