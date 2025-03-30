import { ReactElement, createElement, useEffect, useMemo, useState } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { PartialBlock, BlockNoteEditor } from "@blocknote/core";
import { MendixBlockNoteSave } from "./MendixBlockNoteSave";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { DynamicValue, ActionValue, EditableValue } from "mendix";

export interface BlockNoteProps {
    jsonExpression: DynamicValue<string>;
    jsonAttribute: EditableValue<string>;
    saveAction?: ActionValue;
    isEditable: boolean;
    themeEnum: string;
}

export function MendixBlockNote({ jsonExpression, jsonAttribute, saveAction, isEditable, themeEnum }: BlockNoteProps): ReactElement {
    const [initialContent, setInitialContent] = useState<PartialBlock[] | undefined | "loading">("loading");

    // Loads the previously stored editor contents.
    useEffect(() => {
        if (jsonExpression && jsonExpression.status === "available") {
            if (jsonExpression.value)
                setInitialContent(JSON.parse(jsonExpression.value.toString()) as PartialBlock[]);
            else
                setInitialContent(JSON.parse('[{"type": "paragraph","props": {"textColor": "default","backgroundColor": "default","textAlignment": "left"},"content": [],"children": []}]') as PartialBlock[]);
        }
    }, [jsonExpression]);

    // Creates a new editor instance.
    // We use useMemo + createBlockNoteEditor instead of useCreateBlockNote so we
    // can delay the creation of the editor until the initial content is loaded.
    const editor = useMemo(() => {
        if (initialContent === "loading") {
            return undefined;
        }
        return BlockNoteEditor.create({ initialContent });
    }, [initialContent]);

    if (editor === undefined) {
        return <div>Loading content...</div>;
    }

    // Renders the editor instance.
    return (
        <div className={'blocknote-mendix-wrapper' + (themeEnum === 'light' ? '' : ' blocknote-mx-dark')}>
            {isEditable && (
                <MendixBlockNoteSave 
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