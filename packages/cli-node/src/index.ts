import { fetchPlatform, Platform, Group, Item, FileResource, JSONStorage, ItemOption, GroupOption } from '@config-mode/core';
import path from 'path';
import { program, Command, Option } from 'commander';

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

const appendOptions = {
    command: 'append',
    group: 'foo',
    file: './package.json',
    name: 'package',
};

const deleteOptions = {
    command: 'delete',
    group: 'foo',
    file: './package.json',
    name: 'package',
};

const updateOptions = {
    command: 'update',
    group: 'foo',
    file: './package.json',
    name: 'package',
};

const viewOptions = {
    command: 'view',
    group: 'foo',
    file: './package.json',
    name: 'package',
};

const resolveRoot = (filename: string) => path.join(process.cwd(), filename);
const cliOption = new CliMainfest(resolveRoot('./config-mode.json'));

const validGroupInGroups = (groups: CliMainfestOption['groups'], group: GroupOption['name']) => group in groups;
const validItemInItems = (items: GroupOption['items'], item: ItemOption['name']) => item in items;

async function main() {
    console.log(await cliOption.get('groups'));
    const result = (await cliOption.get('groups')) || ({} as CliMainfestOption['groups']);
    for (const operation of [appendOptions, deleteOptions, updateOptions, viewOptions]) {
        const { group, name, command, file } = operation;
        switch (command) {
            case 'append':
                const item = new Item(path.isAbsolute(file) ? file : resolveRoot(file), { name });
                const groupOption = result[group];
                const groupInstance = Group.restore({ ...groupOption, items: Object.values(groupOption.items) });

                (await groupInstance).appendItem(item);
                cliOption.set('groups', {
                    ...(await cliOption.get('groups')),
                    [groupOption.name]: {
                        ...groupOption,
                        items: {
                            ...groupOption.items,
                            [item.name]: {
                                filename: item.filename,
                                name: item.name,
                            },
                        },
                    },
                });
                // cliOption.get('group')
                break;
            case 'delete':
                if (validGroupInGroups(result, group)) {
                }

            case 'update':
            case 'view':
        }
    }
}

// [appendOptions, deleteOptions, updateOptions, viewOptions].map(async operation => {});
// main();
try {
    const command = program.name('config-mode').description('配置文件在不同的文件之中').version('0.0.1');

    command.commands.push(
        new Command('group')
            .description('操作 group')
            .argument('<action>', 'add | delete | view')
            .requiredOption('-n | --name <name>', '')
            .action(async (action, option) => {
                const groups = await cliOption.get('groups');
                const { name } = option;
                switch (action) {
                    case 'add': {
                        const group = new Group(name);
                        cliOption.set('groups', {
                            ...groups,
                            [group.name]: group.toJSON(),
                        });
                        break;
                    }
                    case 'delete': {
                        if (!groups || !(name in groups)) {
                            console.log(`"${name}" 不存在`);
                            break;
                        }
                        delete groups[name];
                        cliOption.set('groups', groups);
                        break;
                    }
                    case 'view': {
                        if (!groups || !(name in groups)) {
                            console.log(`"${name}" 不存在`);
                            break;
                        }
                        const group = groups[name];

                        const groupItem = await Group.restore({ ...group, items: Object.values(group.items) });

                        console.log(groupItem.toString());
                    }
                }
            })
    );

    command.commands.push(
        new Command('item')
            .description('操作 item')
            .argument('<action>', 'add | delete | view')
            .requiredOption('-g | --group <name>', '组 名称')
            .requiredOption('-n | --name <name>', 'Item 名称')
            .option('-f | --file <path>', '文件位置')
            .action(async (action, option) => {
                const groups = await cliOption.get('groups');
                const { name, file, group } = option;
                if (!groups || !(group in groups)) {
                    console.log(`"${group}" 不存在`);
                    return;
                }
                const groupOption = groups[group];
                const groupInstance = await Group.restore({ ...groupOption, items: Object.values(groupOption.items) });
                switch (action) {
                    case 'add': {
                        const item = new Item(file, { name });
                        await groupInstance.appendItem(item);
                        cliOption.set('groups', { ...groups, [group]: groupInstance.toJSON() });
                        console.log(groupInstance.toString());
                        break;
                    }
                    case 'delete': {
                        if (!(name in groupOption.items)) {
                            console.log(`item "${name}" 未找到`);
                            break;
                        }
                        groupInstance.removeItem(name);
                        cliOption.set('groups', { ...groups, [group]: groupInstance.toJSON() });
                        console.log(groupInstance.toString());
                        break;
                    }
                    case 'view': {
                        if (!(name in groupOption.items)) {
                            console.log(`item "${name}" 未找到`);
                            break;
                        }
                        console.log(Item.restore(groupOption.items[name]).toString());
                        break;
                    }
                }
            })
    );

    command.parse();
} catch (error) {
    console.log(error);
}
