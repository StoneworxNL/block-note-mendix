import { ReactElement, createElement, useEffect, useState, useMemo } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteSaveToolbar } from "./BlockNoteSaveToolbar";
import { ActionValue, EditableValue } from "mendix";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

export interface BlockNoteProps {
    jsonPayload: EditableValue<string>;
    saveAction?: ActionValue;
    isEditable: boolean;
    themeEnum: string;
}

export function BlockNoteWrapper({ jsonPayload, saveAction, isEditable, themeEnum }: BlockNoteProps): ReactElement {
    
    const defaultContent = '[{"type": "paragraph","props": {"textColor": "default","backgroundColor": "default","textAlignment": "left"},"content": [],"children": []}]';
    const [initialContent, setInitialContent] = useState<PartialBlock[] | undefined | "loading">("loading");

    // Loads stored editor contents (https://www.blocknotejs.org/examples/backend/saving-loading)
    
    useEffect(() => {
        if (jsonPayload && jsonPayload.status === "available" && initialContent === "loading") {
            setInitialContent((jsonPayload.value
                ? JSON.parse(jsonPayload.value.toString())
                : JSON.parse(defaultContent)) as PartialBlock[]);
        }
    }, [jsonPayload]);

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