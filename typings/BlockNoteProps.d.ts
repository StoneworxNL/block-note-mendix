/**
 * This file was generated from BlockNote.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, EditableValue, ListValue, ListAttributeValue, ListReferenceValue, ListReferenceSetValue } from "mendix";

export type ThemeEnumEnum = "light" | "dark";

export interface BlockNoteContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    blocksDataSource: ListValue;
    blockId: ListAttributeValue<string>;
    blockType: ListAttributeValue<string>;
    contentItemAssociation: ListReferenceSetValue | ListReferenceValue;
    contentItemDataSource: ListValue;
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
    blocksDataSource: {} | { caption: string } | { type: string } | null;
    blockId: string;
    blockType: string;
    contentItemAssociation: string;
    contentItemDataSource: {} | { caption: string } | { type: string } | null;
    jsonAttribute: string;
    isEditable: boolean;
    saveAction: {} | null;
    themeEnum: ThemeEnumEnum;
}
