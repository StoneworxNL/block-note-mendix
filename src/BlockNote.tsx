import { ReactElement, createElement } from "react";
import { BlockNoteWrapper } from "./components/BlockNoteWrapper";

import { BlockNoteContainerProps } from "../typings/BlockNoteProps";

import "./ui/BlockNote.css";

export function BlockNote({ jsonAttribute, saveAction, isEditable, themeEnum }: BlockNoteContainerProps): ReactElement {
    return <BlockNoteWrapper 
                jsonAttribute={jsonAttribute}
                saveAction={saveAction}
                isEditable={isEditable}
                themeEnum={themeEnum}
        />;
}
