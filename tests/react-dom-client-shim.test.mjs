// The Mendix client registers "react-dom" but not "react-dom/client", so
// rollup.config.mjs points @blocknote/react's `react-dom/client` import at a shim
// over the host's react-dom. On React 18 (Mendix 10) that has createRoot and
// hydrateRoot; on React 19 (Mendix 11.12) it does not.
//
// These tests pin two things:
// 1. The shim passes real functions through on React 18 and fails with a clear
//    error, not `undefined`, on React 19.
// 2. The widget does not use the only BlockNote APIs that call createRoot
//    (createReact*Spec, which call it for headless editors), so the React 19
//    gap is never hit. If one of them is added, this test fails and the shim
//    needs a real createRoot first.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { REACT_DOM_CLIENT_SHIM_CODE } from "../rollup.config.mjs";

const toDataUrl = code => `data:text/javascript,${encodeURIComponent(code)}`;

// Loads the shim with "react-dom" replaced by a stand-in module.
async function loadShim(reactDomModuleCode) {
    const code = REACT_DOM_CLIENT_SHIM_CODE.replace('from "react-dom"', `from "${toDataUrl(reactDomModuleCode)}"`);
    assert.notEqual(code, REACT_DOM_CLIENT_SHIM_CODE, 'the shim no longer imports from "react-dom"');
    return import(toDataUrl(code));
}

test("React 18 host: createRoot and hydrateRoot are the host's own functions", async () => {
    const shim = await loadShim(`
        export const version = "18.2.0";
        export function createRoot() { return "host-createRoot"; }
        export function hydrateRoot() { return "host-hydrateRoot"; }
    `);
    assert.equal(shim.createRoot(), "host-createRoot");
    assert.equal(shim.hydrateRoot(), "host-hydrateRoot");
});

test("React 19 host: createRoot and hydrateRoot throw a clear error instead of being undefined", async () => {
    // Shape of React 19's react-dom entry: createPortal, flushSync, ... but no roots.
    const shim = await loadShim(`
        export const version = "19.2.3";
        export function createPortal() {}
        export function flushSync() {}
    `);
    assert.equal(typeof shim.createRoot, "function");
    assert.equal(typeof shim.hydrateRoot, "function");
    assert.throws(() => shim.createRoot(), /react-dom\/client createRoot is not available.*19\.2\.3/);
    assert.throws(() => shim.hydrateRoot(), /react-dom\/client hydrateRoot is not available/);
});

test("the widget does not use the BlockNote APIs that need react-dom/client", () => {
    const srcDir = fileURLToPath(new URL("../src", import.meta.url));
    const files = [];
    const walk = dir => {
        for (const name of readdirSync(dir)) {
            const path = join(dir, name);
            if (statSync(path).isDirectory()) {
                if (name !== "__tests__") walk(path);
            } else if (/\.(ts|tsx)$/.test(name)) {
                files.push(path);
            }
        }
    };
    walk(srcDir);
    assert.ok(files.length > 0, "no widget sources found");

    const offending = files.filter(file =>
        /createReact(Block|InlineContent|Style)Spec|ServerBlockNoteEditor|headless\s*:/.test(readFileSync(file, "utf8"))
    );
    assert.deepEqual(offending, [], "these need a real createRoot, which React 19 Mendix hosts do not provide");
});
