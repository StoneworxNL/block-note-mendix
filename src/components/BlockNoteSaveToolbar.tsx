import { ReactElement, createElement } from "react";
import { BlockNoteEditor } from "@blocknote/core";
import { ActionValue, EditableValue } from "mendix";
import { flattenBlocks, blockFromDocument, flatBlock } from "../typescript/flatten";

export interface BlockNoteSaveProps {
    jsonPayload: EditableValue<string>;
    saveAction?: ActionValue;
    editor: BlockNoteEditor;
}

export function BlockNoteSaveToolbar({ jsonPayload, saveAction, editor }: BlockNoteSaveProps): ReactElement {

    const handleSave = () => {
        let jsonAux: flatBlock[] = [];

        if (saveAction && !saveAction.isExecuting) {
            if (saveAction.canExecute) {
                jsonAux = flattenBlocks(editor.document as blockFromDocument[]);
                jsonPayload.setValue(
                    JSON.stringify(jsonAux, null, 2)
                );
                saveAction.execute();
            } else {
                console.log('Save not possible as Save action cannot be executed.');
            }
        } else {
            console.log('Save not possible as Save action is either unavailable or executing.');
        }
    };

    return (
        <div className="blocknote-save-btn">
            <button className="btn mx-button" onClick={handleSave}>Save</button>
        </div>
    );

}
