import { defineConfig, ModuleFormat } from 'rollup';
import path from 'path';
import TypescriptPlugin from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolver from '@rollup/plugin-node-resolve';
import { rollup } from 'rollup';

const resolveRoot = (filename: string) => path.join(process.cwd(), filename);

function createConfig(name: ModuleFormat) {
    return defineConfig({
        input: {
            index: resolveRoot('src/index.ts'),
        },
        output: {
            dir: './dist/',
            format: name,
        },
        external: ['os', 'fs', 'path', 'console'],
        plugins: [
            TypescriptPlugin(),
            commonjs(),
            resolver(),
        ],
        treeshake: false,
    });
}

const config = createConfig('commonjs');

rollup(config)
    .then(async res => {
        const outputList = Array.isArray(config.output) ? config.output : config.output ? [config.output] : [];
        for (const output of outputList) {
            console.log(output.dir, output.file || config.input, 'building');
            await res.write(output);
            console.log(output.name || output.file);
            console.log('completed');
        }
        console.log('all output complete ...');
    })
    .catch(err => {
        throw err;
    });
