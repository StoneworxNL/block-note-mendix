const { join } = require("path");

// The pluggable-widgets-tools config is the Mendix house setup (jsdom, ts-jest,
// CSS -> identity-obj-proxy, the mendix/* mocks). It is consumed as a base
// rather than through `pluggable-widgets-tools test:unit:web` because that
// command points jest at the tools' copy verbatim, leaving no way to add the
// browser APIs ProseMirror needs under jsdom.
const base = require("@mendix/pluggable-widgets-tools/test-config/jest.config.js");

// @blocknote/core resolves to its CommonJS build, but the yjs collaboration
// packages it pulls in are ESM-only and ship no CJS entry, so they have to be
// transformed rather than ignored like the rest of node_modules. The character
// class covers both path separators - jest matches these against native paths,
// which are backslash-separated on Windows.
const ESM_ONLY_DEPS = ["lib0", "yjs", "y-protocols", "y-prosemirror", "@y"];

module.exports = {
    ...base,
    rootDir: __dirname,
    testMatch: ["<rootDir>/src/**/*.spec.{js,jsx,ts,tsx}"],
    setupFilesAfterEnv: [...base.setupFilesAfterEnv, join(__dirname, "jest.setup.js")],
    transformIgnorePatterns: [`node_modules[\\/](?!(${ESM_ONLY_DEPS.join("|")})[\\/])`]
};
