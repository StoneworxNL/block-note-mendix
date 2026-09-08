import { ReactElement, useEffect, useState, useMemo } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteSaveToolbar } from "./BlockNoteSaveToolbar";
import { ActionValue, EditableValue } from "mendix";
import "@blocknote/core/fonts/inter.css";
// These three are what "@blocknote/mantine/style.css" pulls in on its own, in the
// same cascade order. They are imported separately because its nested
// `@import url("@blocknote/react/style.css")` only resolves through the package
// exports map, which postcss-import cannot follow (rollup's node-resolve can).
// See the matching plugin in rollup.config.js, which drops the nested @imports.
import "@blocknote/mantine/style.css";
import "@blocknote/react/style.css";
import "@blocknote/mantine/blocknoteStyles.css";

export interface BlockNoteProps {
    jsonPayload: EditableValue<string>;
    saveAction?: ActionValue;
    isEditable: boolean;
    themeEnum: string;
    /*// Blocks data source props
    blocksDataSource: ListValue;
    blockId: ListAttributeValue<string>;
    blockType: ListAttributeValue<string>;
    // Content item data source props
    contentItemDataSource: ListValue;
    contentItemAssociation: ListReferenceValue;*/
}

// A record that has never been saved has no stored JSON yet, so the editor
// starts on a single empty paragraph. Kept as a literal rather than a JSON
// string so that the fallback path itself can never throw.
const EMPTY_DOCUMENT: PartialBlock[] = [
    {
        type: "paragraph",
        props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
        content: [],
        children: []
    }
];

type LoadState =
    | { state: "loading" }
    | { state: "ready"; content: PartialBlock[] }
    | { state: "unreadable" };

// The payload is an ordinary Mendix string attribute, so a microflow, an import
// mapping or an older build of this widget can leave anything at all in it.
// Nothing in here may throw: this runs on the way into render, and an exception
// escaping it takes down the whole surrounding Mendix page, not just the editor.
function readStoredDocument(raw: string): LoadState {
    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch {
        console.error("BlockNote: stored value is not valid JSON, refusing to load it.");
        return { state: "unreadable" };
    }

    if (!Array.isArray(parsed)) {
        console.error("BlockNote: stored value is not an array of blocks, refusing to load it.");
        return { state: "unreadable" };
    }

    // BlockNote rejects a genuinely empty array. An empty array holds no user
    // content either way, so opening a fresh document instead loses nothing.
    return {
        state: "ready",
        content: parsed.length > 0 ? (parsed as PartialBlock[]) : EMPTY_DOCUMENT
    };
}

export function BlockNoteWrapper({ jsonPayload, saveAction, isEditable, themeEnum }: BlockNoteProps): ReactElement {

    const [load, setLoad] = useState<LoadState>({ state: "loading" });

    // Loads stored editor contents (https://www.blocknotejs.org/examples/backend/saving-loading)

    useEffect(() => {
        if (jsonPayload && jsonPayload.status === "available" && load.state === "loading") {
            setLoad(
                jsonPayload.value
                    ? readStoredDocument(jsonPayload.value.toString())
                    : { state: "ready", content: EMPTY_DOCUMENT }
            );
        }
    }, [jsonPayload]);

    // Creates a new editor instance.
    // We use useMemo + BlockNoteEditor.create instead of useCreateBlockNote so we
    // can delay the creation of the editor until the initial content is loaded.
    //
    // create() validates the blocks and throws on anything it cannot represent,
    // so it needs catching too - a well-formed JSON array can still be rejected.
    // Documents written by the pre-fix save path are the common case: their
    // links and tables were stored with empty content, which create() rejects.

    const editor = useMemo(() => {
        if (load.state !== "ready") {
            return undefined;
        }

        try {
            return BlockNoteEditor.create({ initialContent: load.content });
        } catch (error) {
            console.error("BlockNote: stored document could not be opened.", error);
            return "unreadable" as const;
        }
    }, [load]);

    if (load.state === "unreadable" || editor === "unreadable") {
        // Deliberately renders neither the editor nor the save toolbar. Falling
        // back to an empty document would look like recovery, but the next Save
        // would then overwrite content that is still sitting intact in the
        // attribute and can be repaired.
        return (
            <div className={'blocknote-mendix-wrapper blocknote-mx-' + themeEnum}>
                <div className="blocknote-load-error" role="alert">
                    This content could not be opened. It has been left unchanged so that it can be recovered.
                </div>
            </div>
        );
    }

    if (editor === undefined) {
        return <div>Loading content...</div>;
    }

    // Renders the editor instance.

    return (
        <div className={'blocknote-mendix-wrapper blocknote-mx-' + themeEnum}>
            {isEditable && (
                <BlockNoteSaveToolbar 
                    jsonPayload={jsonPayload}
                    saveAction={saveAction}
                    editor={editor}
                />
            )}
            <BlockNoteView
                editor={editor}
                editable={isEditable}
                theme={themeEnum === 'light' ? 'light' : 'dark'}
            />
        </div>
    );
    
}
































/*
import { ReactElement, createElement, useEffect, useState, useMemo } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteSaveToolbar } from "./BlockNoteSaveToolbar";
import { ActionValue, EditableValue } from "mendix";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

export interface BlockNoteProps {
    jsonAttribute: EditableValue<string>;
    saveAction?: ActionValue;
    isEditable: boolean;
    themeEnum: string;
}

export function BlockNoteWrapper({ jsonAttribute, saveAction, isEditable, themeEnum }: BlockNoteProps): ReactElement {
    
    const defaultContent = '[{"type": "paragraph","props": {"textColor": "default","backgroundColor": "default","textAlignment": "left"},"content": [],"children": []}]';
    const [initialContent, setInitialContent] = useState<PartialBlock[] | undefined | "loading">("loading");

    // Loads stored editor contents (https://www.blocknotejs.org/examples/backend/saving-loading)
    useEffect(() => {
        if (jsonAttribute.status === "available") {
            setInitialContent((jsonAttribute.value
                ? JSON.parse(jsonAttribute.value.toString())
                : JSON.parse(defaultContent)) as PartialBlock[]);
        }
    }, [jsonAttribute]);

    // Creates a new editor instance.
    // We use useMemo + createBlockNoteEditor instead of useCreateBlockNote so we
    // can delay the creation of the editor until the initial content is loaded.
    const editor = useMemo(() => {
        if (initialContent === "loading")
            return undefined;
    
        return BlockNoteEditor.create({ initialContent });
    }, [initialContent]);

    if (editor === undefined) {
        return <div>Loading content...</div>;
    }

    // Renders the editor instance.
    return (
        <div className={'blocknote-mendix-wrapper blocknote-mx-' + themeEnum}>
            {isEditable && (
                <BlockNoteSaveToolbar 
                    jsonAttribute={jsonAttribute}
                    saveAction={saveAction}
                    editor={editor}
                />
            )}
            <BlockNoteView
                editor={editor}
                editable={isEditable}
                theme={themeEnum === 'light' ? 'light' : 'dark'}
            />
        </div>
    );
}
*/