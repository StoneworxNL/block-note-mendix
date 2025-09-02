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

export function unflattenBlocks(flatBlocks: flatBlock[]): Block[] {
  const blockMap = new Map<string, Block>();
  const rootBlocks: Block[] = [];

  // First, create all blocks without children
  for (const flat of flatBlocks) {
    blockMap.set(flat.id, {
      id: flat.id,
      type: flat.type,
      props: flat.props,
      content: [], // will be filled later
      children: [],
    });
  }

  // Then, assign children and content
  for (const flat of flatBlocks) {
    const block = blockMap.get(flat.id)!;

    // Reconstruct content tree
    block.content = unflattenContent(flat.content);

    if (flat.parentId) {
      const parent = blockMap.get(flat.parentId);
      parent?.children?.push(block);
    } else {
      rootBlocks.push(block);
    }
  }

  return rootBlocks;
}

function unflattenContent(flatContent: FlatContentItem[]): ContentItem[] {
  const contentMap = new Map<string, ContentItem>();
  const rootContent: ContentItem[] = [];

  // Create all content items
  for (const flat of flatContent) {
    contentMap.set(flat.id, {
      type: flat.type,
      text: flat.text,
      href: flat.href,
      content: [],
    });
  }

  // Assign children
  for (const flat of flatContent) {
    const item = contentMap.get(flat.id)!;

    if (flat.parentContent) {
      const parent = contentMap.get(flat.parentContent);
      parent?.content?.push(item);
    } else {
      rootContent.push(item);
    }
  }

  return rootContent;
}
