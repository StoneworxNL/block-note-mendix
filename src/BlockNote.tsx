import { ReactElement, createElement } from "react";
import { BlockNoteWrapper } from "./components/BlockNoteWrapper";
import { BlockNoteContainerProps } from "../typings/BlockNoteProps";

import "./ui/BlockNote.css";

export function BlockNote({ jsonPayload, saveAction, isEditable, themeEnum }: BlockNoteContainerProps): ReactElement {
    return <BlockNoteWrapper 
    jsonPayload={jsonPayload}
                saveAction={saveAction}
                isEditable={isEditable}
                themeEnum={themeEnum}
        />;
}
