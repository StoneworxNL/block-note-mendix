import { ReactElement, createElement } from "react";
import { BlockNoteWrapper } from "./components/BlockNoteWrapper";
import { BlockNoteContainerProps } from "../typings/BlockNoteProps";

import "./ui/BlockNote.css";

export function BlockNote({ jsonPayload, saveAction, isEditable, themeEnum, blocksDataSource, blockId, blockType, contentItemAssociation, contentItemDataSource }: BlockNoteContainerProps): ReactElement {
    return <BlockNoteWrapper 
                jsonPayload={jsonPayload}
                saveAction={saveAction}
                isEditable={isEditable}
                themeEnum={themeEnum}
                // Blocks data source props
                blocksDataSource={blocksDataSource}
                blockId={blockId}
                blockType={blockType}
                // Content item data source props
                contentItemDataSource={contentItemDataSource}
                contentItemAssociation={contentItemAssociation}
        />;
}
