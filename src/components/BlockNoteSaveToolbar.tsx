import { ReactElement } from "react";

export interface BlockNoteSaveProps {
    caption: string;
    isDirty: boolean;
    isSaving: boolean;
    error?: string;
    onSave: () => void;
}

// Presentational only. Deciding what a save means - whether the attribute is
// writable, whether a Save Action is configured - belongs with the editor state
// in BlockNoteWrapper, not here.
export function BlockNoteSaveToolbar({ caption, isDirty, isSaving, error, onSave }: BlockNoteSaveProps): ReactElement {
    return (
        <div className="blocknote-save-btn">
            {/* type="button" so the widget cannot submit an enclosing form. */}
            <button className="btn mx-button" type="button" onClick={onSave} disabled={!isDirty || isSaving}>
                {caption}
            </button>
            {error && (
                <span className="blocknote-save-error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
