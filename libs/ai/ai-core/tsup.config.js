"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsup_1 = require("tsup");
exports.default = (0, tsup_1.defineConfig)({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    splitting: true,
    sourcemap: true,
    clean: true,
    minify: true,
    treeshake: true,
    external: ['react'],
    esbuildOptions(options) {
        options.banner = {
            js: '"use client";',
        };
    },
});
