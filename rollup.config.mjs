import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'src/index.ts', // Adjust this path if your entry file is different
    output: {
        file: 'dist/bundle.js',
        format: 'iife', // Immediately Invoked Function Expression format
        sourcemap: true
    },
    plugins: [
        resolve(),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' })
    ]
};
