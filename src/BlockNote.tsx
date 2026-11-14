import { ReactElement } from "react";
import { BlockNoteContainerProps } from "../typings/BlockNoteProps";
import { BlockNoteWrapper } from "./components/BlockNoteWrapper";
import "./ui/BlockNote.css";

// class/style/tabIndex are the standard Mendix appearance properties. Pluggable
// widgets are responsible for applying them to their own root element - nothing
// in the platform does it for us - so a Class set in Studio Pro is otherwise
// silently dropped. (mx-name-* is the exception: the platform adds that.)
export function BlockNote({
    class: className,
    style,
    tabIndex,
    jsonPayload,
    saveAction,
    saveCaption,
    isEditable,
    themeEnum
}: BlockNoteContainerProps): ReactElement {
    return (
        <BlockNoteWrapper
            jsonPayload={jsonPayload}
            saveAction={saveAction}
            saveCaption={saveCaption}
            isEditable={isEditable}
            themeEnum={themeEnum}
            className={className}
            style={style}
            tabIndex={tabIndex}
        />
    );
}
