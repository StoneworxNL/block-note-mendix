import json from "@rollup/plugin-json";

// Newer @tiptap/* packages (pulled in by @blocknote/core) ship already-compiled
// dist files that still carry a leftover `@jsxImportSource` pragma comment from
// their own build step, even though no real JSX syntax remains to transform.
// Mendix's babel config (@mendix/pluggable-widgets-tools) forces the *classic*
// JSX runtime for anything under node_modules, and Babel hard-errors as soon as
// it sees that pragma under classic mode - regardless of whether the file
// actually contains JSX. Stripping the dead pragma comment before Babel runs
// avoids the false-positive "importSource cannot be set when runtime is
// classic" build error.
const stripDeadJsxImportSourcePragma = {
    name: "strip-dead-jsx-import-source-pragma",
    transform(code) {
        if (!code.includes("@jsxImportSource")) {
            return null;
        }
        return {
            code: code.replace(/\/\*\*\s*@jsxImportSource[^*]*\*+\//g, ""),
            map: null
        };
    }
};

// @blocknote/react imports `createRoot` from "react-dom/client" (React 18+).
// The Mendix client registers "react-dom" as an AMD module but not the
// "react-dom/client" subpath, so leaving it external makes the loader try to
// fetch /mxclientsystem/react-dom/client.js at runtime and 404. Bundling a
// second copy of react-dom is not an option either - it would run a separate
// ReactDOM against the host's React.
//
// Instead, point the subpath at a one-line shim that re-exports from the plain
// "react-dom" module, which stays external and resolves to the host's copy.
// Mendix currently ships React 18.2.0, whose react-dom entry does export
// createRoot/hydrateRoot. React 19 removed them from that entry, so if Mendix
// ever ships React 19 this shim has to change.
const REACT_DOM_CLIENT_SHIM_ID = "\0react-dom-client-shim";

const shimReactDomClient = {
    name: "shim-react-dom-client",
    resolveId(source) {
        return source === "react-dom/client" ? REACT_DOM_CLIENT_SHIM_ID : null;
    },
    load(id) {
        return id === REACT_DOM_CLIENT_SHIM_ID
            ? 'export { createRoot, hydrateRoot } from "react-dom";'
            : null;
    }
};

// @blocknote/mantine's blocknoteStyles.css starts with
// `@import url("@blocknote/react/style.css")`. That specifier only resolves
// through the package's `exports` map (-> ./dist/style.css), and postcss-import
// cannot follow an exports map, so the build fails to find it.
//
// BlockNoteWrapper.tsx therefore imports the three stylesheets separately, in
// the same cascade order the single entry point would have produced. Rollup's
// node-resolve *can* follow the exports map, so each one resolves; this plugin
// drops the two nested @imports that would otherwise pull the same files in
// again through postcss-import.
const stripUnresolvableBlockNoteCssImports = {
    name: "strip-unresolvable-blocknote-css-imports",
    transform(code, id) {
        if (!id.endsWith(".css")) {
            return null;
        }

        const normalizedId = id.replace(/\\/g, "/");
        let patched = code;

        if (normalizedId.endsWith("@blocknote/mantine/src/style.css")) {
            patched = patched.replace(/@import\s+url\(\s*["']\.\/blocknoteStyles\.css["']\s*\);?/g, "");
        }

        if (normalizedId.endsWith("@blocknote/mantine/src/blocknoteStyles.css")) {
            patched = patched.replace(/@import\s+url\(\s*["']@blocknote\/react\/style\.css["']\s*\);?/g, "");
        }

        return patched === code ? null : { code: patched, map: null };
    }
};

export default args => {
    const baseConfig = args.configDefaultConfig;

    // Mendix Tools sometimes returns a single config or an array
    const configs = Array.isArray(baseConfig) ? baseConfig : [baseConfig];

    return configs.map(config => {
        // Clone to avoid mutating Mendix default config
        const cleaned = { ...config };

        // Forbidden by Rollup 4 at the top-level
        const forbiddenKeys = [
            "acorn",
            "acornInjectPlugins",
            "inlineDynamicImports",
            "manualChunks",
            "maxParallelFileReads",
            "preserveModules"
        ];

        // Ensure output is always an array
        const outputs = Array.isArray(cleaned.output)
            ? cleaned.output
            : [cleaned.output];

        // Move dynamic import settings into each output block. A Mendix widget is
        // loaded as a single file, so dynamic imports always have to be inlined -
        // without this Rollup 4 wants an "output.dir" for the extra chunks.
        outputs.forEach(out => {
            if (!out) return;

            out.inlineDynamicImports = cleaned.inlineDynamicImports ?? true;

            if (cleaned.manualChunks !== undefined) {
                out.manualChunks = cleaned.manualChunks;
            }
        });

        // Remove forbidden top-level Rollup 4 keys
        forbiddenKeys.forEach(k => {
            if (k in cleaned) delete cleaned[k];
        });

        // Ensure plugins array is present. These must run before Mendix's own
        // resolve/babel plugins, so they go first.
        cleaned.plugins = [
            shimReactDomClient,
            stripDeadJsxImportSourcePragma,
            stripUnresolvableBlockNoteCssImports,
            ...(cleaned.plugins ?? []),
            json()
        ];

        return cleaned;
    });
};