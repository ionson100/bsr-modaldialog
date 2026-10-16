import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import {dts} from "rollup-plugin-dts";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

const packageJson = require("./package.json");

// React (and everything it renders with) has to stay external: bundling it into
// the package duplicates the React instance in the consumer application, which
// breaks hooks in the dialog content ("Invalid hook call") and makes the dialog
// render nothing.
const external = [
    ...Object.keys(packageJson.peerDependencies || {}),
    ...Object.keys(packageJson.dependencies || {}),
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    /^react-dom\//,
    /^react-icons\//,
];

export default [

    {

        input: "src/index.ts",
        output: [
            {
                file: packageJson.main,
                format: "cjs",
                sourcemap: false,
                exports: "named",
            },
            {
                file: packageJson.module,
                format: "esm",
                sourcemap: false,
            },

        ],
        plugins: [

            resolve(),
            commonjs(),
            typescript({ tsconfig: "./tsconfig.json", declaration: false, declarationMap: false }),
            terser(),

        ],
        external,
    },
    {
        input: "dist/esm/index.d.ts",
        output: [{ file: "dist/index.d.ts", format: "es" }],
        plugins: [dts()],
        external: [/\.css$/], // telling rollup anything that is .css aren't part of type exports
    },
];
