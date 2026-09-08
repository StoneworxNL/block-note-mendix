import { CSSProperties, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteSaveToolbar } from "./BlockNoteSaveToolbar";
import { ActionValue, DynamicValue, EditableValue } from "mendix";
import classNames from "classnames";
import "@blocknote/core/fonts/inter.css";
// These three are what "@blocknote/mantine/style.css" pulls in on its own, in the
// same cascade order. They are imported separately because its nested
// `@import url("@blocknote/react/style.css")` only resolves through the package
// exports map, which postcss-import cannot follow (rollup's node-resolve can).
// See the matching plugin in rollup.config.mjs, which drops the nested @imports.
import "@blocknote/mantine/style.css";
import "@blocknote/react/style.css";
import "@blocknote/mantine/blocknoteStyles.css";

export interface BlockNoteProps {
    jsonPayload: EditableValue<string>;
    saveAction?: ActionValue;
    saveCaption?: DynamicValue<string>;
    isEditable: boolean;
    themeEnum: string;
    className?: string;
    style?: CSSProperties;
    tabIndex?: number;
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

type LoadState = { state: "loading" } | { state: "ready"; content: PartialBlock[] } | { state: "unreadable" };

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

export function BlockNoteWrapper({
    jsonPayload,
    saveAction,
    saveCaption,
    isEditable,
    themeEnum,
    className,
    style,
    tabIndex
}: BlockNoteProps): ReactElement {
    const [load, setLoad] = useState<LoadState>({ state: "loading" });
    const [isDirty, setIsDirty] = useState(false);
    const [saveError, setSaveError] = useState<string | undefined>(undefined);

    // The exact string the editor currently represents. Lets the load effect
    // tell a genuine external change - the dataview moving to another object, a
    // microflow rewriting the attribute - apart from the echo of our own
    // setValue, which must not tear the editor down under the cursor.
    const syncedValue = useRef<string | undefined>(undefined);

    // Mendix can mark the attribute read-only independently of the widget's own
    // Editable setting (page security, a conditionally read-only dataview), and
    // setValue on a read-only attribute does not stick.
    const canEdit = isEditable && !jsonPayload.readOnly;

    // Loads stored editor contents (https://www.blocknotejs.org/examples/backend/saving-loading)
    // Re-runs whenever the stored value changes underneath us, so switching the
    // surrounding dataview to another object reloads instead of leaving the
    // previous document on screen. Unsaved edits are dropped in that case by
    // design: keeping them would let the next Save write the content of one
    // object onto another.
    useEffect(() => {
        if (!jsonPayload || jsonPayload.status !== "available") {
            return;
        }

        const raw = jsonPayload.value ? jsonPayload.value.toString() : "";

        // undefined means nothing has been loaded yet, so the first run always
        // proceeds. After that an unchanged value is our own setValue echoing
        // back, and reloading on it would drop the cursor mid-edit.
        if (syncedValue.current !== undefined && raw === syncedValue.current) {
            return;
        }

        syncedValue.current = raw;
        setIsDirty(false);
        setSaveError(undefined);
        setLoad(raw ? readStoredDocument(raw) : { state: "ready", content: EMPTY_DOCUMENT });
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

    // Tracks whether there is anything worth saving, so the button can say so
    // instead of always looking clickable. onChange returns its own unsubscribe.
    useEffect(() => {
        if (!editor || editor === "unreadable") {
            return;
        }

        return editor.onChange(() => setIsDirty(true));
    }, [editor]);

    const handleSave = useCallback(() => {
        if (!editor || editor === "unreadable" || jsonPayload.readOnly) {
            return;
        }

        // Already in flight - let it finish rather than queueing a second run.
        if (saveAction && saveAction.isExecuting) {
            return;
        }

        if (saveAction && !saveAction.canExecute) {
            setSaveError("The configured save action cannot be run right now.");
            return;
        }

        // Persist the document in BlockNote's own JSON shape - the exact shape
        // BlockNoteEditor.create({ initialContent }) expects when the widget
        // loads it back. Anything that reshapes the tree here has to be
        // reversed on load, or nesting, link text and table rows are silently
        // dropped on the next read.
        const json = JSON.stringify(editor.document, null, 2);

        syncedValue.current = json;
        jsonPayload.setValue(json);
        setIsDirty(false);
        setSaveError(undefined);

        // The Save Action is optional. Without one the attribute is still
        // written, so an enclosing Mendix save button or a dataview commit
        // picks the value up - previously nothing was written at all.
        if (saveAction) {
            saveAction.execute();
        }
    }, [editor, jsonPayload, saveAction]);

    const rootClassName = classNames("blocknote-mendix-wrapper", "blocknote-mx-" + themeEnum, className);

    if (load.state === "unreadable" || editor === "unreadable") {
        // Deliberately renders neither the editor nor the save toolbar. Falling
        // back to an empty document would look like recovery, but the next Save
        // would then overwrite content that is still sitting intact in the
        // attribute and can be repaired.
        return (
            <div className={rootClassName} style={style} tabIndex={tabIndex}>
                <div className="blocknote-load-error" role="alert">
                    This content could not be opened. It has been left unchanged so that it can be recovered.
                </div>
            </div>
        );
    }

    if (editor === undefined) {
        return (
            <div className={rootClassName} style={style} tabIndex={tabIndex}>
                <div className="blocknote-loading">Loading content...</div>
            </div>
        );
    }

    // Renders the editor instance.
    return (
        <div className={rootClassName} style={style} tabIndex={tabIndex}>
            {canEdit && (
                <BlockNoteSaveToolbar
                    caption={saveCaption && saveCaption.value ? saveCaption.value : "Save"}
                    isDirty={isDirty}
                    isSaving={saveAction ? saveAction.isExecuting : false}
                    error={saveError}
                    onSave={handleSave}
                />
            )}
            <BlockNoteView editor={editor} editable={canEdit} theme={themeEnum === "light" ? "light" : "dark"} />
        </div>
    );
}
