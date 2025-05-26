import { ReactElement, createElement, useMemo } from "react";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteSaveToolbar } from "./BlockNoteSaveToolbar";
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

export function BlockNoteWrapper({ jsonExpression, jsonAttribute, saveAction, isEditable, themeEnum }: BlockNoteProps): ReactElement {
    const defaultContent = '[{"type": "paragraph","props": {"textColor": "default","backgroundColor": "default","textAlignment": "left"},"content": [],"children": []}]';

    // Creates a new editor instance.
    // We use useMemo + createBlockNoteEditor instead of useCreateBlockNote so we
    // can delay the creation of the editor until the initial content is loaded.
    const editor = useMemo(() => {
        
        if (!jsonExpression || jsonExpression.status !== "available")
            return undefined;
    
        const content = jsonExpression.value
            ? JSON.parse(jsonExpression.value.toString())
            : JSON.parse(defaultContent);
    
        return BlockNoteEditor.create({ initialContent: content });
    }, [jsonExpression]);


    if (editor === undefined) {
        return <div>Loading content...</div>;
    }

    // Renders the editor instance.
    return (
        <div className={'blocknote-mendix-wrapper' + (themeEnum === 'light' ? '' : ' blocknote-mx-dark')}>
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