/**
 * This file was generated from BlockNote.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, DynamicValue, EditableValue } from "mendix";

export type ThemeEnumEnum = "light" | "green";

export interface BlockNoteContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    jsonExpression: DynamicValue<string>;
    jsonAttribute: EditableValue<string>;
    isEditable: boolean;
    saveAction?: ActionValue;
    themeEnum: ThemeEnumEnum;
}

export interface BlockNotePreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    jsonExpression: string;
    jsonAttribute: string;
    isEditable: boolean;
    saveAction: {} | null;
    themeEnum: ThemeEnumEnum;
}
