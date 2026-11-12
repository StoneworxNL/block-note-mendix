// Runs the real BlockNote editor (not the jest mock) under jsdom and checks that
// a stored link can never become a clickable script. The stored JSON comes from
// a Mendix attribute that any microflow or import can write, and other users
// render it, so this is the widget's XSS boundary.
//
// BlockNote's link mark blanks the href of anything outside its allowlist
// (http, https, mailto, tel, ... and relative URLs) when it renders, and its
// "Open link" button maps javascript: to "#". This test pins that behaviour so
// a BlockNote upgrade that changes it fails CI instead of shipping.
//
// Plain node:test instead of jest: @blocknote/core is ESM-only and does not
// load under the jest setup (see jest.config.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id=root></div></body></html>", {
    url: "https://app.example/"
});

for (const key of [
    "window",
    "document",
    "navigator",
    "Node",
    "HTMLElement",
    "HTMLAnchorElement",
    "Element",
    "DocumentFragment",
    "MutationObserver",
    "getComputedStyle",
    "DOMParser",
    "Range",
    "Text"
]) {
    try {
        globalThis[key] = dom.window[key];
    } catch {
        // navigator is read-only on newer Node versions; jsdom's is not needed.
    }
}

const { BlockNoteEditor } = await import("@blocknote/core");

const linkDocument = hrefs =>
    hrefs.map(href => ({
        type: "paragraph",
        content: [{ type: "link", href, content: [{ type: "text", text: "link", styles: {} }] }]
    }));

const renderedHrefs = hrefs => {
    const root = document.getElementById("root");
    root.innerHTML = "";
    const editor = BlockNoteEditor.create({ initialContent: linkDocument(hrefs) });
    editor.mount(root);
    const result = [...root.querySelectorAll('a[data-inline-content-type="link"]')].map(a => a.getAttribute("href"));
    editor.unmount();
    return { editor, result };
};

const UNSAFE = [
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    " java\tscript:alert(1)",
    "vbscript:msgbox(1)",
    "data:text/html,<script>alert(1)</script>"
];

const SAFE = [
    "https://www.blocknotejs.org",
    "http://example.com/a?b=c",
    "mailto:someone@example.com",
    "tel:+31201234567",
    "/relative/path",
    "#anchor"
];

test("links with a script or data URL are rendered without an href", () => {
    const { result } = renderedHrefs(UNSAFE);
    assert.deepEqual(
        result,
        UNSAFE.map(() => "")
    );
});

test("ordinary links keep their href", () => {
    const { result } = renderedHrefs(SAFE);
    assert.deepEqual(result, SAFE);
});

test("HTML export does not carry a script URL either", async () => {
    const editor = BlockNoteEditor.create({ initialContent: linkDocument(UNSAFE) });
    const html = await editor.blocksToHTMLLossy(editor.document);
    assert.doesNotMatch(html, /script:|data:/i);
});
