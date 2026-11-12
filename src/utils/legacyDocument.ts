// Documents saved by the Marketplace releases up to 2.1.x were not stored in
// BlockNote's own JSON shape. That save path flattened the tree before writing
// it, and nothing reversed the flattening on load:
//
// - Every block was written as a top-level entry with a `parentId` (null at
//   the root, the parent block's id for nested blocks) instead of `children`.
// - Every inline item was written as a flat entry with a fresh `id` and a
//   `parentContent` (null at the top, the parent item's id inside a link)
//   instead of a nested `content` array. Text styles survived in that shape.
// - A table's content is an object rather than an array, so it was written as
//   an empty array: the rows of those tables were never stored.
//
// Loading such a document straight into BlockNote either fails (a link with no
// text, a table with no rows) or silently flattens nested lists, and the next
// save makes that permanent. This module turns it back into a normal document.

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const has = (value: JsonObject, key: string): boolean => Object.prototype.hasOwnProperty.call(value, key);

// Block types whose content was not an inline-content array and therefore came
// back from the old save path as an empty array.
const TABLE_BLOCK = "table";

/**
 * True when the stored blocks were written by the pre-2.2.0 save path. The old
 * serializer put `parentId` on every block, so its presence on any top-level
 * block is the marker; `parentContent` on inline items covers documents that
 * were edited by hand afterwards.
 */
export function isLegacyFlatDocument(blocks: unknown[]): boolean {
    return blocks.some(
        block =>
            isObject(block) &&
            (has(block, "parentId") ||
                (Array.isArray(block.content) &&
                    block.content.some(item => isObject(item) && has(item, "parentContent"))))
    );
}

/**
 * Rebuilds the nested inline content of one block. Keeps every field of an
 * item (type, text, href, styles, ...) apart from the two bookkeeping keys the
 * old serializer added.
 */
function unflattenContent(flatContent: unknown[]): JsonObject[] {
    const items = new Map<string, JsonObject>();
    const roots: JsonObject[] = [];
    const ordered: Array<{ item: JsonObject; parent: unknown }> = [];

    for (const entry of flatContent) {
        if (!isObject(entry)) {
            continue;
        }

        const { id, parentContent, ...rest } = entry;
        const item: JsonObject = { ...rest };

        // A link carries its text as nested content; give it an array to fill.
        if (item.type === "link" && !Array.isArray(item.content)) {
            item.content = [];
        }

        if (typeof id === "string") {
            items.set(id, item);
        }

        ordered.push({ item, parent: parentContent });
    }

    for (const { item, parent } of ordered) {
        const owner = typeof parent === "string" ? items.get(parent) : undefined;

        if (owner && Array.isArray(owner.content)) {
            (owner.content as JsonObject[]).push(item);
        } else {
            // No parent, or a parent that is missing: keep the item rather than
            // dropping the user's text.
            roots.push(item);
        }
    }

    // A link whose text was lost entirely would be rejected by BlockNote; keep
    // the URL readable as plain text instead.
    return roots.map(item =>
        item.type === "link" && Array.isArray(item.content) && item.content.length === 0
            ? { type: "text", text: typeof item.href === "string" ? item.href : "", styles: {} }
            : item
    );
}

/**
 * Turns a document written by the pre-2.2.0 save path back into BlockNote's
 * own nested shape. Block ids, types, props and text styles are kept; the
 * order of the flat list (parents before their children) is the order of the
 * tree.
 */
export function migrateLegacyFlatDocument(flatBlocks: unknown[]): JsonObject[] {
    const blocks = new Map<string, JsonObject>();
    const roots: JsonObject[] = [];
    const ordered: Array<{ block: JsonObject; parent: unknown }> = [];

    for (const entry of flatBlocks) {
        if (!isObject(entry)) {
            continue;
        }

        // Any `children` the entry carries is replaced by the rebuilt tree.
        const { parentId, content, ...rest } = entry;
        const block: JsonObject = { ...rest, children: [] };

        if (Array.isArray(content) && content.length > 0) {
            block.content = unflattenContent(content);
        } else if (content !== undefined && !Array.isArray(content)) {
            // Not written by the old serializer (it only wrote arrays); keep it.
            block.content = content;
        }
        // An empty array is left out: blocks without inline content (images,
        // files) never had any, and an empty paragraph or heading is filled in
        // by BlockNote.

        if (block.type === TABLE_BLOCK && block.content === undefined) {
            // The rows were never saved, so there is nothing to rebuild. Say so
            // in the document instead of refusing to open it.
            block.type = "paragraph";
            block.props = {};
            block.content = [
                { type: "text", text: "[A table here could not be recovered.]", styles: { italic: true } }
            ];
        }

        if (typeof block.id === "string") {
            blocks.set(block.id, block);
        }

        ordered.push({ block, parent: parentId });
    }

    for (const { block, parent } of ordered) {
        const owner = typeof parent === "string" ? blocks.get(parent) : undefined;

        if (owner && owner !== block) {
            (owner.children as JsonObject[]).push(block);
        } else {
            roots.push(block);
        }
    }

    return roots;
}
