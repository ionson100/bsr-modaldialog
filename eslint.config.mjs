import js from "@eslint/js";
import tseslint from "typescript-eslint";

const sharedGlobals = {
    console: "readonly",
    setTimeout: "readonly",
    clearTimeout: "readonly",
};

const browserGlobals = {
    window: "readonly",
    document: "readonly",
    navigator: "readonly",
    getComputedStyle: "readonly",
    MouseEvent: "readonly",
    KeyboardEvent: "readonly",
    Event: "readonly",
    HTMLElement: "readonly",
    Element: "readonly",
    Node: "readonly",
    Text: "readonly",
    MutationObserver: "readonly",
};

const nodeGlobals = {
    require: "readonly",
    module: "readonly",
    exports: "readonly",
    process: "readonly",
    __dirname: "readonly",
    global: "readonly",
};

export default tseslint.config(
    {
        ignores: ["dist/**", "node_modules/**", "coverage/**", "*.min.js"],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {jsx: true},
            },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": ["warn", {argsIgnorePattern: "^_"}],
            "no-empty": ["error", {allowEmptyCatch: true}],
        },
    },
    {
        files: ["**/*.{js,mjs,cjs}"],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
            globals: {...sharedGlobals, ...browserGlobals, ...nodeGlobals},
        },
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },
);
