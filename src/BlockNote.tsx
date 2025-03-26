import { ReactElement, createElement } from "react";
import { MendixBlockNote } from "./components/MendixBlockNote";

import { BlockNoteContainerProps } from "../typings/BlockNoteProps";

import "./ui/BlockNote.css";

export function BlockNote({ jsonExpression, jsonAttribute, saveAction, isEditable, themeEnum }: BlockNoteContainerProps): ReactElement {
    return <MendixBlockNote 
                jsonExpression={jsonExpression}
                jsonAttribute={jsonAttribute}
                saveAction={saveAction}
                isEditable={isEditable}
                themeEnum={themeEnum}
        />;
}
