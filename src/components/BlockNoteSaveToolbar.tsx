import { ReactElement } from "react";
import { BlockNoteEditor } from "@blocknote/core";
import { ActionValue, EditableValue } from "mendix";

export interface BlockNoteSaveProps {
    jsonPayload: EditableValue<string>;
    saveAction?: ActionValue;
    editor: BlockNoteEditor;
}

export function BlockNoteSaveToolbar({ jsonPayload, saveAction, editor }: BlockNoteSaveProps): ReactElement {

    const handleSave = () => {
        if (saveAction && !saveAction.isExecuting) {
            if (saveAction.canExecute) {
                // Persist the document in BlockNote's own JSON shape - the exact
                // shape BlockNoteEditor.create({ initialContent }) expects when the
                // widget loads it back in BlockNoteWrapper. Anything that reshapes
                // the tree here has to be reversed on load, or nesting, link text
                // and table rows are silently dropped on the next read.
                jsonPayload.setValue(
                    JSON.stringify(editor.document, null, 2)
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
