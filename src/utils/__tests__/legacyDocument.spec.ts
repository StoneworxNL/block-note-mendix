import { isLegacyFlatDocument, migrateLegacyFlatDocument } from "../legacyDocument";

// The serializer of the Marketplace releases up to 2.1.x (src/typescript/flatten.ts,
// removed in 2.2.0), kept here verbatim apart from deterministic ids so that the
// fixtures are exactly what those versions wrote to the attribute.
let nextId = 0;
const generateId = (): string => `c${++nextId}`;

function flattenContent(content: any, contentId: string | null = null, result: any[] = []): any[] {
    if (Array.isArray(content)) {
        for (const item of content) {
            const { content: children, ...rest } = item;
            const id = generateId();
            result.push({ id, ...rest, parentContent: contentId });

            if (Array.isArray(children) && children.length > 0) {
                flattenContent(children, id, result);
            }
        }
    }

    return result;
}

function flattenBlocks(blocks: any[], parentId: string | null = null, result: any[] = []): any[] {
    for (const block of blocks) {
        const { children, content, ...rest } = block;
        result.push({ ...rest, parentId, content: flattenContent(content) });

        if (Array.isArray(children) && children.length > 0) {
            flattenBlocks(children, block.id, result);
        }
    }

    return result;
}

const PROPS = { textColor: "default", backgroundColor: "default", textAlignment: "left" };

const text = (value: string, styles: Record<string, unknown> = {}): any => ({ type: "text", text: value, styles });

const block = (id: string, type: string, content: any, children: any[] = [], props: any = PROPS): any => ({
    id,
    type,
    props,
    content,
    children
});

const nestedList = [
    block(
        "1",
        "bulletListItem",
        [text("Fruit")],
        [
            block("2", "bulletListItem", [text("Apple")], [block("3", "bulletListItem", [text("Granny Smith")])]),
            block("4", "bulletListItem", [text("Pear")])
        ]
    ),
    block("5", "numberedListItem", [text("After the list")])
];

const styledLink = [
    block("10", "paragraph", [
        text("See "),
        {
            type: "link",
            href: "https://www.blocknotejs.org",
            content: [text("the docs", { bold: true }), text(" here", { italic: true, textColor: "red" })]
        },
        text(" for more.", { underline: true })
    ])
];

const table = [
    block(
        "20",
        "table",
        {
            type: "tableContent",
            columnWidths: [undefined, undefined],
            rows: [{ cells: [[text("A1")], [text("B1")]] }]
        },
        [],
        { textColor: "default" }
    ),
    block("21", "paragraph", [text("Below the table")])
];

describe("legacy documents saved by 2.1.x", () => {
    beforeEach(() => {
        nextId = 0;
    });

    describe("isLegacyFlatDocument", () => {
        it("recognises the flat shape", () => {
            expect(isLegacyFlatDocument(flattenBlocks(nestedList))).toBe(true);
            // Even a single top-level paragraph carried parentId: null.
            expect(isLegacyFlatDocument(flattenBlocks([block("1", "paragraph", [text("Hi")])]))).toBe(true);
        });

        it("leaves documents in BlockNote's own shape alone", () => {
            expect(isLegacyFlatDocument(nestedList)).toBe(false);
            expect(isLegacyFlatDocument(styledLink)).toBe(false);
            expect(isLegacyFlatDocument(table)).toBe(false);
            expect(isLegacyFlatDocument([])).toBe(false);
            expect(isLegacyFlatDocument(["not a block", null, 42])).toBe(false);
        });
    });

    describe("migrateLegacyFlatDocument", () => {
        it("rebuilds nested lists", () => {
            expect(migrateLegacyFlatDocument(flattenBlocks(nestedList))).toEqual(nestedList);
        });

        it("rebuilds link text and keeps the text styles", () => {
            expect(migrateLegacyFlatDocument(flattenBlocks(styledLink))).toEqual(styledLink);
        });

        it("rebuilds a document that mixes nesting, links and styles", () => {
            const mixed = [
                block("30", "heading", [text("Title", { bold: true })], [], { ...PROPS, level: 1 }),
                block(
                    "31",
                    "bulletListItem",
                    [{ type: "link", href: "https://mendix.com", content: [text("Mendix")] }],
                    [
                        block(
                            "32",
                            "bulletListItem",
                            [text("child", { code: true })],
                            [block("33", "checkListItem", [text("grandchild")], [], { ...PROPS, checked: true })]
                        )
                    ]
                ),
                block("34", "paragraph", [text("tail")])
            ];

            expect(migrateLegacyFlatDocument(flattenBlocks(mixed))).toEqual(mixed);
        });

        it("keeps blocks after a table and marks the table whose rows were never saved", () => {
            const migrated = migrateLegacyFlatDocument(flattenBlocks(table));

            expect(migrated).toHaveLength(2);
            expect(migrated[0]).toMatchObject({
                id: "20",
                type: "paragraph",
                content: [{ type: "text", text: "[A table here could not be recovered.]" }]
            });
            expect(migrated[1]).toEqual(table[1]);
        });

        it("drops the empty content array of blocks that have no inline content", () => {
            const image = block("40", "image", undefined, [], { url: "https://example.com/a.png", caption: "" });
            const [migrated] = migrateLegacyFlatDocument(flattenBlocks([image]));

            expect(migrated).toEqual({ id: "40", type: "image", props: image.props, children: [] });
        });

        it("reads the stored 2.1.x JSON exactly as it was written", () => {
            const stored = [
                {
                    id: "a",
                    type: "bulletListItem",
                    props: PROPS,
                    parentId: null,
                    content: [{ id: "x1", type: "text", text: "Parent", styles: {}, parentContent: null }]
                },
                {
                    id: "b",
                    type: "bulletListItem",
                    props: PROPS,
                    parentId: "a",
                    content: [
                        { id: "x2", type: "link", href: "https://example.com", parentContent: null },
                        { id: "x3", type: "text", text: "child link", styles: { bold: true }, parentContent: "x2" }
                    ]
                }
            ];

            expect(migrateLegacyFlatDocument(stored)).toEqual([
                {
                    id: "a",
                    type: "bulletListItem",
                    props: PROPS,
                    content: [text("Parent")],
                    children: [
                        {
                            id: "b",
                            type: "bulletListItem",
                            props: PROPS,
                            content: [
                                {
                                    type: "link",
                                    href: "https://example.com",
                                    content: [text("child link", { bold: true })]
                                }
                            ],
                            children: []
                        }
                    ]
                }
            ]);
        });

        it("keeps orphaned blocks and text instead of dropping them", () => {
            const stored = [
                { id: "a", type: "paragraph", props: PROPS, parentId: "missing", content: [] },
                {
                    id: "b",
                    type: "paragraph",
                    props: PROPS,
                    parentId: null,
                    content: [{ id: "x", type: "text", text: "orphan", styles: {}, parentContent: "gone" }]
                }
            ];

            const migrated = migrateLegacyFlatDocument(stored);

            expect(migrated.map(b => b.id)).toEqual(["a", "b"]);
            expect(migrated[1].content).toEqual([text("orphan")]);
        });

        it("keeps blocks whose parents form a cycle instead of dropping them", () => {
            const stored = [
                { id: "r", type: "paragraph", props: PROPS, parentId: null, content: [] },
                { id: "a", type: "paragraph", props: PROPS, parentId: "b", content: [] },
                { id: "b", type: "paragraph", props: PROPS, parentId: "a", content: [] },
                { id: "c", type: "paragraph", props: PROPS, parentId: "c", content: [] },
                { id: "d", type: "paragraph", props: PROPS, parentId: "e", content: [] },
                { id: "e", type: "paragraph", props: PROPS, parentId: "f", content: [] },
                { id: "f", type: "paragraph", props: PROPS, parentId: "d", content: [] }
            ];

            const tree = (blocks: any[]): any[] => blocks.map(b => [b.id, tree(b.children)]);

            expect(tree(migrateLegacyFlatDocument(stored))).toEqual([
                ["r", []],
                ["a", [["b", []]]],
                ["c", []],
                ["d", [["f", [["e", []]]]]]
            ]);
        });

        it("keeps inline items whose parents form a cycle instead of dropping them", () => {
            const stored = [
                {
                    id: "p",
                    type: "paragraph",
                    props: PROPS,
                    parentId: null,
                    content: [
                        { id: "x", type: "link", href: "https://a.example", parentContent: "y" },
                        { id: "y", type: "link", href: "https://b.example", parentContent: "x" },
                        { id: "z", type: "text", text: "kept", styles: {}, parentContent: "z" }
                    ]
                }
            ];

            expect(migrateLegacyFlatDocument(stored)[0].content).toEqual([
                text("https://a.example"),
                text("https://b.example"),
                text("kept")
            ]);
        });

        it("turns a link whose text was lost into its URL as plain text", () => {
            const stored = [
                {
                    id: "a",
                    type: "paragraph",
                    props: PROPS,
                    parentId: null,
                    content: [{ id: "x", type: "link", href: "https://example.com", parentContent: null }]
                }
            ];

            expect(migrateLegacyFlatDocument(stored)[0].content).toEqual([text("https://example.com")]);
        });
    });
});
